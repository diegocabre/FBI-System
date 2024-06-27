const express = require("express");
const path = require("path");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { create } = require("express-handlebars");
const app = express();
const PORT = process.env.PORT || 3000;

// Importar los datos de los agentes
const agentes = require("./data/agentes.js");

// Crear una instancia de Handlebars
const hbs = create({
  extname: ".handlebars",
  defaultLayout: false, // Cambia esto a 'main' si usas layouts
});

// Configurar Handlebars como el motor de plantillas
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

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
    const token = jwt.sign({ email: agente.email }, process.env.SECRET, {
      expiresIn: "1m",
    });

    // Calcula el tiempo de expiración en segundos
    const expiresAt = Math.floor(Date.now() / 1000) + 60;

    // Renderizar la plantilla Handlebars con los datos necesarios
    res.render("autenticado", {
      email: agente.email,
      token,
      expiresIn: expiresAt - Math.floor(Date.now() / 1000),
    });
  } else {
    res.status(401).send("Error en la autenticación");
  }
});

// Ruta restringida
app.get("/rutaRestringida", (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(401).send("No autorizado. Token no proporcionado.");
  }

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
