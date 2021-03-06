// Requires (Importación de librerias de terceros o personalizadas que necesitamos)
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicializar variables
var app = express();

// BodyParser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Importar rutas
var appRoutes = require('./routes/app');
var busquedaRoutes = require('./routes/busqueda');
var hospitalRoutes = require('./routes/hospital');
var imagenesRoutes = require('./routes/imagenes');
var loginRoutes = require('./routes/login');
var medicoRoutes = require('./routes/medico');
var uploadRoutes = require('./routes/upload');
var usuarioRoutes = require('./routes/usuario');

// Conexión a la base de datos
mongoose.connect('mongodb+srv://AngularUser:cm4CWUP8hmQWicPp@cluster0-zx91l.mongodb.net/hospitalDB?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log('DataBase is \x1b[32m%s\x1b[0m', 'online'))
    .catch(err => {
        console.log('DataBase Connection Error: \x1b[31m%s\x1b[0m', err.message);
    });

//Server Index config
// var serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'));
// app.use('/uploads', serveIndex(__dirname + '/uploads'));

// Rutas
app.use('/busqueda', busquedaRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/img', imagenesRoutes);
app.use('/login', loginRoutes);
app.use('/medico', medicoRoutes);
app.use('/upload', uploadRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/', appRoutes);

// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server is \x1b[32m%s\x1b[0m', 'running', 'at port 3000');
});