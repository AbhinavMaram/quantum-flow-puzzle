import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

// --- Game Configuration ---
const GAME_CONFIG = {
  gridSize: 10,
  cellSize: 50, // Pixels per cell
  particleInitialVelocity: 50, // Speed of particles
  particleNudgeOnDeflect: 10, // Random nudge after deflection
  particleSize: 8, // Width/Height of particles in pixels
  totalLevels: 50, // Total number of levels

  // Function to dynamically generate level configurations
  generateLevel: (levelId) => {
    const baseTargetScore = 5;
    const baseMaxParticles = 15;
    const baseEmitterInterval = 1000;

    // Increase difficulty with level
    const targetScore = baseTargetScore + (levelId - 1) * 2;
    const maxParticles = baseMaxParticles + (levelId - 1) * 5;
    const emitterSpawnInterval = Math.max(200, baseEmitterInterval - (levelId - 1) * 50); // Min 200ms

    // Generate a clean grid for each level
    const initialGrid = Array(GAME_CONFIG.gridSize).fill(null).map(() => Array(GAME_CONFIG.gridSize).fill(null));

    return {
      id: levelId,
      name: `Level ${levelId}`,
      targetScore,
      maxParticles,
      emitterSpawnInterval,
      initialGrid: initialGrid,
    };
  }
};

// --- Component Definitions ---

// Toolbar Component: For selecting what to place on the grid
const Toolbar = ({ setSelectedTool }) => {
  return (
    <div className="toolbar">
      <button onClick={() => setSelectedTool('emitter')}>Emitter</button>
      <button onClick={() => setSelectedTool('collector')}>Collector</button>
      <button onClick={() => setSelectedTool('deflector')}>Deflector</button>
      <button onClick={() => setSelectedTool(null)}>Clear Selection</button>
    </div>
  );
};

// GridCell Component: Represents a single cell on the game board
const GridCell = ({ type, onClick, isSelected }) => {
  const cellClass = `grid-cell ${type || ''} ${isSelected ? 'selected-cell' : ''}`;
  return (
    <div className={cellClass} onClick={onClick}>
      {/* Display initial for placed elements */}
      {type === 'emitter' && 'E'}
      {type === 'collector' && 'C'}
      {type === 'deflector' && 'D'}
    </div>
  );
};

// GameGrid Component: Renders the entire game board
const GameGrid = ({ gridState, onCellClick, selectedTool }) => {
  const { gridSize, cellSize } = GAME_CONFIG;
  return (
    <div
      className="game-grid"
      style={{
        gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
      }}
    >
      {Array.from({ length: gridSize * gridSize }).map((_, index) => {
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        const cellType = gridState[row]?.[col] || null;

        return (
          <GridCell
            key={`${row}-${col}`} // Unique key for each cell
            type={cellType}
            onClick={() => onCellClick(row, col)}
            isSelected={selectedTool && !cellType} // Highlight if a tool is selected and cell is empty
          />
        );
      })}
    </div>
  );
};

// ParticleSystem Component: Renders and moves particles
const ParticleSystem = ({ particles }) => {
  const { particleSize } = GAME_CONFIG;
  return (
    <div className="particle-system-container">
      {particles.map((p) => (
        <div
          key={p.id} // Use unique ID for key prop for better React performance
          className="particle"
          style={{
            left: `${p.x - particleSize / 2}px`,
            top: `${p.y - particleSize / 2}px`,
            width: `${particleSize}px`,
            height: `${particleSize}px`,
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  );
};

// --- Main App Component ---

function App() {
  const { gridSize, cellSize, particleInitialVelocity, particleNudgeOnDeflect, particleSize, totalLevels, generateLevel } = GAME_CONFIG;

  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(() => generateLevel(1)); // Initialize with level 1

  // Initialize grid state based on current level's initial grid
  const [gridState, setGridState] = useState(() => {
    return currentLevel.initialGrid.map(row => [...row]); // Deep copy
  });

  const [selectedTool, setSelectedTool] = useState(null); // 'emitter', 'collector', 'deflector'
  const [particles, setParticles] = useState([]);
  const [score, setScore] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [particlesEmitted, setParticlesEmitted] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false); // New state for game completion

  // Refs for animation loop and emitter interval
  const animationFrameId = useRef(null);
  const lastUpdateTime = useRef(0);
  const emitterIntervalId = useRef(null);

  // Function to load a level
  const loadLevel = useCallback((levelIndex) => {
    if (levelIndex < totalLevels) {
      const levelToLoad = generateLevel(levelIndex + 1); // Generate level data
      setCurrentLevel(levelToLoad); // Update currentLevel state
      setGridState(levelToLoad.initialGrid.map(row => [...row])); // Load initial grid (which is now empty)
      setParticles([]);
      setScore(0);
      setParticlesEmitted(0);
      setIsSimulating(false); // Stop simulation when loading new level
      setCurrentLevelIndex(levelIndex);
      setGameCompleted(false); // Reset game completed status
      console.log(`Loaded Level: ${levelToLoad.name}`);
    } else {
      console.log("Game Over! All levels completed.");
      setIsSimulating(false);
      setGameCompleted(true); // Set game completed status
    }
  }, [totalLevels, generateLevel]);

  // Function to handle clicking on a grid cell
  const handleCellClick = (row, col) => {
    if (isSimulating || gameCompleted) return; // Cannot place elements during simulation or if game is completed
    setGridState(prevGrid => {
      const newGrid = prevGrid.map(r => [...r]); // Create a deep copy of the grid
      if (selectedTool) {
        newGrid[row][col] = selectedTool; // Place the selected tool
      } else {
        newGrid[row][col] = null; // Clear the cell if no tool is selected
      }
      return newGrid;
    });
  };

  // Function to spawn a single particle from an emitter
  const spawnParticle = useCallback((rIdx, cIdx) => {
    setParticles(prevParticles => [
      ...prevParticles,
      {
        id: Date.now() + Math.random(), // Unique ID for each particle
        x: cIdx * cellSize + cellSize / 2 + (Math.random() - 0.5) * 10,
        y: rIdx * cellSize + cellSize / 2 + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * particleInitialVelocity,
        vy: (Math.random() - 0.5) * particleInitialVelocity,
        width: particleSize,
        height: particleSize,
        color: 'cyan',
        collected: false,
      }
    ]);
    setParticlesEmitted(prev => prev + 1);
  }, [cellSize, particleInitialVelocity, particleSize]);

  // Function to update particle positions and handle interactions
  const updateParticles = useCallback((deltaTime) => {
    setParticles(prevParticles => {
      if (prevParticles.length === 0) {
        return [];
      }

      let collectedCountThisFrame = 0; // Track score changes locally for this frame
      const nextParticles = prevParticles.map(p => {
        let newX = p.x + p.vx * deltaTime;
        let newY = p.y + p.vy * deltaTime;

        // Determine the grid cell the particle is currently trying to enter
        const targetCellCol = Math.floor(newX / cellSize);
        const targetCellRow = Math.floor(newY / cellSize);

        // --- Interaction with Grid Elements (Deflectors, Collectors) ---
        if (
          targetCellRow >= 0 && targetCellRow < gridSize &&
          targetCellCol >= 0 && targetCellCol < gridSize
        ) {
          const cellType = gridState[targetCellRow]?.[targetCellCol];

          if (cellType === 'deflector') {
            const dx = newX - p.x;
            const dy = newY - p.y;

            if (Math.abs(dx) > Math.abs(dy)) {
              p.vx *= -1;
            } else {
              p.vy *= -1;
            }

            p.vx += (Math.random() - 0.5) * particleNudgeOnDeflect;
            p.vy += (Math.random() - 0.5) * particleNudgeOnDeflect;

            newX = p.x + p.vx * deltaTime;
            newY = p.y + p.vy * deltaTime;

          } else if (cellType === 'collector') {
            collectedCountThisFrame += 1; // Increment local count
            return { ...p, collected: true }; // Mark for filtering out
          }
        }

        // Basic boundary collision (bounce off outer walls of the game area)
        if (newX - p.width / 2 < 0) {
          p.vx *= -1;
          newX = p.width / 2;
        } else if (newX + p.width / 2 > gridSize * cellSize) {
          p.vx *= -1;
          newX = gridSize * cellSize - p.width / 2;
        }

        if (newY - p.height / 2 < 0) {
          p.vy *= -1;
          newY = p.height / 2;
        } else if (newY + p.height / 2 > gridSize * cellSize) {
          p.vy *= -1;
          newY = gridSize * cellSize - p.height / 2;
        }

        return { ...p, x: newX, y: newY };
      }).filter(p => {
        const isOffScreen = p.x < -p.width || p.x > (gridSize * cellSize + p.width) ||
          p.y < -p.height || p.y > (gridSize * cellSize + p.height);
        return !p.collected && !isOffScreen;
      });

      // Update the main score state after all particles are processed
      if (collectedCountThisFrame > 0) {
        setScore(prevScore => prevScore + collectedCountThisFrame);
      }
      return nextParticles;
    });
  }, [gridSize, cellSize, gridState, particleNudgeOnDeflect]);

  // Main game loop function
  const gameLoop = useCallback((currentTime) => {
    if (!lastUpdateTime.current) lastUpdateTime.current = currentTime;
    const deltaTime = (currentTime - lastUpdateTime.current) / 1000;
    lastUpdateTime.current = currentTime;

    if (isSimulating) {
      updateParticles(deltaTime);
    }
    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [isSimulating, updateParticles]);

  // Effect to manage the game loop (start/stop)
  useEffect(() => {
    if (isSimulating) {
      lastUpdateTime.current = performance.now();
      animationFrameId.current = requestAnimationFrame(gameLoop);

      // Start continuous particle spawning from emitters
      emitterIntervalId.current = setInterval(() => {
        // Find all emitters on the current grid
        const emitters = [];
        gridState.forEach((row, rIdx) => {
          row.forEach((cell, cIdx) => {
            if (cell === 'emitter') {
              emitters.push({ rIdx, cIdx });
            }
          });
        });

        // Only spawn if there are emitters and max particles for level not reached
        if (emitters.length > 0 && particlesEmitted < currentLevel.maxParticles) {
          // Spawn one particle from each emitter in this interval
          emitters.forEach(emitter => {
            spawnParticle(emitter.rIdx, emitter.cIdx);
          });
        } else if (particlesEmitted >= currentLevel.maxParticles) {
          // All particles emitted for this level, stop spawning
          clearInterval(emitterIntervalId.current);
        }
      }, currentLevel.emitterSpawnInterval);

    } else {
      cancelAnimationFrame(animationFrameId.current);
      clearInterval(emitterIntervalId.current); // Clear interval when simulation stops
      lastUpdateTime.current = 0;
    }
    return () => {
      cancelAnimationFrame(animationFrameId.current);
      clearInterval(emitterIntervalId.current);
    };
  }, [isSimulating, gameLoop, gridState, spawnParticle, particlesEmitted, currentLevel]);

  // Effect to check level completion
  useEffect(() => {
    if (isSimulating && score >= currentLevel.targetScore) {
      setIsSimulating(false); // Stop simulation
      console.log(`Level ${currentLevel.id} completed! Score: ${score}`);
      // Show level complete message or transition
      if (currentLevel.id < totalLevels) {
        // No automatic load, user clicks "Next Level"
      } else {
        setGameCompleted(true); // Game completed!
      }
    }
  }, [score, currentLevel, isSimulating, totalLevels, currentLevelIndex, loadLevel]);

  // Load initial level on component mount
  useEffect(() => {
    loadLevel(0); // Load the first level (index 0, which corresponds to levelId 1)
  }, [loadLevel]);

  return (
    <div className="App">
      <h1>Quantum Flow Puzzle</h1>
      {gameCompleted ? (
        <div className="game-over-message">
          <h2>Congratulations! Game Completed!</h2>
          <p>You have mastered the Quantum Flow!</p>
          <button onClick={() => loadLevel(0)}>Play Again</button>
        </div>
      ) : (
        <>
          <div className="game-info">
            <p>Level: {currentLevel.id} / {totalLevels} - {currentLevel.name}</p>
            <p>Score: {score} / {currentLevel.targetScore}</p>
            <p>Particles Emitted: {particlesEmitted} / {currentLevel.maxParticles}</p>
          </div>
          <Toolbar setSelectedTool={setSelectedTool} />
          <div className="controls">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              disabled={score >= currentLevel.targetScore && isSimulating}
            >
              {isSimulating ? 'Stop Flow' : 'Start Flow'}
            </button>
            <button onClick={() => {
              setIsSimulating(false);
              setParticles([]);
              setScore(0);
              setParticlesEmitted(0);
              // Reset grid to current level's initial state
              setGridState(currentLevel.initialGrid.map(row => [...row]));
            }}>Reset Level</button>
            <button
              onClick={() => loadLevel(currentLevelIndex + 1)}
              disabled={score < currentLevel.targetScore || currentLevel.id >= totalLevels}
            >
              Next Level
            </button>
          </div>

          <div
            className="game-area"
            style={{
              width: gridSize * cellSize,
              height: gridSize * cellSize,
            }}
          >
            <GameGrid
              gridState={gridState}
              onCellClick={handleCellClick}
              selectedTool={selectedTool}
              gridSize={gridSize}
              cellSize={cellSize}
            />
            <ParticleSystem particles={particles} />
          </div>
        </>
      )}

      <footer className="app-footer">
        © {new Date().getFullYear()} Abhinav Reddy Maram. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
