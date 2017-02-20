/*
 * Analyseur.js
 */

"use strict";

/** Permet d'envoyer des requêtes HTTP. */
const Request = require("request");

/** Module permettant d'effectuer des attentes. */
const Sleep = require("sleep").sleep;

/** Représente un parking. */
const Parking = require("../parking/Parking");

/** Fonctions utilitaires. */
const Utils = require("../utils/Utils");

/** Les contantes de l'application. */
const Constantes = require("../utils/Constantes");

/**
 * Représente l'analyseur de parkings.
 * @type {Analyseur}
 */
module.exports = class Analyseur {

    /** Créé un nouvel analyseur. */
    constructor() {
    }

    /**
     * Initialise l'analyseur.
     */
    initialiser() {
        console.log("Initialisation ...");

        // Supprime les photos.
        Utils.supprimerFichier(Constantes.IMAGE_REFERENCE);
        Utils.supprimerFichier(Constantes.IMAGE_INTERMEDIAIRE);
        Utils.supprimerFichier(Constantes.IMAGE_ANALYSE);

        // Initialise le parking.
        this.parking = new Parking(JSON.parse(
            Utils.lireFichier(Constantes.FICHIER_PLACES)));

        // Prend l'image référence.
        while (!Utils.prendrePhoto(Constantes.IMAGE_REFERENCE)) {
            console.error(
                "Impossible de prendre la photo " + Constantes.IMAGE_REFERENCE);
        }

        console.log("Initialisation terminée");
    }

    /**
     * Démarre une nouvelle analyse du parking (méthode récursive se rappelant
     * elle-même).
     */
    demarrerAnalyse() {
        console.log("\nDémarrage d'une analyse ...");

        // Pour déterminer le temps d'une analyse.
        let prec = new Date().getTime();

        // Prend la photo à analyser.
        while (!Utils.prendrePhoto(Constantes.IMAGE_ANALYSE)) {
            console.error(
                "Impossible de prendre la photo " + Constantes.IMAGE_ANALYSE);
        }

        console.log(Constantes.IMAGE_ANALYSE + " a été prise.");

        // On compare la photo à analyser avec la photo de référence.
        let compRefAnalyse = this.comparer(Constantes.IMAGE_REFERENCE,
                                           Constantes.IMAGE_ANALYSE);

        // Pas égales ?
        if (compRefAnalyse.length != 0) {
            console.log("\n" + Constantes.IMAGE_ANALYSE + " != " +
                        Constantes.IMAGE_REFERENCE +
                        " => démarrage d'une analyse intermédiaire");

            // Si l'image intermédiaire est égal à l'image à analyser.
            let interEgalAnalyse = false;

            /*
             * Tant que l'image intermédiaire, n'est pas égal à celle à
             * analyser.
             */
            while (!interEgalAnalyse) {
                console.log("\tQuelqu'un est en train de se garer !");

                // L'image d'analyse devient l'image intermédiaire.
                Utils.renommerFichier(Constantes.IMAGE_ANALYSE,
                                      Constantes.IMAGE_INTERMEDIAIRE);

                // Prend la photo à analyser.
                while (!Utils.prendrePhoto(Constantes.IMAGE_ANALYSE)) {
                    console.error(
                        "\tImpossible de prendre la photo " +
                        Constantes.IMAGE_ANALYSE);
                }

                // Compare la photo à analyser avec la photo intermédiaire.
                let compInterAnalyse = this.comparer(
                    Constantes.IMAGE_INTERMEDIAIRE,
                    Constantes.IMAGE_ANALYSE);

                // Photo intermédiaire == photo analyse.
                if (compInterAnalyse.length == 0) {

                    // On re-compare l'image à analyser avec celle de référence.
                    let reCompRefAnalyse = this.comparer(
                        Constantes.IMAGE_REFERENCE,
                        Constantes.IMAGE_ANALYSE);

                    /*
                     * Si ces deux images sont différentes.
                     * => on effectue la mise à jour des places.
                     */
                    if (reCompRefAnalyse.length != 0) {
                        console.log("\tChangement ! Mise à jour des places ...");

                        // Pour toutes les places qui ont changées.
                        for (let changement of reCompRefAnalyse) {

                            // On change leurs états.
                            this.parking.getPlaces[changement[0]].changerEtat(
                                changement[1]);

                            // On envoie le changement au serveur JEE.
                            this.envoyerStatut(
                                this.parking.getPlaces[changement[0]]);
                        }

                        // On sauvegarde le changement dans le fichier.
                        Utils.ecrireFichier(Constantes.FICHIER_PLACES,
                                            JSON.stringify(
                                                this.parking.getPlaces));

                        // La photo à analyser devien celle de référence.
                        Utils.renommerFichier(Constantes.IMAGE_ANALYSE,
                                              Constantes.IMAGE_REFERENCE);
                    }

                    // La personne est garée, on sort de la boucle.
                    console.log("\tLa personne est garée.");
                    interEgalAnalyse = true;

                } else {

                    /*
                     * Photo intermédiaire différente de celle à analyser.
                     * => On refait une itération de la boucle.
                     * => L'image à analyser devient l'image intermédiaire.
                     */
                    Utils.renommerFichier(Constantes.IMAGE_ANALYSE,
                                          Constantes.IMAGE_INTERMEDIAIRE);
                }
            }
        }

        // L'image analysée devient celle de référence.
        Utils.renommerFichier(Constantes.IMAGE_ANALYSE,
                              Constantes.IMAGE_REFERENCE);

        console.log("Fin de l'analyse");
        console.log("Durée : " + Math.abs(new Date().getTime() - prec) + " ms");
        console.log("Attente avant la prochaine analyse ...");

        // On attend.
        Sleep(Constantes.TEMPS_ATTENTE);

        // On redémarre une analyse.
        this.demarrerAnalyse();
    }

    /**
     * Compare deux images dont le chemin est passé en argument.
     * @param image1 la première image à comparer.
     * @param image2 la seconde image à comparer.
     * @return {Array} les résultats de la comparaison (tableau vide si les
     *     deux images sont égales).
     */
    comparer(image1, image2) {
        let pixelsImg1 = Utils.getPixelsImage(image1);
        let pixelsImg2 = Utils.getPixelsImage(image2);

        let res = [];

        // Boucle principale.
        for (let i = 0; i < this.parking.getPlaces.length; i++) {
            let tauxDifference = this.tauxDifference(pixelsImg1,
                                                     pixelsImg2, i);

            if (tauxDifference[0] > Constantes.TAUX_CHANGEMENT) {
                res.push([i, tauxDifference[1]]);
            }
        }

        return res;
    }

    /**
     * Détermine le taux de changement des pixels d'une place.
     * @param pixelsRef tableau de pixel de l'image de référence.
     * @param pixelsAnalyse tableau de pixel de l'image d'analyse.
     * @param pixelCourant
     * @return [*] taux de changement.
     */
    tauxDifference(pixelsRef, pixelsAnalyse, pixelCourant) {
        // Coordonnées des places.
        let placeMinX = this.parking.getPlaces[pixelCourant].minX;
        let placeMinY = this.parking.getPlaces[pixelCourant].minY;
        let placeMaxX = this.parking.getPlaces[pixelCourant].maxX;
        let placeMaxY = this.parking.getPlaces[pixelCourant].maxY;

        let largeurPlace = placeMaxX - placeMinX;
        let hauteurPlace = placeMaxY - placeMinY;

        // Nombre de pixels par places.
        let nbPixelsPlace = largeurPlace * hauteurPlace;

        // Nombre de pixels changés.
        let nombrePixelChanges = 0;

        /*
         * Le trait pour analyser le centre de la place et déterminer
         * la couleur de la voiture.
         */
        let traitAnalyse = [
            Number(placeMinX + largeurPlace * 0.4).toFixed(0),
            Number(placeMaxX + largeurPlace * 0.6).toFixed(0)
        ];

        // Couleur de la voiture.
        let couleur = [0, 0, 0];

        // Parse tout le tableau contenant les pixels.
        for (let offsetY = placeMinY; offsetY < placeMaxY; offsetY++) {
            for (let offsetX = placeMinX; offsetX < placeMaxX; offsetX++) {

                // Moyenne des rouges, vert, bleu.
                let moyenneCouleurRef = (pixelsRef.get(offsetX, offsetY, 0)
                                         + pixelsRef.get(offsetX, offsetY, 1)
                                         + pixelsRef.get(offsetX, offsetY, 2)) /
                                        3.0;
                let moyenneCouleurAnalyse = (pixelsAnalyse.get(offsetX, offsetY,
                                                               0) +
                                             pixelsAnalyse.get(offsetX, offsetY,
                                                               1) +
                                             pixelsAnalyse.get(offsetX, offsetY,
                                                               2)) / 3.0;

                // Pixel a changé ?
                if (moyenneCouleurAnalyse <
                    (moyenneCouleurRef *
                     (1 - Constantes.TAUX_TOLERANCE_PIXEL))
                    || moyenneCouleurAnalyse >
                       (moyenneCouleurRef *
                        (1 + Constantes.TAUX_TOLERANCE_PIXEL))) {
                    nombrePixelChanges++;
                }

                // Couleur moyenne de la place.
                if (offsetX >= traitAnalyse[0] && offsetX <= traitAnalyse[1]) {
                    couleur[0] =
                        (couleur[0] + pixelsAnalyse.get(offsetX, offsetY, 0))
                        / 2;
                    couleur[1] =
                        (couleur[1] + pixelsAnalyse.get(offsetX, offsetY, 1))
                        / 2;
                    couleur[2] =
                        (couleur[2] + pixelsAnalyse.get(offsetX, offsetY, 2))
                        / 2;
                }
            }
        }

        return [
            nombrePixelChanges * 100 / nbPixelsPlace,
            Number(couleur[0]).toFixed(0) + ", " +
            Number(couleur[1]).toFixed(0) + ", " +
            Number(couleur[2]).toFixed(0)
        ];
    }

    /**
     * Envoie le statut d'une place au serveur JEE.
     * @param place la place dont on veut envoyer le statut au serveur.
     */
    envoyerStatut(place) {
        console.log("Envoie au serveur JEE du statut de la place " + place.nom +
                    " ...");
        Request.post(
            Constantes.SERVEUR_JEE + "place/ajouterStatut/" +
            Constantes.ID_PARKING + "/" + Constantes.CLE_PARKING + "/" +
            place.nom + "/" + place.dispo + "/" + place.couleurVoiture,
            (error, response, body) => {
                if (error) {
                    console.error("Impossible de se connecter au serveur");
                } else if (response.statusCode != 200) {
                    console.error(
                        "Code " + response.statusCode + " : " + body);
                } else {
                    console.log("Statut envoyé !");
                }
            });
    }
};