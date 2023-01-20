'use strict'

//Para iniciar esta app. primero Inicia el MongoD (que es la BD sino no se va a guardar info en la BD) y luego npm start para iniciar el servidor NodeJS desde la carpeta que contiene todo esto. 
//Y Listo

var mongoose = require('mongoose');
var app = require('./app');
var port = 3900;

mongoose.set('strictQuery', false);
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://127.0.0.1:27017/api_rest_jav',{useNewUrlParser:true,useUnifiedTopology:true})
.then( ()=>{
 console.log("Connection Started SuccesFully!");

 //Crear servidor y escuchar peticiones

 app.listen(port, () => {
    console.log('Servidor corriendo en ' + port)

 });
})