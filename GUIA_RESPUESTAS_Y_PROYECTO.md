# 🛡️ INFORME TÉCNICO Y SOLUCIONARIO OFICIAL // PROTOCOLO SENTINEL (CTF)

**Asignatura:** Seguridad Informática — Evaluación: Previo 2  
**Autores del Proyecto:** Ángel y Josué  
**Destinatarios:** Profesor Evaluador y Equipo Rival de 3 Analistas  
**Repositorio Oficial GitHub:** [https://github.com/Andiv91/Previo2SegInf](https://github.com/Andiv91/Previo2SegInf)

---

## 1. 📋 Resumen Ejecutivo del Proyecto

El presente proyecto consiste en el diseño, desarrollo e implementación de una plataforma web interactiva de tipo **CTF (Capture The Flag)** denominada **«Protocolo Sentinel: Incidente en el Nodo Central»**. 

La plataforma está diseñada específicamente para que un equipo rival de 3 analistas ponga a prueba sus conocimientos teóricos y prácticos adquiridos en clase de Seguridad Informática, abarcando:
* **Criptografía clásica (Cifrado Hill con matrices $2 \times 2$).**
* **Funciones Hash unidireccionales (SHA-1 y SHA-256).**
* **Análisis forense digital y extracción de metadatos (EXIF).**
* **Auditoría de seguridad web (Inspección del código fuente con F12).**
* **Arquitectura Cliente/Servidor Cloud con persistencia de auditoría en Neon PostgreSQL y despliegue en Render.**

La interfaz restringe el acceso al sistema mediante **4 casillas de autenticación**. Al completar satisfactoriamente los 4 vectores, el sistema autovalida la solución, dispara efectos sonoros sintetizados nativamente, despliega lluvia de confeti virtual y entrega la bandera oficial de la victoria (`The Flag`).

---

## 2. 🏗️ ¿Cómo se hizo? (Arquitectura Técnica y Desarrollo)

El desarrollo del proyecto se estructuró en cuatro capas desacopladas pero integradas de forma nativa:

```
┌────────────────────────────────────────────────────────┐
│                   FRONTEND AUTÓNOMO                    │
│      HTML5 Semántico + CSS3 Dark SOC + Web Audio       │
│           (Sin dependencias de CDN externas)           │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼ Peticiones REST / API
┌────────────────────────────────────────────────────────┐
│                   BACKEND EXPRESS                      │
│            Node.js + Express (server.js)               │
│          Endpoints: /api/verify, /api/complete         │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼ Pool SSL (pg)
┌────────────────────────────────────────────────────────┐
│                 NEON POSTGRESQL (CLOUD)                │
│    Tablas de Auditoría: team_submissions / flags       │
└────────────────────────────────────────────────────────┘
```

### 2.1. Frontend Autónomo y Resiliente
* **HTML5 y CSS3 ([index.html](file:///C:/Users/mater/Documents/TrabajosWeb/SegInform/index.html) y [style.css](file:///C:/Users/mater/Documents/TrabajosWeb/SegInform/style.css)):**  
  Se implementó una interfaz gráfica completa con temática de ciberseguridad (estilo Centro de Operaciones de Seguridad - SOC). No depende de CDNs externas para su renderizado, garantizando que los íconos SVG, la cuadrícula responsiva, el modo oscuro y las ventanas modales funcionen al 100% incluso sin acceso a internet.
* **Efectos de Sonido Nativos (Web Audio API en [script.js](file:///C:/Users/mater/Documents/TrabajosWeb/SegInform/script.js)):**  
  En lugar de cargar archivos `.mp3` o `.wav` pesados, se utilizó la API nativa `AudioContext` para sintetizar frecuencias de audio en tiempo real:
  - *Tono de éxito:* Acorde ascendente C5 - E5 - G5 - C6 en onda triangular.
  - *Tono de fallo:* Sonido grave disonante en onda diente de sierra (sawtooth).
  - *Fanfarria de victoria:* Secuencia melódica de 7 tonos al desbloquear la bandera.

### 2.2. Backend y Auditoría Forense en la Nube ([server.js](file:///C:/Users/mater/Documents/TrabajosWeb/SegInform/server.js))
* Servidor implementado con **Node.js** y **Express**.
* Gestiona las peticiones de verificación de respuestas y el registro de la bandera capturada.
* **Conexión a Neon PostgreSQL:**  
  Utiliza el cliente `pg` con soporte para SSL (`rejectUnauthorized: false`). Si la variable de entorno `DATABASE_URL` está configurada, el backend inicializa automáticamente dos tablas relacionales para auditar los intentos del equipo rival:
  ```sql
  -- Tabla para auditar cada intento (correcto o fallido)
  CREATE TABLE IF NOT EXISTS team_submissions (
    id SERIAL PRIMARY KEY,
    team_name VARCHAR(100) DEFAULT 'Equipo Rival',
    challenge_id INT NOT NULL,
    submitted_answer TEXT,
    is_correct BOOLEAN,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Tabla para registrar la captura definitiva de la bandera
  CREATE TABLE IF NOT EXISTS completed_flags (
    id SERIAL PRIMARY KEY,
    team_name VARCHAR(100) DEFAULT 'Equipo Rival',
    flag VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45),
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```

### 2.3. Anti-Cheat Criptográfico (Protección contra trampa por F12)
Un problema común en los retos CTF web es que los estudiantes abren el archivo JavaScript en las herramientas de desarrollo y buscan condiciones directas como `if (input === "CLAVE")`.  
Para evitar esto y aplicar la teoría de **Hashes Criptográficos Unidireccionales**:
* El código del frontend **no almacena las soluciones en texto plano**.
* Almacena únicamente el resumen criptográfico **SHA-256** de cada respuesta correcta.
* Cuando el usuario ingresa un texto, el navegador calcula dinámicamente `SHA-256(input.trim().toUpperCase())` y lo compara con el hash objetivo.
* Gracias a la propiedad de **preimagen** de los hashes criptográficos, es computacionalmente imposible para el equipo rival revertir el hash para descubrir la clave.

---

## 3. 🎯 ¿Qué se hizo? (Los 4 Retos en Detalle)

| Casilla | Nombre del Reto | Vector de Seguridad | Dificultad | Solución Exacta |
|---|---|---|---|---|
| **#01** | **Calibración del Sistema** | Parámetro Académico Directo | Muy Fácil (Regalada) | `PREVIO2` |
| **#02** | **Reconocimiento del DOM** | Inspección Web / F12 | Fácil - Media | `DEV_KEY_F12_2026` |
| **#03** | **Análisis Forense** | Metadatos EXIF en Imagen | Media | `EXIF_FORENSE_2026` |
| **#04** | **Criptografía Clásica** | Cifrado Hill ($2 \times 2$, mod 26) | Media - Alta | `HACK` |

---

## 4. 🔑 Solucionario Oficial y Demostración Técnica

### 🟢 Casilla 1: Calibración Académica
* **Objetivo:** Asegurar que el equipo rival entienda la mecánica de entrada antes de avanzar a los desafíos complejos.
* **Pista:** La tarjeta indica: *"Para calibrar la conexión, introduce el identificador oficial de esta prueba. Revisa el nombre que aparece en la cabecera de la página."*
* **Respuesta:** `PREVIO2`  
* **Hash SHA-256:** `44298a92b897ce38aaa79c49c4995fb7f834da2f639cb7b59061632206ec7296`

---

### 🔵 Casilla 2: Reconocimiento Web & F12
* **Objetivo:** Simular una auditoría de seguridad frontend (Web Pentesting), donde desarrolladores descuidados dejan comentarios con credenciales o mensajes en la consola.
* **Pista:** La tarjeta indica: *"Revisa su código fuente con F12."*
* **Procedimiento de Resolución:**
  1. El rival abre las herramientas de desarrollo del navegador (`F12`) o hace clic derecho $\rightarrow$ *Inspeccionar*.
  2. En la pestaña **Elements**, al inicio del documento HTML, encuentran un bloque de comentarios con datos aparentemente de build y configuración:
     ```html
     <!-- ========================================== -->
     <!-- build=2.0.3 rev=7c1e0a sum=9f2c4b1e        -->
     <!-- cfg.a=QVJDSElWT19ERVZfMjAyNQ==             -->
     <!-- ak3L 0Qx9 rT7m pZ2b vN8s hY4e uA1d gF6c    -->
     <!-- mW3r bT8k x9Qp  DEV_KEY_F12_2026  nE5j q2Wv -->
     <!-- Lk0z Vu7s hD1t oR9g cX4a jB6y fS3p ew8n    -->
     <!-- ========================================== -->
     ```
  3. La clave está en texto plano en la línea `mW3r bT8k x9Qp DEV_KEY_F12_2026 nE5j q2Wv`. El valor `cfg.a` es un señuelo: decodifica a `ARCHIVO_DEV_2025`, no es la respuesta.
* **Respuesta:** `DEV_KEY_F12_2026`  
* **Hash SHA-256:** `f702c2ea8122e9b588d2ecbeb313300a6153a21ad0f4bdc8a6acdd8e36a4b6cd`

---

### 🟣 Casilla 3: Análisis Forense & Metadatos EXIF
* **Objetivo:** Evaluar la capacidad de los estudiantes para inspeccionar la metadata no visible de los archivos multimedia (estándar EXIF).
* **Pista:** La tarjeta indica: *"Descarga la imagen y examina sus Metadatos EXIF"*, con un botón para descargar el archivo original [evidencia_lab.jpg](file:///C:/Users/mater/Documents/TrabajosWeb/SegInform/assets/evidencia_lab.jpg).
* **Procedimiento de Resolución:**
  1. El analista descarga la imagen `evidencia_lab.jpg` a su computador.
  2. En Windows: Hace clic derecho sobre la imagen $\rightarrow$ **Propiedades** $\rightarrow$ pestaña **Detalles**.
  3. En Linux/Mac/Terminal: Ejecuta `exiftool evidencia_lab.jpg` o `strings evidencia_lab.jpg | grep EXIF`.
  4. Los campos **Descripción** y **Copyright** contienen la clave, sin prefijos:
     - *ImageDescription:* `EXIF_FORENSE_2026`
     - *Copyright:* `EXIF_FORENSE_2026`
     - *Artist:* `Angel y Josue - Seguridad Informatica`
* **Respuesta:** `EXIF_FORENSE_2026`  
* **Hash SHA-256:** `83772f07995a63edcc7f4249002cc2326075638887b8c691f4515c430174efda`

---

### 🟡 Casilla 4: Criptografía Clásica — Cifrado Hill (2x2)
* **Objetivo:** Demostrar la aplicación de matrices invertibles sobre aritmética modular ($\mathbb{Z}_{26}$) para romper un criptograma.
* **Datos proporcionados en la interfaz:**
  - Alfabeto estándar (módulo 26): $A=0, B=1, C=2, \dots, Z=25$.
  - Criptograma interceptado: `VOKC`
  - Matriz clave de cifrado:
    $$K = \begin{pmatrix} 3 & 3 \\ 2 & 5 \end{pmatrix}$$

#### **Demostración Matemática Paso a Paso:**

1. **Cálculo del Determinante de la Matriz:**
   $$\det(K) = (3 \times 5) - (3 \times 2) = 15 - 6 = 9 \pmod{26}$$

2. **Cálculo del Inverso Modular del Determinante ($\det(K)^{-1} \pmod{26}$):**  
   Buscamos un entero $d$ tal que $9 \cdot d \equiv 1 \pmod{26}$.
   $$9 \times 3 = 27 = 26(1) + 1 \equiv 1 \pmod{26} \implies \det(K)^{-1} = 3$$

3. **Cálculo de la Matriz Adjunta Transpuesta:**
   $$\text{Adj}(K) = \begin{pmatrix} 5 & -3 \\ -2 & 3 \end{pmatrix}$$
   Normalizando en módulo 26:
   - $-3 \equiv 26 - 3 = 23 \pmod{26}$
   - $-2 \equiv 26 - 2 = 24 \pmod{26}$
   $$\text{Adj}(K) \equiv \begin{pmatrix} 5 & 23 \\ 24 & 3 \end{pmatrix} \pmod{26}$$

4. **Cálculo de la Matriz Inversa ($K^{-1} = \det(K)^{-1} \cdot \text{Adj}(K) \pmod{26}$):**
   $$K^{-1} = 3 \cdot \begin{pmatrix} 5 & 23 \\ 24 & 3 \end{pmatrix} = \begin{pmatrix} 15 & 69 \\ 72 & 9 \end{pmatrix} \pmod{26}$$
   Reduciendo cada término módulo 26:
   - $15 \pmod{26} = 15$
   - $69 \pmod{26} = 69 - 2(26) = 17$
   - $72 \pmod{26} = 72 - 2(26) = 20$
   - $9 \pmod{26} = 9$
   $$\mathbf{K^{-1} = \begin{pmatrix} 15 & 17 \\ 20 & 9 \end{pmatrix}} \pmod{26}$$

5. **Descifrado de los Vectores del Criptograma:**  
   El criptograma `VOKC` se divide en dos bloques de 2 letras:
   - Bloque 1: `VO` $\rightarrow V=21, O=14 \implies C_1 = \begin{pmatrix} 21 \\ 14 \end{pmatrix}$
   - Bloque 2: `KC` $\rightarrow K=10, C=2 \implies C_2 = \begin{pmatrix} 10 \\ 2 \end{pmatrix}$

   * **Descifrado Bloque 1 ($P_1 = K^{-1} \cdot C_1$):**
     $$P_1 = \begin{pmatrix} 15 & 17 \\ 20 & 9 \end{pmatrix} \begin{pmatrix} 21 \\ 14 \end{pmatrix} = \begin{pmatrix} 15(21) + 17(14) \\ 20(21) + 9(14) \end{pmatrix} = \begin{pmatrix} 315 + 238 \\ 420 + 126 \end{pmatrix} = \begin{pmatrix} 553 \\ 546 \end{pmatrix}$$
     Reduciendo módulo 26:
     - $553 = 26 \times 21 + 7 \equiv \mathbf{7} \rightarrow \mathbf{H}$
     - $546 = 26 \times 21 + 0 \equiv \mathbf{0} \rightarrow \mathbf{A}$
     $$\text{Resultado Bloque 1:} \quad \mathbf{HA}$$

   * **Descifrado Bloque 2 ($P_2 = K^{-1} \cdot C_2$):**
     $$P_2 = \begin{pmatrix} 15 & 17 \\ 20 & 9 \end{pmatrix} \begin{pmatrix} 10 \\ 2 \end{pmatrix} = \begin{pmatrix} 15(10) + 17(2) \\ 20(10) + 9(2) \end{pmatrix} = \begin{pmatrix} 150 + 34 \\ 200 + 18 \end{pmatrix} = \begin{pmatrix} 184 \\ 218 \end{pmatrix}$$
     Reduciendo módulo 26:
     - $184 = 26 \times 7 + 2 \equiv \mathbf{2} \rightarrow \mathbf{C}$
     - $218 = 26 \times 8 + 10 \equiv \mathbf{10} \rightarrow \mathbf{K}$
     $$\text{Resultado Bloque 2:} \quad \mathbf{CK}$$

6. **Palabra en Claro Final:**
   $$\mathbf{HA} + \mathbf{CK} = \mathbf{HACK}$$

* **Respuesta:** `HACK`  
* **Hash SHA-256:** `064866d6167ab12bacb2637bfe8c809372f3069fd075e1ccb3dd5425d364d137`

---

## 🏆 5. La Bandera Final (The Flag)

Al completar las 4 casillas, el sistema evalúa que el progreso ha llegado al **100% (4/4)**, desbloquea el candado maestro y dispara la ventana modal de felicitaciones con la bandera oficial del reto:

```
FLAG{PREVIO2_F12_FORENSIC_HILL_SUCCESS}
```

---

## 🎤 6. Guía de Sustentación para Ángel y Josué ante el Profesor

Si el profesor realiza preguntas técnicas durante la evaluación, estas son las respuestas clave que deben dar:

1. **¿Por qué la validación con F12 en el navegador no permite ver las respuestas en el código JavaScript?**  
   *Respuesta:* "Porque implementamos hashes criptográficos unidireccionales SHA-256. El cliente solo almacena el hash del resultado esperado. Cuando el usuario escribe, calculamos el hash de su entrada y comparamos ambos resúmenes. Dado que SHA-256 es resistente a preimagen, no pueden revertir el hash para extraer el texto original."

2. **¿Por qué seleccionaron una matriz clave con determinante 9 en el Cifrado Hill?**  
   *Respuesta:* "Para que una matriz de Cifrado Hill sea válida en módulo 26, su determinante debe ser coprimo con 26 ($\gcd(\det(K), 26) = 1$). El número 9 solo tiene como factor primo al 3, y 26 tiene al 2 y al 13, por lo que son coprimos y garantizan la existencia de una matriz inversa única ($9 \times 3 = 27 \equiv 1 \pmod{26}$)."

3. **¿Cómo se conecta la aplicación con Neon PostgreSQL y para qué se usa?**  
   *Respuesta:* "El backend en Express se conecta mediante un pool de conexiones SSL a Neon. Se crearon dos tablas (`team_submissions` y `completed_flags`) que auditan en tiempo real cada intento del equipo rival, registrando su IP, fecha, hora y si la respuesta fue correcta o fallida, permitiendo un análisis forense de la prueba."
