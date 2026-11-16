# Visualisation et raisonnement algébrique

**Projet logiciel — HSS_51H05_EP : Approches expérimentales de la cognition**  
**École polytechnique — Ingénieur 3A / Master 1 — Année 2026-2027**  
**Auteur : Tarek Marc Al Kwatli**

L'objectif de ce projet est de programmer une expérience cognitive portable, la faire passer à quelques personnes et analyser les résultats. Le dépôt rassemble le programme expérimental, son protocole et ce rapport.

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


Les réponses restent dans le navigateur jusqu’à leur téléchargement. Le site n’envoie aucun fichier automatiquement à l’expérimentateur. Un identifiant aléatoire remplace le nom ; le participant le conserve pour une éventuelle demande de retrait. Les modalités de remise et de conservation doivent être annoncées avant le recrutement.

## 4. Données

### Données recueillies

Une passation complète produit un CSV avec un résumé et 22 lignes de réponses. Il contient notamment la condition, les réponses, les temps, les durées d’apprentissage et les incidents d’onglet. Le [dictionnaire des variables](docs/DICTIONNAIRE.md) décrit toutes les colonnes.

Réunir les fichiers originaux dans `collecte/`. La page `chercheur.html` permet de les importer pour contrôler la collecte et les doublons. La sauvegarde du navigateur ne remplace pas les fichiers téléchargés.

### Analyse prévue

Le **critère principal** est la proportion de bonnes réponses aux 12 questions du test final. L’unité statistique est le participant, et non la question.

L’estimation principale est la différence entre les moyennes des conditions visuelle et symbolique, exprimée en points de pourcentage. Le script réalise un test de permutation bilatéral avec 10 000 permutations et une correction Monte-Carlo. Il fournit un intervalle bootstrap percentile à 95 %, avec 5 000 rééchantillonnages de participants dans chaque groupe. La graine est fixée à `20261116` ; le seuil prévu est de 0,05. L’intervalle reste approximatif pour un petit échantillon.

Les démonstrations, passations incomplètes, attributions non conformes et expositions d’apprentissage insuffisantes sont exclues de l’analyse principale. Les doublons identiques sont ignorés ; les contradictions arrêtent l’analyse pour vérification. Les effectifs et motifs d’exclusion doivent être rapportés par condition. Les abandons sans export ne sont pas observables à distance.

Pour les temps, le script retient les réponses correctes, sans onglet masqué, comprises entre 200 et 120 000 ms. Il calcule une médiane par participant, puis une moyenne descriptive des médianes. Ces filtres ne retirent aucune réponse du calcul des scores. Le prétest, le transfert et la régression ajustée sur le niveau initial et la familiarité restent exploratoires.

