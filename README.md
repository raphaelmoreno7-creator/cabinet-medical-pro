# Cabinet Médical Pro V5 — Simulation de jeu

Logiciel de cabinet médical fictif pour jouer au docteur avec Raphaël, Jade et Victoria.

## Connexion
- Raphaël : `2012`
- Jade : `2017`
- Victoria : `2017`

## V5 — Alimentation et activité physique
- Saisie de la journée par repas : petit-déjeuner, déjeuner/brunch, goûter, dîner/souper, grignotage.
- Présentation inspirée de la saisie montrée dans les captures de référence.
- Base locale étendue d'aliments et de plats.
- Recherche mondiale facultative via l'API Open Food Facts pour trouver davantage de produits.
- Création d'un aliment ou d'un plat personnalisé.
- Portions et estimation énergétique par portion.
- Choix du niveau d'activité physique en 5 niveaux, inspiré de la référence fournie.
- Taille, poids, date de naissance et sexe dans le dossier patient pour permettre une estimation pédagogique des besoins énergétiques.
- Pyramide alimentaire personnalisée.
- Statistiques par catégorie alimentaire.
- Comparaison apports saisis / besoins énergétiques estimés.
- Affichage de ces informations dans la consultation.
- Téléchargement de la consultation avec alimentation, statistiques et pyramide.

### Recherche mondiale
Le bouton « Recherche mondiale » interroge Open Food Facts lorsqu'une connexion Internet est disponible. Open Food Facts fournit une API et des données ouvertes ; ses conditions indiquent notamment qu'un User-Agent personnalisé doit être utilisé pour les appels d'API et que des limites de débit existent. Cette version utilise donc cette recherche comme complément, avec la base locale comme solution de secours.

## Installation
Remplacer dans GitHub :
- `index.html`
- `style.css`
- `app.js`
- `README.md`

Puis faire **Commit changes**.

## Important
Tout est conçu pour un jeu et une simulation. Les dossiers, diagnostics, prescriptions, aliments, besoins énergétiques et calculs ne doivent pas être utilisés comme données ou conseils médicaux réels.

La recherche alimentaire en ligne utilise Open Food Facts : https://world.openfoodfacts.org/
