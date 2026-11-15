# Détails du projet — SPACE LEARN

## Fonctionnement

SPACE LEARN est une plateforme bilingue français–anglais d’apprentissage de l’astronomie, conçue pour être utilisée sur téléphone comme sur ordinateur. Les apprenants parcourent quatre leçons courtes, répondent à des quiz avec explications et retrouvent leurs résultats dans une progression enregistrée localement sur leur appareil. La page Image astronomique du jour présente les publications paginées de la NASA avec leurs dates, types de médias et liens vers les sources originales. Un explorateur 3D présente les orbites des planètes et de certaines lunes à partir d’éléments fournis par NASA/JPL Horizons.

## Avantages et impact attendu

Le projet réunit apprentissage guidé, pratique et exploration scientifique dans un même parcours, en français et en anglais. Son approche mobile et ses explications accessibles visent à faciliter la découverte de l’astronomie et à encourager la curiosité scientifique. L’impact recherché est de donner aux jeunes des ressources claires et vérifiables pour comprendre les sciences spatiales ; aucune mesure d’impact auprès d’apprenants n’est encore revendiquée.

## Technologies et outils

- **Interface :** React, TypeScript, Vite, Tailwind CSS et React Router.
- **Données et état :** TanStack Query pour les appels API et Zustand pour la progression locale.
- **Serveur :** Node.js, Express, validation avec Zod et mise en cache des requêtes.
- **Visualisation :** Three.js et React Three Fiber.
- **Sources scientifiques en direct :** NASA APOD Basic et NASA/JPL Horizons.

## Créativité et facteurs pris en compte

SPACE LEARN associe des leçons structurées à des contenus astronomiques du jour et à une exploration orbitale interactive. Il distingue les données de source des résultats du modèle pédagogique : les orbites sont propagées avec une approximation de Kepler à deux corps, et la scène indique que les dimensions et distances ne sont pas à l’échelle réelle. La provenance, la date et les unités doivent rester visibles ; aucune valeur scientifique ne doit être inventée. Le projet privilégie également le bilinguisme, l’usage sur mobile, la confidentialité — les progrès restent sur l’appareil — et la clarté sur les fonctionnalités qui restent à développer.

## Alignement au défi

Le défi NASA Space Apps précis n’a pas encore été communiqué. L’alignement final de cette description devra être ajusté au défi retenu par l’équipe, sans présenter les fonctionnalités futures comme déjà opérationnelles.
