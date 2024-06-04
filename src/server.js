// Creacion de servidor
// Importamos las dependencias del proyecto
const express = require("express");

// Creamos una instancia de aplicacion usando express
const app = express();

// Se crean las rutas
app.get("/", (req, res) => {
    res.send('Hello World!');
});

// Inicializa el servidor
app.listen(3000, () => {
    console.log("Server started on port 3000");
});