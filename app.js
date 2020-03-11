// Requires (Importación de librerias de terceros o personalizadas que necesitamos)
var express = require('express');
var mongoose = require('mongoose');

// Inicializar variables
var app = express();

//Conexión a la base de datos
/*mongoose.connection.openUri('mongodb://cluster0-zx91l.mongodb.net/hospitalDB', (err, resp) => {
    if (err) throw err;

    console.log('DataBase is \x1b[32m%s\x1b[0m', 'online', 'at port 3000');
})*/

mongoose.connect('mongodb+srv://AngularUser:cm4CWUP8hmQWicPp@cluster0-zx91l.mongodb.net/hospitalDB?retryWrites=true&w=majority',
        //mongoose.connect('mongodb://AngularUser:cm4CWUP8hmQWicPp@cluster0-zx91l.mongodb.net/hospitalDB', 
        { useNewUrlParser: true, useUnifiedTopology: true }
        /*,
            (err, resp) => {
                if (err) throw err;

                console.log('DataBase is \x1b[32m%s\x1b[0m', 'online');
            }*/
    ).then(() => console.log('DataBase is \x1b[32m%s\x1b[0m', 'online'))
    .catch(err => {
        console.log('DataBase Connection Error: \x1b[31m%s\x1b[0m', err.message);
    });;

// Rutas
app.get('/', (request, response, next) => {
    response.status(403).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
});

// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server is \x1b[32m%s\x1b[0m', 'running', 'at port 3000');
});