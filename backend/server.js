import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config()

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json(
  {limit: '50mb'}
));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Demasiadas peticiones desde esta IP'
});
app.use('/api/', limiter);

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/snake-game', {})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Esquema de puntuación
const scoreSchema = new mongoose.Schema({
  playerName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50
  },
  playerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxLength: 100,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 999999
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices para mejorar rendimiento
scoreSchema.index({ score: -1 });
scoreSchema.index({ date: -1 });
scoreSchema.index({ playerEmail: 1 });

const Score = mongoose.model('Score', scoreSchema);

// Ruta de salud para verificar que el servidor funciona
app.get('/', (req, res) => {
  res.json({ 
    message: 'Snake Game API funcionando correctamente',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Rutas

// GET - Obtener mejores puntuaciones
app.get('/api/scores', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const scores = await Score.find()
      .sort({ score: -1, date: -1 })
      .limit(Math.min(limit, 100)) // Máximo 100 registros
      .skip(skip)
      .select('playerName score date -_id');

    const totalScores = await Score.countDocuments();
    const totalPages = Math.ceil(totalScores / limit);

    res.json({
      success: true,
      data: scores,
      pagination: {
        currentPage: page,
        totalPages,
        totalScores,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error obteniendo puntuaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST - Guardar nueva puntuación
app.post('/api/scores', async (req, res) => {
  try {
    const { playerName, playerEmail, score } = req.body;

    // Validaciones
    if (!playerName || !playerEmail || score === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    if (typeof score !== 'number' || score < 0 || score > 999999) {
      return res.status(400).json({
        success: false,
        message: 'Puntuación inválida'
      });
    }

    if (playerName.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'El nombre es demasiado largo'
      });
    }

    if (playerEmail.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'El email es demasiado largo'
      });
    }

    // Verificar si ya existe una puntuación reciente del mismo email
    const recentScore = await Score.findOne({
      playerEmail: playerEmail.toLowerCase(),
      date: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // 5 minutos
    });

    if (recentScore) {
      return res.status(429).json({
        success: false,
        message: 'Debes esperar 5 minutos entre puntuaciones'
      });
    }

    // Crear nueva puntuación
    const newScore = new Score({
      playerName: playerName.trim(),
      playerEmail: playerEmail.trim().toLowerCase(),
      score,
    });

    await newScore.save();

    // Obtener nueva puntuación más alta
    const highestScore = await Score.findOne()
      .sort({ score: -1 })
      .select('score');

    res.status(201).json({
      success: true,
      message: 'Puntuación guardada exitosamente',
      data: {
        playerName: newScore.playerName,
        score: newScore.score,
        isNewHighScore: newScore.score === highestScore.score
      }
    });

  } catch (error) {
    console.error('Error guardando puntuación:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email duplicado en un corto período'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos: ' + error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Para Vercel, exporta la app
export default app;

// Solo inicia el servidor si no está en Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}