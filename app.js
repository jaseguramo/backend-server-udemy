// Requires (Importación de librerias de terceros o personalizadas que necesitamos)
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicializar variables
var app = express();

// BodyParser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');

// Conexión a la base de datos
mongoose.connect('mongodb+srv://AngularUser:cm4CWUP8hmQWicPp@cluster0-zx91l.mongodb.net/hospitalDB?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log('DataBase is \x1b[32m%s\x1b[0m', 'online'))
    .catch(err => {
        console.log('DataBase Connection Error: \x1b[31m%s\x1b[0m', err.message);
    });;

// Rutas
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server is \x1b[32m%s\x1b[0m', 'running', 'at port 3000');
});