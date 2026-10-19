# GUÍA DEL PROYECTO // PROTOCOLO SENTINEL (CTF)
**Asignatura:** Seguridad Informática — Previo 2  
**Autores:** Ángel y Josué  
**Destinatarios:** Equipo rival de 3 analistas / Profesor evaluador

---

## 📌 Resumen del Reto
Se ha implementado una aplicación web de tipo **CTF (Capture The Flag)** bajo la temática de respuesta a incidentes de seguridad (*Protocolo Sentinel*). La interfaz presenta 4 casillas de autenticación independientes con validación criptográfica y retroalimentación en tiempo real. Al resolver las 4 casillas, el sistema desbloquea la pantalla de victoria con la bandera oficial (`The Flag`), efectos de sonido sintéticos y lluvia de confeti.

---

## 🔑 Solucionario Oficial de las 4 Casillas

| Casilla | Vector / Tipo de Reto | Pista para el Equipo Rival | Respuesta Exacta |
|---|---|---|---|
| **Casilla 1** | **Calibración Académica (100% Regalada)** | La pista indica textualmente que introduzcan el identificador del examen. | `PREVIO2` |
| **Casilla 2** | **Reconocimiento del Código Fuente (F12)** | Invita a presionar F12 e inspeccionar comentarios HTML y la pestaña Console. | `DEV_KEY_F12_2026` |
| **Casilla 3** | **Análisis Forense & Metadatos (Imagen)** | Descargar la imagen de evidencia y revisar sus propiedades EXIF (Descripción/Copyright). | `EXIF_FORENSE_2026` |
| **Casilla 4** | **Criptografía Clásica (Cifrado Hill 2x2)** | Criptograma `VOKC`, Matriz Clave $K = \begin{pmatrix} 3 & 3 \\ 2 & 5 \end{pmatrix}$. | `HACK` |

### 🏆 Bandera Final (The Flag):
```
FLAG{PREVIO2_F12_FORENSIC_HILL_SUCCESS}
```

---

## 📐 Justificación Técnica y Matemática de Cada Reto

### Reto 1: Calibración del Sistema
* **Concepto:** Verificación básica de entrada de credenciales y normalización (mayúsculas/minúsculas).
* **Solución:** `PREVIO2`.

### Reto 2: Reconocimiento Web & F12
* **Concepto:** Auditoría de seguridad del frontend. En pruebas de penetración web (Web Pentesting), la información sensible a menudo queda expuesta en comentarios del desarrollador (`<!-- ... -->`) o mensajes de depuración en la consola de JavaScript.
* **Ubicación:** 
  1. En el encabezado del archivo `index.html` (líneas 20-25).
  2. En el registro de consola `console.log()` que se ejecuta al presionar F12 en cualquier navegador.
* **Solución:** `DEV_KEY_F12_2026`.

### Reto 3: Análisis Forense de Metadatos (EXIF)
* **Concepto:** Esteganografía y forense digital. Los archivos multimedia almacenan metadatos ocultos bajo el estándar EXIF (Exchangeable Image File Format).
* **Cómo lo resuelve el equipo rival:**
  1. Descargan la imagen `assets/evidencia_lab.jpg` desde el visor de la web.
  2. En Windows: Hacen clic derecho sobre el archivo descargado &rarr; *Propiedades* &rarr; pestaña *Detalles*.
  3. En el campo **Descripción** y **Copyright** aparece directamente: `CLAVE_RETO_3: EXIF_FORENSE_2026`.
* **Solución:** `EXIF_FORENSE_2026`.

### Reto 4: Criptografía - Cifrado Hill (2x2)
* **Concepto:** Criptografía clásica basada en álgebra lineal y aritmética modular módulo 26.
* **Parámetros:**
  - Alfabeto: $A=0, B=1, C=2, \dots, Z=25$.
  - Criptograma: `VOKC` $\rightarrow$ Pareja 1: $V=21, O=14$; Pareja 2: $K=10, C=2$.
  - Matriz Clave:
    $$K = \begin{pmatrix} 3 & 3 \\ 2 & 5 \end{pmatrix}$$
* **Cálculo de la Matriz Inversa ($K^{-1}$ mod 26):**
  1. Determinante: $\det(K) = (3 \times 5) - (3 \times 2) = 15 - 6 = 9 \pmod{26}$.
  2. Inverso multiplicativo de 9 mod 26: Buscamos un número $x$ tal que $9x \equiv 1 \pmod{26}$.  
     $9 \times 3 = 27 \equiv 1 \pmod{26} \implies \det(K)^{-1} = 3$.
  3. Matriz adjunta transpuesta:
     $$\text{Adj}(K) = \begin{pmatrix} 5 & -3 \\ -2 & 3 \end{pmatrix} \equiv \begin{pmatrix} 5 & 23 \\ 24 & 3 \end{pmatrix} \pmod{26}$$
  4. Matriz Inversa:
     $$K^{-1} = 3 \times \begin{pmatrix} 5 & 23 \\ 24 & 3 \end{pmatrix} = \begin{pmatrix} 15 & 69 \\ 72 & 9 \end{pmatrix} \equiv \begin{pmatrix} 15 & 17 \\ 20 & 9 \end{pmatrix} \pmod{26}$$
* **Descifrado de Pareja 1 (`VO` = [21, 14]):**
  $$\begin{pmatrix} 15 & 17 \\ 20 & 9 \end{pmatrix} \begin{pmatrix} 21 \\ 14 \end{pmatrix} = \begin{pmatrix} 15(21) + 17(14) \\ 20(21) + 9(14) \end{pmatrix} = \begin{pmatrix} 315 + 238 \\ 420 + 126 \end{pmatrix} = \begin{pmatrix} 553 \\ 546 \end{pmatrix} \equiv \begin{pmatrix} 7 \\ 0 \end{pmatrix} \pmod{26}$$
  - $7 = \mathbf{H}$
  - $0 = \mathbf{A}$
* **Descifrado de Pareja 2 (`KC` = [10, 2]):**
  $$\begin{pmatrix} 15 & 17 \\ 20 & 9 \end{pmatrix} \begin{pmatrix} 10 \\ 2 \end{pmatrix} = \begin{pmatrix} 15(10) + 17(2) \\ 20(10) + 9(2) \end{pmatrix} = \begin{pmatrix} 150 + 34 \\ 200 + 18 \end{pmatrix} = \begin{pmatrix} 184 \\ 218 \end{pmatrix} \equiv \begin{pmatrix} 2 \\ 10 \end{pmatrix} \pmod{26}$$
  - $2 = \mathbf{C}$
  - $10 = \mathbf{K}$
* **Mensaje en Claro:** $\mathbf{HACK}$.

---

## 🛡️ Seguridad Implementada en la Propia Web (Anti-Cheat)
Para que los compañeros no puedan "hacer trampa" abriendo el archivo `script.js` y leyendo las soluciones en texto plano, la validación se realiza comparando el **Hash SHA-256** del texto ingresado contra el hash precalculado de la respuesta correcta:

- `SHA-256("PREVIO2")` = `44298a92b897ce38aaa79c49c4995fb7f834da2f639cb7b59061632206ec7296`
- `SHA-256("DEV_KEY_F12_2026")` = `f702c2ea8122e9b588d2ecbeb313300a6153a21ad0f4bdc8a6acdd8e36a4b6cd`
- `SHA-256("EXIF_FORENSE_2026")` = `83772f07995a63edcc7f4249002cc2326075638887b8c691f4515c430174efda`
- `SHA-256("HACK")` = `064866d6167ab12bacb2637bfe8c809372f3069fd075e1ccb3dd5425d364d137`

¡Esto demuestra ante el profesor el uso práctico de **Hashes criptográficos unidireccionales** vistos en clase!
