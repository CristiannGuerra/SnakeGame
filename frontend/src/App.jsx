import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';
import './SnakeGame.css'; // Importar el archivo CSS

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const INITIAL_FOOD = { x: 15, y: 15 };

const SnakeGame = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState(INITIAL_FOOD);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(150);
  const [highScore, setHighScore] = useState(0);
  const [showScoreForm, setShowScoreForm] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerEmail, setPlayerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const gameLoopRef = useRef();
  const gameAreaRef = useRef();

  // Generar comida aleatoria
  const generateFood = useCallback(() => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, [snake]);

  // Verificar colisiones
  const checkCollision = useCallback((head) => {
    // Colisión con paredes
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true;
    }
    // Colisión con el cuerpo
    return snake.some(segment => segment.x === head.x && segment.y === head.y);
  }, [snake]);

  // Loop principal del juego
  const gameLoop = useCallback(() => {
    if (!isPlaying || gameOver) return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      
      head.x += direction.x;
      head.y += direction.y;

      if (checkCollision(head)) {
        setGameOver(true);
        setIsPlaying(false);
        if (score > highScore) {
          setHighScore(score);
        }
        // Mostrar formulario solo si el score es mayor a 0
        if (score > 0) {
          setShowScoreForm(true);
        }
        return currentSnake;
      }

      newSnake.unshift(head);

      // Verificar si comió la comida
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10);
        setFood(generateFood());
        setGameSpeed(prev => Math.max(50, prev - 2)); // Aumentar velocidad
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, isPlaying, checkCollision, generateFood, score, highScore]);

  // Configurar interval del juego
  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = setInterval(gameLoop, gameSpeed);
    } else {
      clearInterval(gameLoopRef.current);
    }

    return () => clearInterval(gameLoopRef.current);
  }, [gameLoop, gameSpeed, isPlaying, gameOver]);

  // Controles de teclado
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isPlaying) return;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
        case ' ':
          e.preventDefault();
          toggleGame();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, isPlaying]);

  // Controles táctiles
  const handleDirectionChange = (newDirection) => {
    if (!isPlaying) return;
    
    // Evitar movimiento en dirección opuesta
    if (
      (newDirection.x === 1 && direction.x === -1) ||
      (newDirection.x === -1 && direction.x === 1) ||
      (newDirection.y === 1 && direction.y === -1) ||
      (newDirection.y === -1 && direction.y === 1)
    ) {
      return;
    }
    
    setDirection(newDirection);
  };

  // Controles de swipe para móviles
  useEffect(() => {
    let startX, startY;
    
    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    
    const handleTouchEnd = (e) => {
      if (!startX || !startY || !isPlaying) return;
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const diffX = endX - startX;
      const diffY = endY - startY;
      
      const minSwipeDistance = 30;
      
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Movimiento horizontal
        if (Math.abs(diffX) > minSwipeDistance) {
          if (diffX > 0 && direction.x === 0) {
            setDirection({ x: 1, y: 0 }); // Derecha
          } else if (diffX < 0 && direction.x === 0) {
            setDirection({ x: -1, y: 0 }); // Izquierda
          }
        }
      } else {
        // Movimiento vertical
        if (Math.abs(diffY) > minSwipeDistance) {
          if (diffY > 0 && direction.y === 0) {
            setDirection({ x: 0, y: 1 }); // Abajo
          } else if (diffY < 0 && direction.y === 0) {
            setDirection({ x: 0, y: -1 }); // Arriba
          }
        }
      }
    };
    
    const gameArea = gameAreaRef.current;
    if (gameArea) {
      gameArea.addEventListener('touchstart', handleTouchStart);
      gameArea.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        gameArea.removeEventListener('touchstart', handleTouchStart);
        gameArea.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [direction, isPlaying]);

  const toggleGame = () => {
    setIsPlaying(!isPlaying);
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(INITIAL_FOOD);
    setGameOver(false);
    setScore(0);
    setIsPlaying(false);
    setGameSpeed(150);
    setShowScoreForm(false);
    setPlayerName('');
    setPlayerEmail('');
    setIsSubmitting(false);
    setSubmitSuccess(false);
  };

  const startGame = () => {
    if (gameOver) {
      resetGame();
    }
    setIsPlaying(true);
  };

  // Función para enviar puntuación a la base de datos
  const submitScore = async (e) => {
    e.preventDefault();
    
    if (!playerName.trim() || !playerEmail.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Aquí harías la llamada a tu API backend
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerName: playerName.trim(),
          playerEmail: playerEmail.trim(),
          score: score,
          date: new Date().toISOString()
        })
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setShowScoreForm(false);
        // Opcional: actualizar el high score desde el servidor
        // const data = await response.json();
        // if (data.newHighScore) setHighScore(data.newHighScore);
      } else {
        throw new Error('Error al guardar la puntuación');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar la puntuación. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const skipScoreSubmission = () => {
    setShowScoreForm(false);
    setPlayerName('');
    setPlayerEmail('');
  };

  return (
    <div className="game-container">
      <div className="game-board">
        {/* Header */}
        <div className="game-header">
          <h1 className="game-title">🐍 Snake Game</h1>
          <div className="score-container">
            <div className="score">Score: <span className="score-value">{score}</span></div>
            <div className="high-score">High Score: <span className="high-score-value">{highScore}</span></div>
          </div>
        </div>

        {/* Área de juego */}
        <div 
          ref={gameAreaRef}
          className="game-area"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
          }}
        >
          {/* Snake */}
          {snake.map((segment, index) => (
            <div
              key={index}
              className={`snake-segment ${index === 0 ? 'snake-head' : 'snake-body'}`}
              style={{
                gridColumn: segment.x + 1,
                gridRow: segment.y + 1
              }}
            />
          ))}
          
          {/* Food */}
          <div
            className="food"
            style={{
              gridColumn: food.x + 1,
              gridRow: food.y + 1
            }}
          />

          {/* Game Over Overlay */}
          {gameOver && !showScoreForm && (
            <div className="game-over-overlay">
              <div className="game-over-content">
                <h2 className="game-over-title">Game Over!</h2>
                <p className="game-over-score">Score: {score}</p>
                {submitSuccess && (
                  <p className="submit-success">¡Puntuación guardada exitosamente!</p>
                )}
                <button onClick={startGame} className="btn btn-primary">
                  Play Again
                </button>
              </div>
            </div>
          )}

          {/* Score Submission Form */}
          {showScoreForm && (
            <div className="game-over-overlay">
              <div className="score-form-content">
                <h2 className="form-title">¡Registra tu puntuación!</h2>
                <p className="form-score">Tu puntuación: <span>{score}</span></p>
                
                <form onSubmit={submitScore} className="score-form">
                  <div className="form-group">
                    <label htmlFor="playerName">Nombre:</label>
                    <input
                      type="text"
                      id="playerName"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Tu nombre"
                      required
                      maxLength={50}
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="playerEmail">Correo electrónico:</label>
                    <input
                      type="email"
                      id="playerEmail"
                      value={playerEmail}
                      onChange={(e) => setPlayerEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      maxLength={100}
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="form-buttons">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Guardando...' : 'Guardar Puntuación'}
                    </button>
                    <button 
                      type="button" 
                      onClick={skipScoreSubmission}
                      className="btn btn-secondary"
                      disabled={isSubmitting}
                    >
                      Saltar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Controles */}
        <div className="controls-container">
          {/* Botones de control */}
          <div className="game-controls">
            <button
              onClick={startGame}
              disabled={isPlaying && !gameOver}
              className="btn btn-start"
            >
              <Play size={16} />
              Start
            </button>
            <button
              onClick={toggleGame}
              disabled={gameOver}
              className="btn btn-pause"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? 'Pause' : 'Resume'}
            </button>
            <button onClick={resetGame} className="btn btn-reset">
              <RotateCcw size={16} />
              Reset
            </button>
          </div>

          {/* Controles direccionales táctiles */}
          <div className="direction-controls">
            <div></div>
            <button
              onClick={() => handleDirectionChange({ x: 0, y: -1 })}
              className="direction-btn"
            >
              <ChevronUp size={24} />
            </button>
            <div></div>
            
            <button
              onClick={() => handleDirectionChange({ x: -1, y: 0 })}
              className="direction-btn"
            >
              <ChevronLeft size={24} />
            </button>
            <div></div>
            <button
              onClick={() => handleDirectionChange({ x: 1, y: 0 })}
              className="direction-btn"
            >
              <ChevronRight size={24} />
            </button>
            
            <div></div>
            <button
              onClick={() => handleDirectionChange({ x: 0, y: 1 })}
              className="direction-btn"
            >
              <ChevronDown size={24} />
            </button>
            <div></div>
          </div>

          {/* Instrucciones */}
          <div className="instructions">
            <p>🎮 Usa las flechas del teclado, los botones o desliza para mover</p>
            <p>📱 Optimizado para tablets y móviles</p>
            <p>🍎 Come la comida roja para crecer</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;