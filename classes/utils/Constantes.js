/*
 * Constantes.js
 */

"use strict";

/** Dossier où sont sauvegardées les images. */
const DOSSIER_IMG = "./images/";

module.exports = {

    /** Taux de différence entre deux états d'une place. */
    TAUX_CHANGEMENT: 50,

    /** Taux auxquel on considère un pixel qui change de couleur. */
    TAUX_TOLERANCE_PIXEL: 0.3,

    /** L'image de référence où sont faites les analyses. */
    IMAGE_REFERENCE: DOSSIER_IMG + "reference.png",

    /**
     * L'image intermédiaire servant de filtre lors du positionnement
     * du véhicule en train de se garer.
     */
    IMAGE_INTERMEDIAIRE: DOSSIER_IMG + "inter.png",

    /** L'image à l'instant T du parking qui va être analysée. */
    IMAGE_ANALYSE: DOSSIER_IMG + "analyse.png",

    /** L'image de preview du parking que le serveur prend pour envoyer au JEE. */
    IMAGE_PREVIEW: DOSSIER_IMG + "preview.png",

    /** Largeur des photos prises. */
    LARGEUR_PHOTO: 640,

    /** Hauteur des photos prises. */
    HAUTEUR_PHOTO: 512,

    /**
     * Degrès de rotation de la caméra pour obtenir une image dans
     * la bonne orientation.
     */
    ROTATION_PHOTO: 180,

    /**
     * Angle en degrès pour tourner l'image prise afin
     * de coller au mieux aux places.
     */
    ROTATION_IMAGE: 3,

    /** Le temps de prise d'une photo (en ms). */
    TEMPS_PRISE_PHOTO: 1000,

    /** Temps d'attente entre chaque analyse (en ms). */
    TEMPS_ATTENTE: 5,

    /**
     * Le temps qui doit passer entre l'envoie de chaque photo
     * au serveur JEE.
     */
    TEMPS_ENTRE_ENVOIE_PHOTO: 30,

    /** Format dans leqel la photo est prise. */
    FORMAT_PRISE_PHOTO: "png",

    /** Le fichier contenant les places et leurs états. */
    FICHIER_PLACES: "parking.json",

    /** Le port sur lequel le serveur doit écouter. */
    PORT_SERVEUR: 8080,

    /** L'adresse du serveur. */
    ADRESSE_SERVEUR: "localhost",

    /** Adresse du serveur JEE. */
    SERVEUR_JEE: "http://192.168.1.11:8080/GestionParking_war_exploded/",

    /** Clé autorisant ce Raspberry à modifier l'état de ce parking. */
    CLE_PARKING: "6ede19b4-eb23-4fba-a42a-7514caaa1a6f",

    /** L'identifiant du parking que la Raspberry analyse. */
    ID_PARKING: "1"
};