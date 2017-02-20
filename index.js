/*
 * index.js
 */

"use strict";

/** Module gérant l'analyse. */
const Analyseur = require("./classes/analyseur/Analyseur");

/** Module gérant le serveur. */
const Serveur = require('./classes/serveur/Serveur');

// Créé le serveur.
let serveur = new Serveur();

// Démarre l'analyseur.
let analyseur = new Analyseur();

// Initialisation.
analyseur.initialiser();

// Démarre le serveur.
serveur.demarrer();

// Démarrage de l'analyse !
analyseur.demarrerAnalyse();