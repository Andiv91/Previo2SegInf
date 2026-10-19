# 🛡️ Protocolo Sentinel // Reto CTF de Seguridad Informática (Previo 2)

> **Plataforma Web de Desafío Criptográfico y Captura de Bandera (CTF)**  
> **Autores:** Ángel & Josué  
> **Asignatura:** Seguridad Informática — Previo 2  
> **Público Objetivo:** Equipo rival (3 Analistas)

---

## 🚀 Descripción del Proyecto
**Protocolo Sentinel** es un desafío interactivo estilo *Capture The Flag (CTF)* diseñado para evaluar competencias en ciberseguridad, análisis forense y criptografía aplicada.

El equipo rival debe analizar 4 vectores de seguridad independientes para restaurar el nodo central y capturar la bandera oficial (`The Flag`):

1. **Casilla 1 - Calibración del Sistema:** Identificador académico del examen.
2. **Casilla 2 - Reconocimiento Web & F12:** Análisis de comentarios ocultos en el DOM y mensajes en consola de desarrollo.
3. **Casilla 3 - Análisis Forense & Metadatos:** Extracción de metadatos EXIF reales incrustados en la imagen de evidencia.
4. **Casilla 4 - Criptografía Clásica (Cifrado Hill):** Descifrado de criptograma con matriz $2 \times 2$ mediante aritmética modular (mod 26).

---

## 🛠️ Tecnologías y Arquitectura

* **Frontend:** HTML5 semántico, CSS3 modular (Modo Oscuro Cyberpunk / SOC), Web Audio API para efectos de sonido nativos, Canvas Confetti.
* **Backend:** Node.js con Express para servir estáticos y exponer endpoints de auditoría.
* **Base de Datos:** **Neon PostgreSQL** serverless (registro de intentos, auditoría y captura de banderas).
* **Seguridad:** Validación de claves mediante **Hashes SHA-256** unidireccionales (anti-cheat en frontend y backend).
* **Despliegue:** Render Web Service (compatible con Blueprint `render.yaml`).

---

## 📊 Endpoints de la API

* `GET /api/health` — Estado del servicio y conectividad con Neon PostgreSQL.
* `POST /api/verify` — Valida respuestas de cada casilla y audita los intentos en base de datos.
* `POST /api/complete` — Registra la captura de la bandera (`FLAG{...}`) y el equipo victorioso.
* `GET /api/leaderboard` — Historial de resoluciones registradas en Neon DB.

---

## ⚙️ Despliegue en Render & Neon

### 1. Conexión con Neon PostgreSQL
1. Crea tu base de datos o rama en [Neon Console](https://console.neon.tech).
2. Copia la cadena de conexión (`postgresql://...`).

### 2. Despliegue en Render
1. Conecta este repositorio en [Render Dashboard](https://dashboard.render.com).
2. Configura:
   * **Runtime:** Node
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
3. Agrega la variable de entorno:
   * `DATABASE_URL` = Cadena de conexión de Neon PostgreSQL.
4. Las tablas `team_submissions` y `completed_flags` se sincronizan automáticamente al iniciar el servidor.
