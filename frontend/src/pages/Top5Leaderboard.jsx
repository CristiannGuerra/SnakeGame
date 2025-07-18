import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Users, Calendar, RotateCcw } from 'lucide-react';
import ENVIROMENT from '../config/environment.config';
import './Top5Leaderboard.css';

const Top5Leaderboard = () => {
  const [topScores, setTopScores] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTop5Scores();
    fetchStats();
  }, []);

  const fetchTop5Scores = async () => {
    try {
      const response = await fetch(`${ENVIROMENT.URL_API}api/scores/top5`);
      const data = await response.json();
      
      if (data.success) {
        setTopScores(data.data);
      } else {
        setError('Error al cargar las puntuaciones');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${ENVIROMENT.URL_API}api/scores/stats`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPositionIcon = (position) => {
    switch (position) {
      case 1:
        return <Trophy className="position-icon gold" />;
      case 2:
        return <Medal className="position-icon silver" />;
      case 3:
        return <Award className="position-icon bronze" />;
      default:
        return <div className="position-icon other">{position}</div>;
    }
  };

  const getPositionClass = (position) => {
    return `score-item position-${position}`;
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    fetchTop5Scores();
    fetchStats();
  };

  if (loading) {
    return (
      <div className="leaderboard-container">
        <div className="leaderboard-card">
          <div className="loading-state">
            <div className="loading-skeleton header"></div>
            <div className="loading-skeleton item"></div>
            <div className="loading-skeleton item"></div>
            <div className="loading-skeleton item"></div>
            <div className="loading-skeleton item"></div>
            <div className="loading-skeleton item"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-container">
        <div className="leaderboard-card">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <div className="error-title">Error</div>
            <div className="error-message">{error}</div>
            <button 
              onClick={handleRetry}
              className="btn btn-retry"
            >
              <RotateCcw size={16} />
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      {/* Header */}
      <div className="leaderboard-card">
        <div className="leaderboard-header">
          <h1 className="leaderboard-title">
            🏆 Top 5 Snake Game Leaderboard
          </h1>
          <p className="leaderboard-subtitle">Los mejores jugadores del Snake Game</p>
        </div>
      </div>

      {/* Estadísticas generales */}
      {stats && (
        <div className="leaderboard-card">
          <div className="stats-section">
            <h2 className="stats-title">
              <Users size={20} />
              Estadísticas Generales
            </h2>
            <div className="stats-grid">
              <div className="stat-card highest-score">
                <div className="stat-value">{stats.highestScore}</div>
                <div className="stat-label">Mejor Puntuación</div>
              </div>
              <div className="stat-card total-games">
                <div className="stat-value">{stats.totalGames}</div>
                <div className="stat-label">Partidas Jugadas</div>
              </div>
              <div className="stat-card total-players">
                <div className="stat-value">{stats.totalPlayers}</div>
                <div className="stat-label">Jugadores Únicos</div>
              </div>
              <div className="stat-card average-score">
                <div className="stat-value">{stats.averageScore}</div>
                <div className="stat-label">Promedio</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top 5 Leaderboard */}
      <div className="leaderboard-card">
        <div className="top5-section">
          <h2 className="top5-title">
            <Trophy size={20} />
            Top 5 Mejores Puntuaciones
          </h2>
          
          {topScores.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-emoji">🎮</span>
              <div className="empty-state-title">No hay puntuaciones registradas aún</div>
              <div className="empty-state-subtitle">¡Sé el primero en jugar!</div>
            </div>
          ) : (
            <div className="scores-list">
              {topScores.map((score, index) => (
                <div
                  key={`${score.playerName}-${score.score}-${score.date}-${index}`}
                  className={getPositionClass(score.position)}
                >
                  {/* Posición */}
                  <div className="position-icon-container">
                    {getPositionIcon(score.position)}
                  </div>
                  
                  {/* Información del jugador */}
                  <div className="player-info">
                    <div className="player-name">
                      {score.playerName}
                    </div>
                    <div className="player-date">
                      <Calendar size={16} />
                      {score.date}
                    </div>
                  </div>
                  
                  {/* Puntuación */}
                  <div className="score-display">
                    <div className="score-value">
                      {score.score.toLocaleString()}
                    </div>
                    <div className="score-label">puntos</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Botón para actualizar */}
      <div className="leaderboard-actions">
        <button
          onClick={handleRetry}
          className="btn btn-primary"
        >
          <RotateCcw size={16} />
          Actualizar Clasificación
        </button>
      </div>
    </div>
  );
};

export default Top5Leaderboard;