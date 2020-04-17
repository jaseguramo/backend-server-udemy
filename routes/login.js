var express = require("express");
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var app = express();

var Usuario = require("../models/usuario");
var SEED = require('../config/config').SEED;

app.post('/', (request, response) => {
    var body = request.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDb) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioDb) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDb.password)) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        //Crear token (Expira en 4 Horas)
        var token = jwt.sign({ usuario: usuarioDb }, SEED, { expiresIn: 14400 });

        response.status(200).json({
            ok: true,
            token: token,
            id: usuarioDb._id
        });
    });

});

module.exports = app;