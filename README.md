# Visualisation et raisonnement algébrique

**Projet logiciel — HSS_51H05_EP : Approches expérimentales de la cognition**  
**École polytechnique — Ingénieur 3A / Master 1 — Année 2026-2027**  
**Auteur : Tarek Marc Al Kwatli**

Ce projet correspond à la seconde modalité d’évaluation du cours : programmer une expérience cognitive portable, la faire passer à quelques personnes et analyser les résultats. Le dépôt rassemble le programme expérimental, son protocole et ce rapport.

**État du projet :** programme disponible ; collecte et résultats empiriques à compléter. Les essais techniques et démonstrations ne constituent pas une collecte de participants.

## 1. But de l’expérience

L’objectif est d’étudier l’effet d’une représentation visuelle sur le raisonnement avec des objets algébriques. Une même permutation peut être décrite par des images de nombres ou représentée par une transformation d’un triangle numéroté.

La question expérimentale est la suivante : **un apprentissage accompagné de schémas améliore-t-il la résolution ultérieure de problèmes de permutations, lorsque les schémas ne sont plus disponibles ?**

Le projet porte sur les permutations de trois éléments, qui correspondent aux symétries d’un triangle équilatéral. Un test sur quatre éléments explore ensuite un transfert proche. Il s’agit d’une expérience comportementale : on mesure des réponses et des temps, sans mesurer directement l’imagerie mentale ou l’activité cérébrale.

### Référence scientifique

Zazkis, Dubinsky et Dautermann (1996) ont étudié les stratégies visuelles et analytiques d’étudiants travaillant sur les symétries du carré. Leur étude qualitative sert de point de départ pour articuler représentations géométriques et calcul sur des permutations. Le présent projet propose une comparaison expérimentale distincte ; cette référence ne démontre pas l’efficacité de l’intervention utilisée ici.

### Hypothèses

- **Hypothèse principale :** les participants ayant reçu les schémas obtiennent un meilleur score au test final symbolique que ceux ayant reçu uniquement les explications symboliques.
- **Explorations :** examiner le transfert à quatre éléments, les temps de réponse et les stratégies déclarées. Ces mesures ne constituent pas des tests confirmatoires supplémentaires.

## 2. Méthode

### Participants

Le cours demande de faire passer l’expérience à **une dizaine de personnes au minimum**. La collecte doit donc comprendre au moins dix participants réels, hors démonstrations et essais techniques, en recherchant une représentation des deux conditions.

Le protocole détaillé envisage un pilote de 40 adultes lorsque le recrutement le permet. Cette cible est distincte du minimum pédagogique et ne résulte pas d’un calcul de puissance. Un petit effectif peut conduire à une estimation très incertaine.

Le recrutement vise des adultes volontaires lisant les consignes françaises, de préférence peu familiers de la théorie des groupes. La formation mathématique et la familiarité avec les permutations sont recueillies avant la tâche. Les personnes déjà randomisées ne sont pas exclues en fonction de leur niveau ou de leurs performances.

**À documenter après la collecte :** mode de recrutement, nombre de participants, formation, familiarité, dates, matériel utilisé et éventuels incidents.

### Plan expérimental

Le plan comporte deux groupes indépendants. Après consentement, chaque participant est attribué aléatoirement à une condition, avec une probabilité de 1/2. Les effectifs peuvent donc être inégaux.

| Condition | Apprentissage | Évaluation |
|---|---|---|
| Symbolique | Explications, permutations numériques et exemples calculés | Questions sans schémas |
| Visuelle | Mêmes explications et exemples, accompagnés de triangles numérotés | Mêmes questions, sans schémas |

Les consignes, exemples et durées minimales sont communs. Chaque page d’apprentissage doit rester visible au moins 45 secondes ; un onglet masqué ne compte pas dans ce minimum. Les durées réelles sont enregistrées et peuvent dépasser ce seuil.

### Déroulement

| Étape | Contenu | Mesures |
|---|---|---|
| Information et consentement | Présentation neutre, formation et familiarité | Métadonnées de passation |
| Prétest | 6 questions : composition, inverse et ordre | Réponses et temps |
| Apprentissage | 6 pages, avec ou sans schémas | Exposition visible par page |
| Test final | 12 questions sur trois éléments, sans figures | Score principal et temps |
| Transfert | 4 questions sur quatre éléments, sans figures | Score exploratoire et temps |
| Questionnaire et fin | Stratégie, confiance, difficulté, débriefing | Réponses déclaratives et CSV |

La durée indicative totale est de 12 à 18 minutes. L’ordre des questions et des choix est mélangé. Aucune correction n’est fournie entre les questions. Les participants travaillent seuls, sans calculatrice, brouillon ni aide extérieure.

La notation `[a, b, c]` donne les images de 1, 2 et 3. Dans `p ∘ q`, on applique `q` puis `p`. Une consigne commune explique la composition, l’inverse et l’ordre avant le prétest.

Le [protocole détaillé](docs/PROTOCOLE.md) précise le plan ; la [banque corrigée](docs/BANQUE_CORRIGEE.md) documente les exercices pour l’expérimentateur.

## 3. Exécuter le programme

L’expérience est un site statique en HTML, CSS et JavaScript. Elle fonctionne dans un navigateur récent, sans installation de bibliothèque ni compilation.

| Entrée | Usage |
|---|---|
| `index.html` | Information, consentement et passation réelle |
| `chercheur.html` | Démonstrations des deux conditions et gestion locale des CSV |

Pour une exécution locale, télécharger le dépôt et ouvrir `index.html`. Garder tous les fichiers dans le même dossier. Pour vérifier rapidement le parcours, ouvrir `chercheur.html` et choisir une démonstration : l’attente y est désactivée et les données sont identifiées comme démonstrations.

Un serveur local peut aussi être lancé avec Python :

```bash
python -m http.server 8000
```

Puis ouvrir `http://localhost:8000/`.

### Préparer une collecte

1. Compléter `contact`, `conservation` et `remise` dans `STUDY_INFO`, au début de `app.js`. Ces informations apparaissent avant le consentement.
2. Faire 3 à 5 démonstrations techniques pour vérifier la clarté des consignes, le niveau et les téléchargements.
3. Figer la version utilisée et conserver le même cadre de passation entre participants.
4. Donner aux participants l’entrée `index.html`, sans présenter les schémas ou les hypothèses avant leur attribution.
5. Récupérer manuellement le CSV à la fin de chaque séance.

Les réponses restent dans le navigateur jusqu’à leur téléchargement. Le site n’envoie aucun fichier automatiquement à l’expérimentateur. Un identifiant aléatoire remplace le nom ; le participant le conserve pour une éventuelle demande de retrait. Les modalités de remise et de conservation doivent être annoncées avant le recrutement.

## 4. Données et analyse reproductible

### Données recueillies

Une passation complète produit un CSV avec un résumé et 22 lignes de réponses. Il contient notamment la condition, les réponses, les temps, les durées d’apprentissage et les incidents d’onglet. Le [dictionnaire des variables](docs/DICTIONNAIRE.md) décrit toutes les colonnes.

Réunir les fichiers originaux dans `collecte/`. La page `chercheur.html` permet de les importer pour contrôler la collecte et les doublons. La sauvegarde du navigateur ne remplace pas les fichiers téléchargés.

### Analyse prévue

Le **critère principal** est la proportion de bonnes réponses aux 12 questions du test final. L’unité statistique est le participant, et non la question.

L’estimation principale est la différence entre les moyennes des conditions visuelle et symbolique, exprimée en points de pourcentage. Le script réalise un test de permutation bilatéral avec 10 000 permutations et une correction Monte-Carlo. Il fournit un intervalle bootstrap percentile à 95 %, avec 5 000 rééchantillonnages de participants dans chaque groupe. La graine est fixée à `20261116` ; le seuil prévu est de 0,05. L’intervalle reste approximatif pour un petit échantillon.

Les démonstrations, passations incomplètes, attributions non conformes et expositions d’apprentissage insuffisantes sont exclues de l’analyse principale. Les doublons identiques sont ignorés ; les contradictions arrêtent l’analyse pour vérification. Les effectifs et motifs d’exclusion doivent être rapportés par condition. Les abandons sans export ne sont pas observables à distance.

Pour les temps, le script retient les réponses correctes, sans onglet masqué, comprises entre 200 et 120 000 ms. Il calcule une médiane par participant, puis une moyenne descriptive des médianes. Ces filtres ne retirent aucune réponse du calcul des scores. Le prétest, le transfert et la régression ajustée sur le niveau initial et la familiarité restent exploratoires.

### Reproduire l’analyse

Avec Python 3.10 ou plus récent :

```bash
python -m pip install -r analysis/requirements.txt
python analysis/analyse.py collecte/participant1.csv collecte/participant2.csv --output resultats
```

Pour tous les CSV sous PowerShell :

```powershell
$csv = (Get-ChildItem .\collecte\*.csv).FullName
python .\analysis\analyse.py @csv --output .\resultats
```

Sur macOS ou Linux :

```bash
python3 analysis/analyse.py collecte/*.csv --output resultats
```

| Sortie | Contenu |
|---|---|
| `resultats/rapport.md` | Rapport statistique généré |
| `resultats/resultats.json` | Estimations, exclusions, versions et empreintes des entrées |
| `resultats/scores_participants.csv` | Scores individuels agrégés |
| `resultats/scores.png` | Figure descriptive des scores |

Conserver les données sources et le code exact de l’analyse. Les dossiers de collecte et de résultats sont ignorés par Git ; publier dans le rapport les tableaux et figures agrégés utiles à l’évaluation.

## 5. Résultats

**Section à compléter après une collecte réelle. Aucun chiffre expérimental n’est présenté à ce stade.** Les données simulées de contrôle et les démonstrations doivent rester distinctes des données de participants.

### Échantillon analysé

Indiquer le nombre total de participants, les effectifs attribués, les passations complètes, les exclusions et les incidents, avec leur répartition entre conditions.

| Condition | Participants inclus | Prétest moyen (%) | Test final moyen (%) | Transfert moyen (%) |
|---|---|---|---|---|
| Symbolique | À compléter | À compléter | À compléter | À compléter |
| Visuelle | À compléter | À compléter | À compléter | À compléter |

### Comparaison principale

- Différence moyenne au test final, visuel moins symbolique : **à compléter**.
- Intervalle de confiance bootstrap à 95 % : **à compléter**.
- Valeur p du test de permutation bilatéral : **à compléter**.

Ajouter la figure descriptive issue de l’analyse, les mesures de dispersion et les résultats exploratoires pertinents. Décrire les observations avant de proposer une interprétation.

## 6. Discussion et limites

Cette section sera complétée à partir des résultats. Elle devra examiner si l’effet observé est compatible avec l’hypothèse, son amplitude et son incertitude, ainsi que les différences initiales entre groupes et les incidents de passation.

Plusieurs limites sont à considérer :

- Un petit effectif peut laisser une forte incertitude. Un résultat non significatif ne prouve pas l’absence d’effet.
- Les participants savent s’ils reçoivent un schéma ; les consignes de l’expérimentateur doivent rester identiques.
- Les temps d’apprentissage peuvent dépasser le minimum imposé ; leur différence éventuelle doit être décrite.
- Le prétest familiarise déjà à la tâche. Prétest et test final n’étant pas des formes étalonnées, leur différence n’est pas un gain psychométrique calibré.
- Le test à quatre éléments mesure un transfert proche, sans établir une amélioration générale de l’apprentissage de l’algèbre.
- Les stratégies déclarées ne mesurent pas directement une image mentale ou un mécanisme cérébral.
- L’analyse des passations complètes ne remplace pas une analyse des abandons.

La conclusion devra distinguer ce que les données montrent, ce qui reste incertain et les expériences complémentaires envisageables.

## 7. Dépôt et lecture du rapport sur GitHub Pages

Pour la remise du projet, transmettre le lien du dépôt contenant le code et ce rapport, ainsi que le lien GitHub Pages. Le cours demande également une inscription sur la [feuille d’évaluation indiquée dans Moodle](https://docs.google.com/spreadsheets/d/1GgOq-YD4yOgWbmz9eC0hJFKaTiIDKGPPTWgabqpteGk/edit?usp=sharing).

Le fichier `index.html` doit se trouver à la racine du dépôt. Dans **Settings → Pages**, choisir **Deploy from a branch**, la branche **main**, le dossier **/(root)**, puis **Save**. Le fichier `.nojekyll` permet de servir les fichiers statiques directement.

L’adresse principale ouvre l’expérience. La page **`rapport.html`** permet de lire ce rapport dans le site GitHub Pages ; **`chercheur.html`** ouvre la préparation et les imports. Les liens de remise seront à renseigner une fois le dépôt publié.

Après mise à jour du README, notamment après l’ajout des résultats, régénérer la page du rapport avec :

```bash
python -m pip install "mistune>=3,<4"
python tools/generer_rapport.py
```

Cette étape concerne seulement la mise à jour du rapport ; l’expérience et la page du rapport fournie sont déjà exécutables sans compilation.

Documentation : [Créer un site GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site#creating-your-site).

## 8. Organisation du code

| Fichier ou dossier | Rôle |
|---|---|
| `app.js` | Déroulement, chronométrage, consentement et sauvegarde locale |
| `core.js` | Permutations, banque de questions, corrigé et format CSV |
| `style.css` | Mise en forme de l’expérience |
| `analysis/` | Script d’analyse et dépendances Python |
| `docs/` | Protocole détaillé, banque corrigée et dictionnaire des données |
| `tests/` | Contrôles mathématiques et statistiques |
| `tools/generer_rapport.py` | Conversion du README en page de rapport statique |

Les contrôles techniques peuvent être exécutés avec Node.js et les dépendances Python installés :

```bash
node tests/core.test.cjs
python -m unittest discover -s tests -p '*_test.py'
```

Ces vérifications portent sur le logiciel. Elles ne constituent pas une validation empirique de l’hypothèse cognitive.

## Références

- **Cadre pédagogique :** Moodle IP Paris, *HSS_51H05_EP — Approches expérimentales de la cognition (2026-2027)*, consignes de validation du cours fournies pour ce projet.
- **Document méthodologique du cours :** *HSS_Cognition_6_howto-project.pdf*.
- Zazkis, R., Dubinsky, E. et Dautermann, J. (1996). *Coordinating Visual and Analytic Strategies: A Study of Students’ Understanding of the Group D4*. Journal for Research in Mathematics Education, 27(4), 435–457. [https://doi.org/10.2307/749876](https://doi.org/10.2307/749876).
- Carter, N. et Ellis, R. *Group Explorer*. [https://nathancarter.github.io/group-explorer/](https://nathancarter.github.io/group-explorer/).
