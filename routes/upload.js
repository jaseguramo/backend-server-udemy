var express = require("express");
var fileUpload = require('express-fileupload');

//Middleware
var mdAutorizacion = require('../middlewares/autenticacion');

//Modelos
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

var app = express();

//default options
app.use(fileUpload());

//File System
var fs = require('fs');

// Rutas
app.put('/:coleccion/:id', mdAutorizacion.verificaToken, (request, response, next) => {
    var archivo = request.files.imagen;
    var id = request.params.id;
    var tipo = request.params.coleccion;

    var colecciones = ['hospitales', 'medicos', 'usuarios'];
    if (colecciones.indexOf(tipo) < 0) {
        return response.status(400).json({
            ok: false,
            mensaje: 'Colección inválida.',
            errors: { message: 'La colección ' + tipo + ' no es válida.' }
        });
    }

    if (!request.files) {
        return response.status(400).json({
            ok: false,
            mensaje: 'No se encontraron imágenes para cargar.',
            errors: { message: 'Debe seleccionar al menos una imágen para ser cargada.' }
        });
    }

    var nombreCortado = archivo.name.split('.');
    var extension = nombreCortado[nombreCortado.length - 1];

    //Extensiones válidas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return response.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida.',
            errors: { message: 'Debe seleccionar un archivo del tipo: ' + extensionesValidas.join(', ') }
        });
    }

    //Generar nombre custom
    var nombreArchivo = `${id}-${ new Date().getMilliseconds() }.${ extension }`;

    //Mover el archivo al servidor
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;
    archivo.mv(path, err => {
        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al subir el archivo.',
                errors: { message: 'Ocurrió un error al intentar subir el archivo', err }
            });
        }

        uploadByCollection(tipo, id, nombreArchivo, response);
    });
});

function uploadByCollection(tsCollection, id, tsFileName, response) {
    var oldPath = '';

    switch (tsCollection) {
        case 'hospitales':
            Hospital.findById(id)
                .populate('usuario', 'nombre email img')
                .exec((err, hospital) => {
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
                            mensaje: 'El hospital con el id ' + id + ' no existe',
                            errors: { message: 'No existe un hospital con ese ID' }
                        });
                    }

                    oldPath = './uploads/hospitales/' + hospital.img;
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }

                    hospital.img = tsFileName;
                    hospital.save((err, hospitalActualizado) => {
                        if (err) {
                            return response.status(500).json({
                                ok: false,
                                mensaje: 'Error al actualizar el hospital: ' + hospital.name,
                                errors: err
                            });
                        }

                        return response.status(200).json({
                            ok: true,
                            mensaje: 'Imágen de hospital actualizada.',
                            [tsCollection]: hospitalActualizado
                        });
                    });
                });
            break;

        case 'medicos':
            Medico.findById(id)
                .populate('hospital')
                .populate('usuario', 'nombre email img')
                .exec((err, medico) => {
                    if (err) {
                        return response.status(500).json({
                            ok: false,
                            mensaje: 'Error al buscar el medico',
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

                    oldPath = './uploads/medicos/' + medico.img;
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }

                    medico.img = tsFileName;
                    medico.save((err, medicoActualizado) => {
                        if (err) {
                            return response.status(500).json({
                                ok: false,
                                mensaje: 'Error al actualizar el medico: ' + medico.name,
                                errors: err
                            });
                        }

                        return response.status(200).json({
                            ok: true,
                            mensaje: 'Imágen de usuario actualizada.',
                            [tsCollection]: medicoActualizado
                        });
                    });
                });
            break;

        case 'usuarios':
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

                oldPath = './uploads/usuarios/' + usuario.img;
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }

                usuario.img = tsFileName;
                usuario.save((err, usuarioActualizado) => {
                    if (err) {
                        return response.status(500).json({
                            ok: false,
                            mensaje: 'Error al actualizar el usuario: ' + usuario.name,
                            errors: err
                        });
                    }

                    return response.status(200).json({
                        ok: true,
                        mensaje: 'Imágen de usuario actualizada.',
                        [tsCollection]: usuarioActualizado
                    });
                });
            });
            break;

        default:
            return response.status(400).json({
                ok: false,
                mensaje: 'Colección inválida.',
                errors: { message: 'La colección ' + tsCollection + ' no es válida.' }
            });
    }
}

module.exports = app;