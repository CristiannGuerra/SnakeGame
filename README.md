# 🐍 Snake Game

Juego clásico de Snake desarrollado con tecnologías web modernas. Proyecto realizado para una muestra pedagógica en el marco de la Feria de Ciencias Instancia Regional de Resistencia, Chaco.

## 🎯 Características

- Juego Snake clásico con controles de teclado y táctiles
- Sistema de puntuación con leaderboard
- Base de datos para almacenar mejores puntuaciones
- Interfaz responsive optimizada para móviles y tablets
- Controles por gestos de deslizamiento (swipe)
- Estadísticas de juego en tiempo real

## 🚀 Tecnologías Utilizadas

### Frontend
- React 19.1.0
- Tailwind CSS 4.1.11
- Vite 7.0.0
- React Router DOM
- Lucide React (iconos)

### Backend
- Node.js
- Express.js 4.18.2
- MongoDB con Mongoose 8.16.2
- Helmet (seguridad)
- CORS
- Rate limiting

## 📁 Estructura del Proyecto

```
snake-game/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── SnakeGame.jsx
│   │   │   ├── SnakeGame.css
│   │   │   ├── Top5Leaderboard.jsx
│   │   │   └── Top5Leaderboard.css
│   │   ├── config/
│   │   │   └── environment.config.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── backend/
    ├── server.js
    └── package.json
```

## 🎮 Funcionalidades

### Juego Principal
- Controles con teclas de flecha
- Controles táctiles con botones direccionales
- Gestos de deslizamiento en dispositivos móviles
- Incremento de velocidad progresivo
- Sistema de pausar/reanudar

### Sistema de Puntuación
- Registro de puntuaciones con nombre y email
- Validación de datos del lado servidor
- Prevención de spam con límite de tiempo
- Leaderboard top 5
- Estadísticas generales del juego

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js
- MongoDB (local o Atlas)

### Backend
```bash
cd backend
npm install
```

Crear archivo `.env`:
```
MONGODB_URI=tu_conexion_mongodb
PORT=5000
```

Ejecutar:
```bash
npm run dev    # desarrollo
npm start      # producción
```

### Frontend
```bash
cd frontend
npm install
```

Crear archivo `.env`:
```
VITE_URL_API=http://localhost:5000/
```

Ejecutar:
```bash
npm run dev    # desarrollo
npm run build  # producción
```

## 📱 Características Responsive

- Diseño adaptable para móviles, tablets y escritorio
- Controles táctiles optimizados
- Gestos de deslizamiento intuitivos
- Interfaz escalable según el tamaño de pantalla

## 🎨 Diseño

- Esquema de colores verde neón sobre fondo oscuro
- Efectos visuales con CSS (gradientes, sombras, animaciones)
- Interfaz moderna con glassmorphism
- Iconos de Lucide React

## 🔧 API Endpoints

- `GET /` - Estado del servidor
- `GET /api/scores` - Obtener puntuaciones paginadas
- `POST /api/scores` - Guardar nueva puntuación
- `GET /api/scores/top5` - Top 5 mejores puntuaciones
- `GET /api/scores/stats` - Estadísticas generales

## 📊 Base de Datos

### Esquema Score
```javascript
{
  playerName: String (requerido, max 50 caracteres),
  playerEmail: String (requerido, max 100 caracteres),
  score: Number (requerido, 0-999999),
  date: Date (automático),
  timestamps: true
}
```

## 🎓 Contexto Educativo

Este proyecto fue desarrollado como muestra pedagógica para la **Feria de Ciencias Instancia Regional de Resistencia, Chaco**, demostrando la aplicación práctica de tecnologías web modernas en el desarrollo de aplicaciones interactivas.

## 👨‍💻 Autor

Cristian

## 📄 Licencia

ISC
