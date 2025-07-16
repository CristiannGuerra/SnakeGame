import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Users, Calendar } from 'lucide-react';
import ENVIROMENT from '../config/environment.config';

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
      const response = await fetch(`${ENVIROMENT.URL_API}/api/scores/top5`);
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
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">{position}</div>;
    }
  };

  const getPositionClass = (position) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-300';
      default:
        return 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-2">⚠️ Error</div>
          <div className="text-red-800">{error}</div>
          <button 
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchTop5Scores();
              fetchStats();
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🏆 Top 5 Snake Game Leaderboard
        </h1>
        <p className="text-gray-600">Los mejores jugadores del Snake Game</p>
      </div>

      {/* Estadísticas generales */}
      {stats && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            Estadísticas Generales
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.highestScore}</div>
              <div className="text-sm text-green-800">Mejor Puntuación</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalGames}</div>
              <div className="text-sm text-blue-800">Partidas Jugadas</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.totalPlayers}</div>
              <div className="text-sm text-purple-800">Jugadores Únicos</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.averageScore}</div>
              <div className="text-sm text-orange-800">Promedio</div>
            </div>
          </div>
        </div>
      )}

      {/* Top 5 Leaderboard */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
          Top 5 Mejores Puntuaciones
        </h2>
        
        {topScores.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-6xl mb-4">🎮</div>
            <div className="text-lg">No hay puntuaciones registradas aún</div>
            <div className="text-sm mt-2">¡Sé el primero en jugar!</div>
          </div>
        ) : (
          <div className="space-y-3">
            {topScores.map((score) => (
              <div
                key={`${score.playerName}-${score.score}-${score.date}`}
                className={`flex items-center p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${getPositionClass(score.position)}`}
              >
                {/* Posición */}
                <div className="flex-shrink-0 mr-4">
                  {getPositionIcon(score.position)}
                </div>
                
                {/* Información del jugador */}
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-800 text-lg">
                        {score.playerName}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {score.date}
                      </div>
                    </div>
                    
                    {/* Puntuación */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-800">
                        {score.score.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">puntos</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón para actualizar */}
      <div className="text-center">
        <button
          onClick={() => {
            setLoading(true);
            fetchTop5Scores();
            fetchStats();
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          🔄 Actualizar Clasificación
        </button>
      </div>
    </div>
  );
};

export default Top5Leaderboard;