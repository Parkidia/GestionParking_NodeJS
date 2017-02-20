/*
 * Place.js
 */

"use strict";

/**
 * Représente une place de parking.
 * @type {Place}
 */
module.exports = class Place {

    /**
     * Créé une nouvelle place de parking.
     * @param nom le nom de la place.
     * @param minX le coin supérieur gauche de la place sur une photo du
     *     parking.
     * @param minY le coin inférieur gauche de la place sur une photo du
     *     parking.
     * @param maxX le coin supérieur droit de la place sur une photo du
     *     parking.
     * @param maxY le coin inférieur droit de la place sur une photo du
     *     parking.
     * @param dispo si la place est disponible ou non.
     * @param couleurVoiture la couleur de la voiture présente sur la place
     *     (RGB).
     */
    constructor(nom, minX, minY, maxX, maxY, dispo, couleurVoiture) {
        this.nom = nom;
        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;

        // Par défaut elle est disponible, elle n'a pas de voiture dessus.
        this.dispo = dispo;
        this.couleurVoiture = couleurVoiture;
    }

    /**
     * Change d'état cett place de parking (si elle était disponible, la passe
     * indisponible et inversemment).
     * @param couleurVoiture la couleur de la voiture sur cette place si elle
     *     passe indisponible.
     */
    changerEtat(couleurVoiture) {
        // Change état.
        this.dispo = !this.dispo;

        // Sauvegarde la couleur de la voiture.
        if (this.dispo) {
            this.couleurVoiture = null;
        } else {
            this.couleurVoiture = couleurVoiture;
        }
    }
};