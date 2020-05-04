var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');
var Medico = require('../models/medico');
var LIMITE = require('../config/config').LIMITE;
var app = express();

// =======================================
// Obtener todos los medicos
// =======================================
app.get('/', (request, response, next) => {
    var pagina = request.query.pag || 1;

    if (isNaN(pagina)) {
        pagina = 1;
    }

    pagina = (pagina - 1) * LIMITE;

    Medico.find({}, 'nombre img usuario hospital')
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .skip(pagina)
        .limit(LIMITE)
        .exec((err, medicos) => {
            if (err) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al cargar medicos',
                    errors: err
                });
            }

            Medico.count({}, (err, conteo) => {
                if (err) {
                    return response.status(400).json({
                        ok: false,
                        mensaje: 'Error al obtener el total de registros.',
                        errors: err
                    });
                }

                response.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: conteo
                });
            });
        });
});

// =======================================
// Crear un nuevo medico
// =======================================
app.post('/', mdAutenticacion.verificaToken, (request, response) => {
    var body = request.body;
    var medico = new Medico({
        nombre: body.nombre,
        usuario: request.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al crear el medico',
                errors: err
            });
        }

        response.status(200).json({
            ok: true,
            medico: medicoGuardado
        });
    });
});

// =======================================
// Actualizar medico
// =======================================
app.put('/:id', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;
    var body = request.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if (!medico) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.hospital = body.hospital;
        medico.usuario = request.usuario._id;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            response.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});

// =======================================
// Eliminar hospital
// =======================================
app.delete('/:id', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;

    Medico.findByIdAndDelete(id, (err, medicoBorrado) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El medico con id ' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        response.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});

module.exports = app;