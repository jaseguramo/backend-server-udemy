var express = require("express");
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');
var app = express();

// =======================================
// Busqueda por COLECCION
// =======================================
app.get('/coleccion/:tabla/:busqueda', (request, response, next) => {
    var lsBusqueda = request.params.busqueda || '';
    var tabla = request.params.tabla || '';
    var loPromise;

    switch (tabla) {
        case 'hospitales':
            loPromise = buscarHospitales(lsBusqueda);
            break;
        case 'medicos':
            loPromise = buscarMedicos(lsBusqueda);
            break;
        case 'usuarios':
            loPromise = buscarUsuarios(lsBusqueda);
            break;

        default:
            response.status(400).json({
                ok: false,
                mensaje: 'Operación inválida',
                error: { message: 'Tipo de tabla/colección no soportada' }
            });
            break;
    }

    loPromise.then(data => {
        response.status(200).json({
            ok: true,
            [tabla]: data
        });
    });
});

// =======================================
// Busqueda GENERAL
// =======================================
app.get('/todo/:busqueda', (request, response, next) => {
    var lsBusqueda = request.params.busqueda || '';

    Promise.all([
        buscarHospitales(lsBusqueda),
        buscarMedicos(lsBusqueda),
        buscarUsuarios(lsBusqueda)
    ]).then(respuestas => {
        response.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    });
});

function buscarHospitales(tsBusqueda) {
    var regex = new RegExp(tsBusqueda, 'i');

    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(tsBusqueda) {
    var regex = new RegExp(tsBusqueda, 'i');

    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(tsBusqueda) {
    var regex = new RegExp(tsBusqueda, 'i');

    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

function sendResponse(taData, tsTable) {
    return response.status(200).json({
        ok: true,
        coleccion: tsTable,
        data: taData
    });
}

module.exports = app;