var express = require("express");
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');
var Usuario = require('../models/usuario');
var LIMITE = require('../config/config').LIMITE;
var app = express();

// =======================================
// Obtener todos los usuarios
// =======================================
app.get('/', (request, response, next) => {
    var pagina = request.query.pag || 1;

    if (isNaN(pagina)) {
        pagina = 1;
    }

    pagina = (pagina - 1) * LIMITE;

    Usuario.find({}, 'nombre email img role')
        .skip(pagina)
        .limit(LIMITE)
        .exec((err, usuarios) => {
            if (err) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al cargar usuarios',
                    errors: err
                });
            }

            Usuario.count({}, (err, conteo) => {
                if (err) {
                    return response.status(400).json({
                        ok: false,
                        mensaje: 'Error al obtener el total de registros.',
                        errors: err
                    });
                }

                response.status(200).json({
                    ok: true,
                    usuarios: usuarios,
                    total: conteo
                });
            });
        });
});

// =======================================
// Crear un nuevo usuario
// =======================================
app.post('/', mdAutenticacion.verificaToken, (request, response) => {
    var body = request.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        response.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: request.usuario
        });
    });
});

// =======================================
// Actualizar usuario
// =======================================
app.put('/:id', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;
    var body = request.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            response.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });
});

// =======================================
// Eliminar usuario
// =======================================
app.delete('/:id', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        response.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;