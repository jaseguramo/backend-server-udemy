var express = require("express");
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var app = express();

var Usuario = require("../models/usuario");
var SEED = require('../config/config').SEED;

// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// =======================================
// Autenticación Google
// =======================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(request, response) => {
    var token = request.body.token;
    var googleUser = await verify(token)
        .catch(e => {
            return response.status(403).json({
                ok: false,
                mensaje: 'Token inválido'
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDb) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioDb) {
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = '*';

            usuario.save((err, usuarioDb) => {
                if (err) {
                    return response.status(400).json({
                        ok: false,
                        mensaje: 'Error al crear el usuario.',
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
        } else {
            if (!usuarioDb.google) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Credenciales incorrectas - google',
                    errors: err
                });
            } else {
                //Crear token (Expira en 4 Horas)
                var token = jwt.sign({ usuario: usuarioDb }, SEED, { expiresIn: 14400 });

                response.status(200).json({
                    ok: true,
                    token: token,
                    id: usuarioDb._id
                });
            }
        }
    });

    /*return response.status(200).json({
        ok: true,
        mensaje: 'Ok!',
        googleUser: googleUser
    });*/
});

// =======================================
// Autenticación Nativa
// =======================================
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