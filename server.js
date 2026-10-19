require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Conexión a Neon PostgreSQL
let pool = null;
let isDbConnected = false;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Inicialización automática de tablas en Neon
    pool.query(`
      CREATE TABLE IF NOT EXISTS team_submissions (
        id SERIAL PRIMARY KEY,
        team_name VARCHAR(100) DEFAULT 'Equipo Rival',
        challenge_id INT NOT NULL,
        submitted_answer TEXT,
        is_correct BOOLEAN,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS completed_flags (
        id SERIAL PRIMARY KEY,
        team_name VARCHAR(100) DEFAULT 'Equipo Rival',
        flag VARCHAR(100) NOT NULL,
        ip_address VARCHAR(45),
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `).then(() => {
      isDbConnected = true;
      console.log('✅ [NEON DB] Tablas sincronizadas y base de datos conectada.');
    }).catch(err => {
      console.warn('⚠️ [NEON DB] Error inicializando tablas:', err.message);
    });
  } catch (err) {
    console.warn('⚠️ [NEON DB] Error creando pool de conexiones:', err.message);
  }
} else {
  console.log('ℹ️ [MODO LOCAL] Variable DATABASE_URL no detectada. Funcionando en memoria.');
}

// Hashes oficiales de validación
const TARGET_HASHES = {
  1: ["44298a92b897ce38aaa79c49c4995fb7f834da2f639cb7b59061632206ec7296"], // PREVIO2
  2: ["f702c2ea8122e9b588d2ecbeb313300a6153a21ad0f4bdc8a6acdd8e36a4b6cd"], // DEV_KEY_F12_2026
  3: [
    "83772f07995a63edcc7f4249002cc2326075638887b8c691f4515c430174efda", // EXIF_FORENSE_2026
    "8dec96896d893c7bfef3b467c2bd3d3464afce51b9c65b7aac3237361dc48f77"  // METADATA_NODE_77
  ],
  4: [
    "064866d6167ab12bacb2637bfe8c809372f3069fd075e1ccb3dd5425d364d137", // HACK
    "6a1e963371a64b32aff302ef7f3a7d6df8df903fce10f3db6ee918f18ac11f2a"  // FLAG
  ]
};

const DIRECT_ANSWERS = {
  1: ["PREVIO2"],
  2: ["DEV_KEY_F12_2026"],
  3: ["EXIF_FORENSE_2026", "METADATA_NODE_77"],
  4: ["HACK", "FLAG"]
};

// ENDPOINTS API

// 1. Healthcheck y estado de la base de datos Neon
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  if (pool) {
    try {
      await pool.query('SELECT 1');
      dbStatus = 'connected';
    } catch (e) {
      dbStatus = 'error: ' + e.message;
    }
  }
  res.json({
    status: 'online',
    app: 'Protocolo Sentinel CTF',
    authors: 'Ángel & Josué',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// 2. Verificación de respuesta y registro de auditoría en Neon
app.post('/api/verify', async (req, res) => {
  const { challengeId, answer, teamName = 'Equipo Rival' } = req.body;

  if (!challengeId || !answer) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos.' });
  }

  const cleanAnswer = String(answer).trim().toUpperCase();
  const hash = crypto.createHash('sha256').update(cleanAnswer).digest('hex');

  const isValid = 
    (TARGET_HASHES[challengeId] && TARGET_HASHES[challengeId].includes(hash)) ||
    (DIRECT_ANSWERS[challengeId] && DIRECT_ANSWERS[challengeId].includes(cleanAnswer));

  // Registrar intento en Neon DB
  if (pool) {
    try {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      await pool.query(
        'INSERT INTO team_submissions (team_name, challenge_id, submitted_answer, is_correct, ip_address) VALUES ($1, $2, $3, $4, $5)',
        [teamName, challengeId, cleanAnswer, isValid, String(clientIp)]
      );
    } catch (err) {
      console.warn('⚠️ No se pudo registrar intento en DB:', err.message);
    }
  }

  if (isValid) {
    return res.json({
      success: true,
      challengeId,
      message: '¡Fase desbloqueada correctamente!'
    });
  } else {
    return res.json({
      success: false,
      challengeId,
      message: 'Clave incorrecta. Analiza las pistas.'
    });
  }
});

// 3. Registro de Captura de Bandera (Victoria) en Neon
app.post('/api/complete', async (req, res) => {
  const { teamName = 'Equipo Rival', flag } = req.body;
  const officialFlag = 'FLAG{PREVIO2_F12_FORENSIC_HILL_SUCCESS}';

  if (flag !== officialFlag) {
    return res.status(400).json({ success: false, message: 'Bandera inválida.' });
  }

  let dbSaved = false;
  if (pool) {
    try {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      await pool.query(
        'INSERT INTO completed_flags (team_name, flag, ip_address) VALUES ($1, $2, $3)',
        [teamName, flag, String(clientIp)]
      );
      dbSaved = true;
    } catch (err) {
      console.warn('⚠️ No se pudo registrar victoria en DB:', err.message);
    }
  }

  res.json({
    success: true,
    message: '¡Victoria registrada exitosamente en Neon PostgreSQL!',
    teamName,
    dbSaved
  });
});

// 4. Auditoría / Historial de victorias
app.get('/api/leaderboard', async (req, res) => {
  if (!pool) {
    return res.json({ message: 'Base de datos no conectada en modo local.', results: [] });
  }

  try {
    const result = await pool.query(
      'SELECT id, team_name, flag, completed_at FROM completed_flags ORDER BY completed_at DESC LIMIT 20'
    );
    res.json({ success: true, leaderboard: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Servir la página principal
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor CTF ejecutándose en http://localhost:${PORT}`);
});
