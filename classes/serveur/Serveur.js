/*
 * Serveur.js
 */

"use strict";

/** Module permettant de créer un serveur HTTP. */
const HTTP = require("http");

/** Module permettant de parser des URls. */
const URL = require("url");

/** Fonctions utilitaires. */
const Utils = require("../utils/Utils");

/** Les contantes de l'application. */
const Constantes = require("../utils/Constantes");

/**
 * Représente le serveur NodeJS pour envoyer des photos du parking.
 * @type {Serveur}
 */
module.exports = class Serveur {

    /**
     * Créé le serveur.
     */
    constructor() {
        this.serveur = HTTP.createServer((requete, reponse) => {

            // Parse l'url.
            let urlObj = URL.parse(requete.url);

            // Photo ?
            if (urlObj.pathname == "/photo") {

                // Met en place les en-têtes HTTP pour renvoyer une image.
                reponse.setHeader("Content-Type", "image/png");

                // Prend la photo.
                while (!Utils.prendrePhoto(Constantes.IMAGE_PREVIEW)) {
                    console.error(
                        "Impossible de prendre la photo " +
                        Constantes.IMAGE_PREVIEW);
                }

                // Lis la photo prise.
                let photo = Utils.lireFichier(Constantes.IMAGE_PREVIEW);

                // Envoie la photo.
                reponse.end(photo);

            } else {

                // Met l'encoding.
                reponse.setHeader("encoding", "utf-8");

                // On ne connaît pas cette requête :(
                reponse.statusCode = 404;

                // On envoie 404.
                reponse.end("Requête inconnue :(");
            }
        });
    }

    /**
     * Démarre le serveur.
     */
    demarrer() {
        this.serveur.listen(Constantes.PORT_SERVEUR,
                            Constantes.ADRESSE_SERVEUR);
    }
};