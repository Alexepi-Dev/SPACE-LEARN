# SPACE LEARN — NASA Space Apps 2026 submission draft

**Draft status:** Evidence-based general draft. The team has not selected a challenge yet.  
**Last checked:** 15 November 2026.

## High-Level Summary

SPACE LEARN is a bilingual astronomy learning platform designed to make space science easier to explore for young people in Africa. It combines four short French and English lessons, interactive quizzes with explanations, browser-local learning progress, NASA's Astronomy Picture of the Day, and a 3D solar-system explorer using orbital elements from NASA/JPL Horizons.

The project addresses the learning-access problem it was designed for: beginners need clear, mobile-friendly explanations and trusted sources to explore astronomy. It offers an accessible learning path from a lesson to a quiz and then to a local progress summary. The 3D explorer adds an interactive way to compare planets and selected moons.

NASA APOD and JPL Horizons are the two live NASA/JPL data integrations currently evidenced in the application. The orbital display propagates source elements with a two-body Kepler model; it is an educational approximation, not a high-precision or long-term ephemeris. SPACE LEARN is an independent educational project and is not endorsed, certified, or sponsored by NASA.

**Challenge alignment:** The team has not selected a challenge yet. The supplied pages identify the Kara local event and the Kara SpaceTech team, but not a specific challenge. Choose a challenge before making challenge-specific claims in the submission.

## Project Details

### How it works

Learners can choose French or English, browse four lessons, read short structured content and source links, complete a quiz with corrective explanations, and review completed lessons and quiz scores. Progress remains in the learner's browser; there are no learner accounts or centralized learning analytics.

The APOD page retrieves paginated NASA astronomy posts through the Express API. The media explorer filters and searches the currently displayed APOD page. The 3D explorer retrieves planetary orbital elements and requests ten featured moons when the moon view is opened. Users can select bodies, inspect facts and source metadata, change scale and playback speed, compare bodies, and follow a guided tour.

### Technology and architecture

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router.
- Client state/data: Zustand for local progress and TanStack Query for API requests.
- Backend: Node.js and Express, with Zod validation, Helmet, restricted CORS, rate limiting, timeouts and in-memory caching.
- Visualization: Three.js and React Three Fiber.
- Hosting plan in repository documentation: Netlify frontend and Render API. This is a deployment plan, not proof of a currently public deployment.

### Current limits

- Four lessons are available; the broader curriculum and a separate scientific library are incomplete.
- Missions are a roadmap only; there are no interactive missions or mission results.
- NASA Image and Video Library search, NeoWs, DONKI, the NASA Exoplanet Archive, GIBS and PDS are not integrated.
- APOD explorer search/filter applies to the current page only.
- Local progress cannot provide cross-device or population-level impact metrics.
- The orbital motion is a two-body educational approximation; it does not model perturbations or spacecraft trajectories.
- No production URL, public source repository URL, or recorded demo was supplied for verification.

## NASA Data and AI

### NASA/JPL data

1. **NASA APOD Basic** — `https://science.nasa.gov/wp-json/wp/v2/apod-basic`  
   The backend requests paginated entries, validates and normalizes their metadata, distinguishes image/video/other media, keeps a source link, sanitizes explanatory text, and uses a 30-minute server cache and a 10-second timeout. A live request through the application API returned HTTP 200 on 15 November 2026 and included a NASA source URL.
2. **JPL Horizons** — `https://ssd.jpl.nasa.gov/api/horizons.api`  
   The backend converts the current UTC time to TDB before querying ELEMENTS, sends `TIME_TYPE='TDB'`, and rounds the epoch down to a five-minute boundary. The conversion uses the TT−UTC offset in effect on 15 November 2026 and a periodic TDB−TT correction; the offset must be updated if a leap second is introduced. A live check returned eight planets. The frontend propagates the elements locally with a two-body Kepler approximation; positions between fetched epochs are therefore model outputs, not new NASA observations.
3. **NASA reference pages**  
   Planet and moon facts link to NASA Solar System Exploration, NASA/JPL planetary physical parameters, NASA Space Place and NASA Universe references. These reference pages are not represented as a live measurement feed.

No NASA API key is required for APOD Basic or the current Horizons request. No secret is placed in a `VITE_*` variable. No analytics or AI inference is integrated into the product.

### AI disclosure

AI assistance was used during development to inspect code, draft and refine implementation/documentation, and help validate behavior. The deployed application does not currently contain an AI model, chatbot, generated scientific answer service, or AI-driven learning feature.

## Seven-slide demo outline

1. **Project and problem** — Introduce SPACE LEARN and the need for accessible astronomy learning; present goals as goals, not measured outcomes.
2. **Audience and needs** — Show the bilingual, mobile-first flow for learners, beginners and educators.
3. **Solution** — Explain the lesson → quiz → local progress journey and the source-transparent design.
4. **Live walkthrough** — Open a lesson, answer a quiz, show feedback/progress, then open the 3D explorer and select a planet or moon.
5. **NASA/JPL data** — Show APOD source/date/media type and JPL epoch, units, reference plane, and the Kepler-model limitation.
6. **Criteria and evidence** — Demonstrate responsive pages, bilingual UI, the tested data endpoints, and clearly label missions/other APIs as incomplete.
7. **Conclusion and next steps** — State intended impact without fabricated metrics; add challenge alignment only after the team selects a challenge.

## 30-second video narration draft

> SPACE LEARN helps young people explore astronomy in French or English. Learn through short lessons, test your understanding with explanatory quizzes, and track progress on your device. Explore the solar system in 3D using orbital elements from NASA and JPL, with the model's scientific limits clearly explained. NASA's Astronomy Picture of the Day brings real astronomy media and source links into the learning journey. Our next step is to select a Space Apps challenge, align the project to it honestly, and expand only the features we can verify.

## References and credits

- NASA APOD Basic: https://science.nasa.gov/wp-json/wp/v2/apod-basic
- NASA Solar System Exploration: https://science.nasa.gov/solar-system/
- JPL Horizons API documentation: https://ssd-api.jpl.nasa.gov/doc/horizons.html
- JPL Horizons service: https://ssd.jpl.nasa.gov/api/horizons.api
- NASA/JPL Planetary Physical Parameters: https://ssd.jpl.nasa.gov/planets/phys_par.html
- NASA Space Place: https://spaceplace.nasa.gov/
- NASA Universe — Stars: https://science.nasa.gov/universe/stars/
- NASA Moon: https://science.nasa.gov/moon/
- Solar System Scope textures and attribution: https://www.solarsystemscope.com/textures/
- Creative Commons Attribution 4.0: https://creativecommons.org/licenses/by/4.0/
- React: https://react.dev/ ; Vite: https://vite.dev/ ; Tailwind CSS: https://tailwindcss.com/
- Three.js: https://threejs.org/ ; React Three Fiber: https://r3f.docs.pmnd.rs/

## Project links and pending submission information

- NASA Space Apps local event page supplied by the team: https://www.spaceappschallenge.org/2026/local-events/kara/
- Team page supplied by the team: https://www.spaceappschallenge.org/2026/find-a-team/kara-spacetech/
- Exact selected challenge title/link: **not selected yet**.
- Public deployed site: **not supplied or verified**.
- Public source repository: **not supplied or verified**.
- Recorded demonstration: **not supplied; outline and narration draft provided above**.
- Minor-participant submission requirements: **must be checked against the official event rules with the team/organizers**.
