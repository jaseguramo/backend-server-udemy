var express = require("express");
var app = express();

// Rutas
app.get('/', (request, response, next) => {
    response.status(403).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
});

module.exports = app;