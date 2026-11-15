# SPACE LEARN — audit et préparation NASA Space Apps 2026

**État de l'audit : 15 novembre 2026**  
**Périmètre :** dépôt local, documentation disponible, tests existants et appels NASA/JPL réellement exécutés. Cet audit de code n'est pas un test d'intrusion ni une vérification d'un déploiement public.

## Synthèse

SPACE LEARN est une plateforme bilingue d'apprentissage avec quatre leçons, des quiz, une progression locale, une page APOD NASA et un explorateur 3D fondé sur les éléments orbitaux JPL Horizons. Le build client et serveur réussit; les dix tests serveur réussissent.

Le projet n'est pas encore une bibliothèque spatiale complète ni une plateforme de missions. Il ne collecte pas de statistiques d'impact apprenant et ne doit pas afficher d'inscriptions, d'apprenants actifs ou de taux globaux comme résultats réels. L'équipe indique ne pas avoir encore choisi son challenge Space Apps; les liens fournis identifient l'événement de Kara et l'équipe Kara SpaceTech, mais pas un défi du catalogue.

## Fonctionnalités et preuves

| Domaine | État vérifié | Preuve |
|---|---|---|
| Académie | Opérationnelle; quatre leçons bilingues sur le système solaire, les étoiles, les planètes et les satellites naturels. | [`lessonCatalog.ts`](../src/services/lessonCatalog.ts), [`AcademyPage.tsx`](../src/pages/AcademyPage.tsx) |
| Quiz et progression | Opérationnels localement; retours pédagogiques, complétion de leçons et résultats dans le stockage navigateur. Pas de compte ni de suivi centralisé. | [`QuizPage.tsx`](../src/pages/QuizPage.tsx), [`LessonPage.tsx`](../src/pages/LessonPage.tsx), [`useProgressStore.ts`](../src/store/useProgressStore.ts) |
| Image astronomique du jour | Appel réel par le serveur au endpoint NASA APOD Basic. Test en direct le 15 novembre 2026 : HTTP 200, 1 publication demandée, date/source NASA et pagination reçues. | [`apod.service.ts`](../server/src/services/apod.service.ts), [`ApodPage.tsx`](../src/pages/ApodPage.tsx) |
| Explorateur multimédia | Opérationnel pour les publications APOD; filtre/recherche limités à la page chargée. Ce n'est pas la NASA Image and Video Library. | [`ExplorerPage.tsx`](../src/pages/ExplorerPage.tsx) |
| Explorateur 3D du système solaire | Opérationnel avec les huit planètes et dix lunes principales testées. Données JPL Horizons; propagation locale képlérienne à deux corps, donc modèle éducatif et non éphéméride numérique longue durée. | [`SolarSystemExplorerPage.tsx`](../src/pages/SolarSystemExplorerPage.tsx), [`kepler.ts`](../src/features/solar-system/kepler.ts), [`horizons.service.ts`](../server/src/services/horizons.service.ts) |
| Missions et défis | Non opérationnels; la route présente une feuille de route et des idées, sans activité interactive ni résultat enregistré. | [`FutureFeaturePage.tsx`](../src/pages/FutureFeaturePage.tsx), route dans [`App.tsx`](../src/App.tsx) |
| Bibliothèque scientifique | Pas de rubrique dédiée; les fiches et ressources sont intégrées aux leçons et au simulateur. | [`App.tsx`](../src/App.tsx), [`lessonCatalog.ts`](../src/services/lessonCatalog.ts) |
| NeoWs, DONKI, exoplanètes, GIBS, PDS | Non intégrés; ne pas les présenter comme des services opérationnels. | [`README.md`](../README.md), routes existantes dans [`space.routes.ts`](../server/src/routes/space.routes.ts) |
| Déploiement et liens publics | Netlify/Render sont documentés comme procédure, mais aucune URL de site public ou de dépôt n'a été fournie ou vérifiée. Le projet est disponible localement. | [`README.md`](../README.md), [`netlify.toml`](../netlify.toml) |

### Données NASA/JPL effectivement utilisées

1. **NASA APOD Basic** — `https://science.nasa.gov/wp-json/wp/v2/apod-basic`. Le backend valide et normalise les entrées, conserve le lien source, distingue image/vidéo/autre et lit la pagination WordPress. Cache mémoire de 30 minutes et timeout de 10 secondes.
2. **JPL Horizons** — `https://ssd.jpl.nasa.gov/api/horizons.api`. Le backend demande des éléments orbitaux en AU, degrés et jours, les met en cache 15 minutes et limite la concurrence. L'époque UTC courante est convertie en TDB (TT−UTC de 69,184 s au 15 novembre 2026, avec correction périodique TDB−TT), puis arrondie vers le bas à cinq minutes; Horizons reçoit `TIME_TYPE='TDB'`, l'unique échelle acceptée pour les tables ELEMENTS. La constante TT−UTC devra être actualisée si une seconde intercalaire est ajoutée. La propagation képlérienne locale reste une approximation clairement distincte des éléments d'époque JPL.
3. **Références documentaires** — fiches NASA et paramètres physiques NASA/JPL sont des liens de référence, pas des flux mesurés en direct.

La réponse JPL réelle vérifiée dans la session contenait huit planètes et dix lunes principales, sans cible indisponible. Les textes ou paramètres pédagogiques affichés dans les fiches ne doivent pas être décrits comme des observations en temps réel.

## Sécurité, fiabilité et limites

- Les clés NASA ne sont pas exposées avec une variable `VITE_*`; APOD Basic n'en exige pas.
- Le backend emploie validation, timeouts, cache, Helmet, CORS par origine et limitation de débit. L'authentification admin est séparée des données apprenant; les accès admin protégés échouent de manière fermée si l'audit persistant échoue.
- La progression est conservée dans le navigateur. Aucun compte apprenant, analytique centralisée ou Google Analytics n'est configuré.
- La recherche de l'explorateur APOD porte uniquement sur la page courante.
- Le chunk 3D dépasse 1 Mo minifié; le build signale des chunks dépassant 500 ko. L'écran du simulateur est différé, mais les dépendances Three.js restent à découper davantage.
- Le lint réussit avec deux avertissements préexistants dans `LanguageProvider.tsx` et `QuizPage.tsx`.
- Aucun test d'intrusion, audit juridique des participants mineurs, test Android de terrain ou vérification du site de production n'a été effectué.

## Écarts prioritaires

1. **Challenge choisi — bloquant pour la pertinence.** L'équipe indique ne pas avoir encore choisi son challenge. Sélectionner le défi, puis consigner son titre et son URL; l'événement local de Kara et la page d'équipe ne suffisent pas à établir la pertinence.
2. **Validité des dates JPL — corrigé.** Les champs UTC ne sont plus envoyés tels quels comme TDB. La conversion et l'échelle de temps acceptée par Horizons ELEMENTS sont couvertes par un test de requête ciblé; l'époque reste affichée comme TDB.
3. **Conformité de la charte fournie — harmonisée.** Les jetons et accents principaux de l'interface utilisent `#174F3B`, `#236B50`, `#C6A15B`, `#0B1833`, `#152A4A`, `#FFFFFF` et `#F5F7F5`. Les couleurs des corps célestes restent propres à leur représentation; les alertes d'erreur conservent une couleur sémantique.
4. **Démonstration et liens publics.** Fournir URL de production, dépôt public, démonstration vidéo/diapositives et preuves d'un parcours apprenant réel.
5. **Impact.** Décrire l'impact comme attendu. N'afficher des métriques que si la collecte et le consentement correspondants sont effectivement mis en place; aucune donnée globale d'apprenants n'existe actuellement.
6. **Fonctionnalités futures.** Garder missions, NASA Image and Video Library, NeoWs, DONKI, exoplanètes, GIBS et PDS étiquetés comme planifiés ou non configurés tant que leur intégration n'est pas testée.

## Grille des cinq critères

| Critère | Exigence | Preuve actuelle | Statut | Correction nécessaire |
|---|---|---|---|---|
| Impact | Répondre à un besoin d'accès à l'apprentissage spatial et faciliter l'usage mobile. | Leçons, quiz, progression locale, interface responsive et bilingue. Pas de mesure de portée réelle. | Partiellement conforme | Formuler le problème et l'impact attendu; ne pas inventer d'indicateurs. Tester sur Android et connexion lente. |
| Créativité | Combiner apprentissage, données réelles et visualisation. | Parcours bilingue et explorateur 3D avec éléments JPL. | Partiellement conforme | Développer des missions interactives seulement si elles sont testées; améliorer la démonstration. |
| Validité | Sources, provenance, unités, dates, gestion d'erreur et limites explicites. | APOD et Horizons branchés; tests serveur; cache, timeout et états d'erreur. Le modèle 3D est documenté comme képlérien simplifié. | Partiellement conforme | Résoudre la représentation UTC/TDB; élargir les tests terrain; ne pas présenter les API prévues comme opérationnelles. |
| Pertinence | Correspondance démontrable avec le challenge sélectionné. | L'équipe indique que le challenge n'est pas encore choisi. | Non vérifiable | Choisir le challenge exact; remplir ensuite la matrice problème/données/fonctions/preuves. |
| Présentation | Expliquer rapidement problème, public, solution, sources et démonstration. | Page d'accueil bilingue et pages d'apprentissage présentes. Aucun projet public/démo vérifié. | Partiellement conforme | Compléter le cadrage défi, les preuves, les liens publics et une démonstration en anglais. |

## Liste de vérification de soumission

- [x] Résumé fonctionnel fondé sur des fonctionnalités présentes.
- [x] Sources APOD et Horizons identifiées; limites du modèle documentées.
- [x] Build complet et tests serveur exécutés.
- [ ] Titre exact du challenge — **l'équipe ne l'a pas encore choisi**.
- [ ] Correspondance au challenge avec preuve — bloquée par le titre exact.
- [ ] URL du site déployé, dépôt GitHub et lien de démo — non fournis/vérifiés.
- [ ] Démonstration et page de soumission entièrement en anglais.
- [ ] Vérification des règles officielles pour les participants mineurs auprès de l'organisation.
- [ ] Test pratique Android, faible débit et absence de WebGL.
- [x] Validation visuelle de la charte principale, y compris au format mobile.
- [x] Correction de la conversion de l'époque du simulateur vers TDB et test de l'échelle envoyée à Horizons.
