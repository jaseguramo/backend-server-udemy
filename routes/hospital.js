var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');
var Hospital = require('../models/hospital');
var LIMITE = require('../config/config').LIMITE;
var app = express();

// =======================================
// Obtener todos los hospitales
// =======================================
app.get('/', (request, response, next) => {
    var pagina = request.query.pag || 1;

    if (isNaN(pagina)) {
        pagina = 1;
    }

    pagina = (pagina - 1) * LIMITE;

    Hospital.find({}, 'nombre img usuario')
        .populate('usuario', 'nombre email')
        .skip(pagina)
        .limit(LIMITE)
        .exec((err, hospitales) => {
            if (err) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al cargar hospitales',
                    errors: err
                });
            }

            Hospital.count({}, (err, conteo) => {
                if (err) {
                    return response.status(400).json({
                        ok: false,
                        mensaje: 'Error al obtener el total de registros.',
                        errors: err
                    });
                }

                response.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: conteo
                });
            });
        });
});

// =======================================
// Crear un nuevo hospital
// =======================================
app.post('/', mdAutenticacion.verificaToken, (request, response) => {
    var body = request.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: request.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al crear el hospital',
                errors: err
            });
        }

        response.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});

// =======================================
// Actualizar hospital
// =======================================
app.put('/:id', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;
    var body = request.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el hospital',
                errors: err
            });
        }

        if (!hospital) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El hospital con id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = request.usuario._id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            response.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });
});

// =======================================
// Eliminar hospital
// =======================================
app.delete('/:id', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;

    Hospital.findByIdAndDelete(id, (err, hospitalBorrado) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El hospital con id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        response.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});

module.exports = app;