const express = require("express");
const path = require("path");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const app = express();
const PORT = process.env.PORT || 3000;

// Datos de ejemplo de agentes
const agentes = require("./data/agentes.js");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/iniciarSesion", (req, res) => {
  const { email, password } = req.query;

  // Buscar el agente en la lista de agentes
  const agente = agentes.results.find(
    (agente) => agente.email === email && agente.password === password
  );

  if (agente) {
    // Generar el token JWT con expiración de 1 minuto
    const token = jwt.sign(
      { email: agente.email },
      process.env.SECRET,
      { expiresIn: "1m" } // Token expirará en 1 minuto
    );

    // Calcula el tiempo de expiración en segundos
    const expiresAt = Math.floor(Date.now() / 1000) + 60; // 60 segundos

    // HTML de respuesta al autenticar el agente
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Agente Autorizado</title>
      </head>
      <body>
        <h1>Bienvenido, ${agente.email}</h1>
        <p id="expirationInfo">Token expira en: <span id="countdown">${
          expiresAt - Math.floor(Date.now() / 1000)
        }</span> segundos</p>
        <a href="#" onclick="accederRutaRestringida('${token}')">Ir a la ruta restringida</a>
        <p id="serverResponse"></p>
        <script>
          sessionStorage.setItem('token', '${token}');
          let countdownInterval; // Variable para almacenar el intervalo del contador

          function accederRutaRestringida(token) {
            clearInterval(countdownInterval); // Detener el contador cuando se hace clic
            const url = '/rutaRestringida?token=' + token;
            window.open(url, '_blank'); // Abrir en una nueva pestaña con el token en la URL
            // Ocultar información de expiración
            document.getElementById('expirationInfo').style.display = 'none';
            document.getElementById('serverResponse').innerHTML = '<p>Abriendo la ruta restringida...</p>';
          }

          // Función para iniciar el contador de expiración
          function startCountdown() {
            const countdownElement = document.getElementById('countdown');
            let expiresInSec = ${expiresAt - Math.floor(Date.now() / 1000)};

            countdownInterval = setInterval(() => {
              countdownElement.textContent = expiresInSec;
              expiresInSec--;

              if (expiresInSec < 0) {
                clearInterval(countdownInterval);
                countdownElement.textContent = '0';
                document.getElementById('expirationInfo').textContent = 'Token ha expirado.';
              }
            }, 1000);
          }

          startCountdown(); // Iniciar el contador de expiración al cargar la página
        </script>
      </body>
      </html>
    `);
  } else {
    // Si las credenciales son incorrectas, devolver error de autenticación
    res.status(401).send("Error en la autenticación");
  }
});

// Ruta restringida
app.get("/rutaRestringida", (req, res) => {
  const token = req.query.token; // Obtener el token de la query string

  if (!token) {
    return res.status(401).send("No autorizado. Token no proporcionado.");
  }

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send("No autorizado. Token inválido o expirado.");
    }
    // Aquí puedes redirigir a otra página o devolver algún contenido específico
    res.send(`Bienvenido, ${decoded.email}`);
  });
});

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
