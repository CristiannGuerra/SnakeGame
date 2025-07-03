import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';
import './App.css';
import './index.css';

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
  };

  const startGame = () => {
    if (gameOver) {
      resetGame();
    }
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex flex-col items-center justify-center p-4">
      <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-green-400/20">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-green-400 mb-2">🐍 Snake Game</h1>
          <div className="flex justify-center gap-8 text-green-300">
            <div>Score: <span className="text-yellow-400 font-bold">{score}</span></div>
            <div>High Score: <span className="text-orange-400 font-bold">{highScore}</span></div>
          </div>
        </div>

        {/* Área de juego */}
        <div 
          ref={gameAreaRef}
          className="relative bg-gray-900 border-2 border-green-400 rounded-lg mx-auto touch-none"
          style={{
            width: '320px',
            height: '320px',
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
          }}
        >
          {/* Snake */}
          {snake.map((segment, index) => (
            <div
              key={index}
              className={`${
                index === 0 
                  ? 'bg-green-400 border border-green-200' 
                  : 'bg-green-500 border border-green-300'
              } rounded-sm`}
              style={{
                gridColumn: segment.x + 1,
                gridRow: segment.y + 1
              }}
            />
          ))}
          
          {/* Food */}
          <div
            className="bg-red-500 rounded-full border border-red-300 animate-pulse"
            style={{
              gridColumn: food.x + 1,
              gridRow: food.y + 1
            }}
          />

          {/* Game Over Overlay */}
          {gameOver && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-red-400 mb-2">Game Over!</h2>
                <p className="text-green-300 mb-4">Score: {score}</p>
                <button
                  onClick={startGame}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Controles */}
        <div className="mt-6">
          {/* Botones de control */}
          <div className="flex justify-center gap-4 mb-4">
            <button
              onClick={startGame}
              disabled={isPlaying && !gameOver}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2"
            >
              <Play size={16} />
              Start
            </button>
            <button
              onClick={toggleGame}
              disabled={gameOver}
              className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-500 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? 'Pause' : 'Resume'}
            </button>
            <button
              onClick={resetGame}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>

          {/* Controles direccionales táctiles */}
          <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto">
            <div></div>
            <button
              onClick={() => handleDirectionChange({ x: 0, y: -1 })}
              className="bg-gray-700 hover:bg-gray-600 text-green-400 p-3 rounded-lg transition-colors touch-manipulation"
            >
              <ChevronUp size={24} />
            </button>
            <div></div>
            
            <button
              onClick={() => handleDirectionChange({ x: -1, y: 0 })}
              className="bg-gray-700 hover:bg-gray-600 text-green-400 p-3 rounded-lg transition-colors touch-manipulation"
            >
              <ChevronLeft size={24} />
            </button>
            <div></div>
            <button
              onClick={() => handleDirectionChange({ x: 1, y: 0 })}
              className="bg-gray-700 hover:bg-gray-600 text-green-400 p-3 rounded-lg transition-colors touch-manipulation"
            >
              <ChevronRight size={24} />
            </button>
            
            <div></div>
            <button
              onClick={() => handleDirectionChange({ x: 0, y: 1 })}
              className="bg-gray-700 hover:bg-gray-600 text-green-400 p-3 rounded-lg transition-colors touch-manipulation"
            >
              <ChevronDown size={24} />
            </button>
            <div></div>
          </div>

          {/* Instrucciones */}
          <div className="text-center mt-4 text-green-300 text-sm">
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