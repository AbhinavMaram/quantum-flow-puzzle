# Quantum Flow Puzzle

A captivating and unique puzzle game built with React, where players strategically place and orient elements on a grid to guide streams of quantum particles to their designated collectors. Master the flow across 50 dynamic levels!

## Table of Contents

* [About The Game](#about-the-game)
* [Features](#features)
* [How to Play](#how-to-play)
* [Technologies Used](#technologies-used)
* [Deployment](#deployment)

## About The Game

"Quantum Flow Puzzle" challenges your logical thinking and spatial reasoning. As a quantum engineer, your mission is to set up a pathway for energetic quantum particles. Particles are continuously emitted from 'Emitters' and must be guided to 'Collectors'. To achieve this, you'll utilize various 'Deflector' elements to manipulate the particles' trajectories, bouncing them around obstacles and towards their targets. The game features 50 progressively challenging levels, each dynamically generated to offer a fresh puzzle experience.

## Features

* **Dynamic Level Generation:** Play through 50 unique levels, with emitters, collectors, and obstacles dynamically placed for a fresh challenge every time.
* **Interactive Grid:** Place and clear game elements (Emitters, Collectors, Deflectors) directly on the grid.
* **Real-time Particle Simulation:** Watch particles flow and react to your placed elements in real-time.
* **Score Tracking:** Monitor your progress and aim to reach the target score for each level.
* **Level Progression:** Advance through levels upon meeting the target score, with increasing difficulty.
* **Game Completion Message:** A celebratory message upon mastering all 50 levels.
* **Responsive Design:** Optimized for play on both desktop and mobile devices.
* **Sleek UI:** A "quantum" themed interface with glowing elements and smooth animations.

## How to Play

1.  **Start a Level:** The game begins on Level 1.
2.  **Place Elements:**
    * Select a tool (Emitter, Collector, Deflector) from the toolbar.
    * Click on any empty grid cell to place the selected element.
    * To remove an element, select "Clear Selection" from the toolbar and click on the element you wish to remove.
    * **Goal:** For each level, you **must** place at least one `Emitter` and one `Collector`. You will also need to strategically place `Deflectors` to guide the particles.
3.  **Start Flow:** Once you've set up your grid, click the "Start Flow" button. Particles will begin to emit from any placed 'Emitters' and move across the grid.
4.  **Collect Particles:** Guide the particles into the 'Collectors' to earn points.
5.  **Achieve Target Score:** Each level has a `Target Score`. Once your current score meets or exceeds this target, the simulation will pause, indicating you've completed the level.
6.  **Next Level:** Click "Next Level" to proceed to the next dynamically generated challenge. This button is enabled only after you meet the current level's target score.
7.  **Reset Level:** If you get stuck or want to try a different strategy, click "Reset Level" to clear the grid and restart the current level.
8.  **Game Completed:** After successfully completing all 50 levels, a "Game Completed!" message will appear, and you'll have the option to "Play Again."

## Technologies Used

* **Frontend:**
    * [React](https://react.dev/) - A JavaScript library for building user interfaces.
    * CSS Modules (or standard CSS) for styling.

## Deployment

This application is deployed as a Static Web App on [Microsoft Azure](https://azure.microsoft.com/en-us/services/app-service/static/). The deployment process is automated via [GitHub Actions](https://docs.github.com/en-us/actions), ensuring that every push to the main branch triggers a new build and deployment.

### Deployment Process:

1.  **Code Push:** Push your React application code to a GitHub repository.
2.  **Azure Static Web Apps Setup:** Configure an Azure Static Web App resource in the Azure Portal, linking it to your GitHub repository and specifying the build details (e.g., `App location: /`, `Output location: build`).
3.  **GitHub Actions Workflow:** Azure automatically generates a GitHub Actions workflow file (`.github/workflows/azure-static-web-apps-*.yml`) in your repository.
4.  **Automated Build & Deploy:** This workflow builds your React application and deploys the static assets to Azure. Subsequent pushes to the configured branch will automatically trigger new deployments.
