'use strict'

//Cargar modulos de Node para crear servidor
var express = require('express');
var bodyParser = require('body-parser');

//Ejecutar express (http)
var app = express();

//cargar ficheros rutas
var articleRouter = require('./routes/articleRoutes');

//Middleware 
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//CORS (para front)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});


//Añadir prefijos rutas / cargar rutas  
app.use('/api', articleRouter);

//exportar modulo para usarlo fuera
module.exports = app;