var express = require("express");
const fs = require('fs');
const path = require('path');

var app = express();

// Rutas
app.get('/:tipo/:img', (request, response, next) => {
    var tipo = request.params.tipo;
    var img = request.params.img;

    var pathImage = path.resolve(__dirname, `../uploads/${ tipo }/${ img }`);

    if (fs.existsSync(pathImage)) {
        response.sendFile(pathImage);
    } else {
        var pathNoImage = path.resolve(__dirname, '../assets/no-img.jpg');
        response.sendFile(pathNoImage);
    }
});

module.exports = app;