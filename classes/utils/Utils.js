/*
 * Utils.js
 */

"use strict";

/**
 * Module permettant d'exécuter des commandes Bash avec
 * des fonction synchrones.
 */
const SpawnSync = require("child_process").spawnSync;

/** Module permettant de gérer les I/O avec des fichiers. */
const FS = require("fs");

/** Librairie permettant de transformer une photo en tableau 2 dim de pixels.*/
const GetPixels = require("get-pixels");

/** Module permettant de rendre une fonction asynchrone, synchrone. */
const DeAsync = require("deasync").sleep;

/** Les contantes de l'application. */
const Constantes = require("./Constantes");

/** Si la caméra de la Raspberry est actuellement libre. */
var CameraLibre = true;

/**
 * Contient des fonctions utilitaires.
 * @type {{}}
 */
module.exports = {

    /**
     * Lis le fichier dont le chemin est passé en argument.
     * @param fichier le chemin du fichier à lire.
     * @return string le contenu du fichier.
     */
    "lireFichier": function (fichier) {
        return FS.existsSync(fichier) ? FS.readFileSync(fichier) : "undefined";
    },

    /**
     * Créé un flot de lecture pour le fichier dont le chemin est passé en
     * argument et le retourne.
     * @param fichier le chemin du fichier.
     * @return le flot de lecture créé.
     */
    "flotLecture": function (fichier) {
        return FS.createReadStream(fichier);
    },

    /**
     * Ecrit dans un fichier dont le chemin est passé en argument.
     * @param fichier le chemin du fichier.
     * @param donnees les données à écrire.
     */
    "ecrireFichier": function (fichier, donnees) {
        FS.writeFileSync(fichier, donnees);
    },

    /**
     * Supprime le fichier dont le chemin est passé en argument.
     * @param fichier le chemin du fichier à supprimer.
     */
    "supprimerFichier": function (fichier) {
        if (FS.existsSync(fichier)) {
            FS.unlinkSync(fichier);
        }
    },

    /**
     * Renomme un fichier.
     * @param ancien l'ancien nom du fichier.
     * @param nouveau le nouveau nom du fichier.
     */
    "renommerFichier": function (ancien, nouveau) {
        if (FS.existsSync(ancien)) {
            FS.renameSync(ancien, nouveau);
        }
    },

    /**
     * Prend une photo avec la Raspberry Pi.
     * @param dest le chemin ou sauvegarder la photo.
     * @return {boolean} True si la photo a bien été prise, False sinon.
     */
    "prendrePhoto": function (dest) {
        // Si la caméra est libre.
        if (CameraLibre) {

            // Marque la caméra comme prise.
            CameraLibre = false;

            // Prend la photo
            let statut = SpawnSync("raspistill", [
                "-rot", Constantes.ROTATION_PHOTO, "-w",
                Constantes.LARGEUR_PHOTO,
                "-h", Constantes.HAUTEUR_PHOTO, "-t",
                Constantes.TEMPS_PRISE_PHOTO,
                "-n", "-e", Constantes.FORMAT_PRISE_PHOTO, "-o", dest
            ]).status;

            // Libère la caméra.
            CameraLibre = true;

            // Retourne le statut.
            return statut == "0";
        } else {
            return false;
        }
    },

    /**
     * Effectue une rotation sur la photo.
     * @param photo le chemin de la photo à tourner.
     * @return {boolean} True si la photo a bien été tournée, False sinon.
     */
    "tournerPhoto": function (photo) {
        return SpawnSync("gm", [
                "convert", "-rotate", Constantes.ROTATION_IMAGE,
                "-background", "black",
                "-fill", "black", photo, photo
            ]).status == "0"
    },

    /**
     * Retourne un tableau des pixels d'une image dont le chemin est passé en
     * argument.
     * @param image le chemin vers l'image.
     * @return ndarray un tableau contenant les pixels de l'image.
     */
    "getPixelsImage": function (image) {
        let pixels;

        GetPixels(image, (err, pixelsImage) => {
            pixels = pixelsImage;
        });

        // On attend que GetPixels ai finis.
        while (pixels === undefined) {
            DeAsync(100);
        }

        return pixels;
    }
};