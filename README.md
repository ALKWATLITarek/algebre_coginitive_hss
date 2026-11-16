# Expérience : représentations visuelles et algèbre

Site statique pour une étude de cognition. HTML, CSS et JavaScript, sans dépendances ni compilation.

## Mettre en ligne sur GitHub Pages

1. Créer un dépôt GitHub, par exemple `visualisation-algebre`.
2. Décompresser l’archive et déposer **son contenu à la racine du dépôt** avec **Add file → Upload files**. Le fichier `index.html` doit être à la racine, pas dans un sous-dossier.
3. Dans **Settings → Pages**, choisir **Deploy from a branch**, la branche **main**, le dossier **/(root)**, puis **Save**.

L’adresse du site apparaît dans la rubrique Pages. Transmettre cette adresse aux participants ; ajouter `chercheur.html` à l’adresse pour la préparation et les imports.

Le fichier `.nojekyll` est fourni pour servir les fichiers statiques directement. Aucun workflow GitHub Actions à écrire, aucune commande npm à lancer. La même copie fonctionne chez n’importe quel hébergeur de fichiers statiques.

Documentation officielle : https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Ouvrir en local

Double-cliquer sur `index.html` pour une passation, ou sur `chercheur.html` pour une démonstration. Garder les fichiers ensemble. Pour tester avec un serveur local, Python suffit :

```bash
python -m http.server 8000
```

Puis ouvrir `http://localhost:8000/`.

## Les deux entrées

| Fichier | Usage |
|---|---|
| `index.html` | Information, consentement et passation. Aucun schéma avant l’attribution. |
| `chercheur.html` | Démonstrations des deux conditions, documents, import et export CSV. |
| `app.js` | Déroulement, chronométrage et sauvegarde locale. |
| `core.js` | Permutations, questions, corrigé et format CSV. |
| `style.css` | Présentation sobre de l’expérience. |
| `analysis/` | Script Python et dépendances pour l’analyse des CSV. |
| `docs/` | Protocole, dictionnaire et corrigé. |

La page expérimentateur n’est pas un espace authentifié. Les données qu’elle affiche sont uniquement celles de son propre navigateur et les CSV importés ; elles ne sont pas publiées dans le dépôt ou sur un serveur.

## Avant de recruter

Au début de `app.js`, compléter les trois champs de `STUDY_INFO` :

```javascript
const STUDY_INFO={
  contact:'Votre nom et moyen de contact',
  conservation:'Date ou durée retenue',
  remise:'Comment remettre le CSV à l’expérimentateur'
};
```

Ces informations apparaîtront avant le consentement. Faire 3 à 5 démonstrations techniques, puis figer la version avant la collecte. Une démo saute les temps d’attente et porte un indicateur qui l’exclut des analyses.

## Protocole conservé

- Attribution aléatoire, à probabilité 1/2, à une condition symbolique ou accompagnée de schémas.
- Prétest : 6 questions ; apprentissage : 6 pages d’au moins 45 secondes visibles ; test final : 12 questions ; transfert à quatre éléments : 4 questions.
- Tests sans schémas ; pas de correction intermédiaire.
- Réponses et temps enregistrés localement. Aucune transmission automatique.
- Export CSV en fin de séance ; copie JSON facultative.

Interface simplifiée 1.1. Le protocole et la banque de questions restent en version 1.0.0 ; les exercices et les critères d’analyse sont conservés.

## Collecte et analyse

Chaque participant télécharge son CSV et le remet manuellement. Réunir les originaux dans `collecte/`. La page `chercheur.html` permet de les importer et de détecter les doublons. Le stockage du navigateur est une aide ; conserver les CSV téléchargés.

L’hébergement sur GitHub Pages ne fournit pas de base de données : les participants ne peuvent pas envoyer leurs réponses automatiquement au chercheur avec cette version.

```bash
python -m pip install -r analysis/requirements.txt
python analysis/analyse.py collecte/participant1.csv collecte/participant2.csv --output resultats
```

Dans PowerShell, pour tous les CSV :

```powershell
$csv = (Get-ChildItem .\collecte\*.csv).FullName
python .\analysis\analyse.py @csv --output .\resultats
```

Le script produit un rapport, les scores par participant, les estimations JSON et un graphique. Le critère principal est le score au test final. L’unité statistique est le participant. Les démonstrations et passations incomplètes sont exclues. Le protocole détaillé précise le test de permutation, l’incertitude et les limites.

Les dossiers `collecte/` et `resultats/`, ainsi que les CSV et JSON de réponses, sont ignorés par Git pour garder le dépôt centré sur le code et la documentation.

## Vérifications facultatives

Le site n’a besoin ni de Node.js ni de Python pour fonctionner. Ces commandes servent uniquement à vérifier le code :

```bash
node tests/core.test.cjs
python -m unittest discover -s tests -p '*_test.py'
```
