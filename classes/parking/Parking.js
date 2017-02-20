/*
 * Parking.js
 */

"use strict";

/** Les places de parking. */
const Place = require("./Place");

/**
 * Représente une parking composé de places.
 * @type {Parking}
 */
module.exports = class Parking {

    /**
     * Créé un parking avec le JSON de ses places.
     * @param placesJSON le JSON des places du parking.
     */
    constructor(placesJSON) {
        this.places = [];

        // Créé les objets places.
        for (let place of placesJSON) {
            this.places.push(new Place(place.nom, place.minX, place.minY,
                place.maxX, place.maxY, place.dispo, place.couleurVoiture));
        }
    }

    /**
     * @return {Array} les places du parking.
     */
    get getPlaces() {
        return this.places;
    }
};