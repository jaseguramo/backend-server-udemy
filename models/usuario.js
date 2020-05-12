var mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;
var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'
};

var usuarioSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    email: { type: String, required: [true, 'El correo es necesario'], unique: true },
    password: { type: String, required: [true, 'La contraseña es necesaria'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: "USER_ROLE", enum: rolesValidos },
    google: { type: Boolean, default: false }
}, {
    versionKey: false // You should be aware of the outcome after set to false
});

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' })

module.exports = mongoose.model('Usuario', usuarioSchema);