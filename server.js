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
    // Generar el token JWT
    const token = jwt.sign(
      { email: agente.email },
      process.env.SECRET,
      { expiresIn: "2m" } // Token expirará en 2 minutos
    );

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
        <a href="#" onclick="accederRutaRestringida()">Ir a la ruta restringida</a>
        <script>
          sessionStorage.setItem('token', '${token}');
          function accederRutaRestringida() {
            const token = sessionStorage.getItem('token');
            fetch('/rutaRestringida', {
              headers: {
                'Authorization': 'Bearer ' + token
              }
            })
            .then(response => {
              if (!response.ok) {
                throw new Error('No autorizado');
              }
              return response.text();
            })
            .then(message => {
              document.body.innerHTML = message;
            })
            .catch(error => {
              document.body.innerHTML = \`<p>\${error.message}</p>\`;
            });
          }
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
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).send("No autorizado. Token no proporcionado.");
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send("No autorizado. Token inválido o expirado.");
    }
    res.send(`Bienvenido, ${decoded.email}`);
  });
});

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
