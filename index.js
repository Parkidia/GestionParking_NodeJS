/*
 * index.js
 */

"use strict";

/** Module gérant l'analyse. */
const Analyseur = require("./classes/analyseur/Analyseur");

// Démarre l'analyseur.
let analyseur = new Analyseur();

// Initialisation.
analyseur.initialiser();

// Démarrage de l'analyse !
analyseur.demarrerAnalyse();