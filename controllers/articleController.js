'use strict'

var validator = require('validator');
var fs = require('fs');
var path = require('path');

var Article = require('../models/article');


var controller = {

    datosCursoGet: (req, res) => {
        console.log('ruta test1 funcionando !!');
        return res.status(200).send(`
        <div> Hello Underworld </div>
        <div> By Javier. </div>
        `);
    },

    datosCursoPost: (req, res) => {
        console.log('Usando metodo Post');
        return res.status(200).send(`
        <div> Hello Prueba Post </div>
        <div> By Javier. </div>
        `);
    },

    //Metodos Utiles

    save: (req, res) => {
        // Recoger parametros por post
        var params = req.body;

        // Validar datos (validator)
        try {
            var validateTitle = !validator.isEmpty(params.title);
            var validateContent = !validator.isEmpty(params.content);
            console.log('Entro al Try!');
        } catch (err) {
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos por enviar !!!'
            });
        }

        if (validateTitle && validateContent) {

            //Crear el objeto a guardar
            var article = new Article();

            // Asignar valores
            article.title = params.title;
            article.content = params.content;

            if (params.image) {
                article.image = params.image;
            } else {
                article.image = null;
            }

            // Guardar el articulo. Este es el metodo magico .save()
            article.save((err, articleStored) => {

                if (err || !articleStored) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'El articulo no se ha guardado !!!'
                    });
                }

                // Devolver una respuesta 
                return res.status(200).send({
                    status: 'success',
                    article: articleStored
                });

            });

        } else {
            return res.status(200).send({
                status: 'error',
                message: 'Los datos no son válidos !!!'
            });
        }

    },

    getArticles: (req, res) => {

        var query = Article.find({});

        var last = req.params.last;
        if (last || last != undefined) {
            query.limit(3);
        }

        //find.Este es el metodo magico find()
        query.sort('-_id').exec((err, articles) => {

            if (err || !articles) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los articulos ! !'
                });
            }
            return res.status(200).send({
                status: 'success',
                articles
            });
        })


    },

    getArticle: (req, res) => {

        //Obtener ID de URL
        var articleId = req.params.id;

        //Comprobar que existe
        if (!articleId || articleId == null) {
            return res.status(404).send({
                status: 'error',
                message: 'Id de articulo NO existe ! !'
            });
        }

        //Buscar el articulo
        Article.findById(articleId, (err, article) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los datos ! !'
                });
            }
            if (!article) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el articulo ! !'
                });
            }
            //Devolver el JSON
            return res.status(200).send({
                status: 'success',
                article
            });

        });
    },

    updateArticle : (req, res) => {

        //Obtener Id por URL
        var articleId = req.params.id;

        //Recoger los datos que llegan por put
        var params = req.body;

        //validar datos
        try {
            var validateTitle = !validator.isEmpty(params.title);
            var validateContent = !validator.isEmpty(params.content);

        } catch (err) {
            return res.status(404).send({
                status: 'success',
                message: 'Faltan datos por enviar ! !'
            }); 
        }

        if (validateTitle && validateContent) {
             //Hacer el find - update
            Article.findOneAndUpdate({_id: articleId}, params, {new:true}, (err, articleUpdated) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar ! !'
                    }); 
                }
                if (!articleUpdated) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe articulo ! !'
                    }); 
                }

                return res.status(200).send({
                    status: 'success',
                    message: 'objeto Actualizado!',
                    article : articleUpdated
                }); 
            });

        } else{
            //Devolver una response
            return res.status(200).send({
                status: 'error',
                message: 'La validacion NO es correcta'
            });
        }

        
    },

    removeArticle : (req, res) => {

        var articleId = req.params.id;

        Article.findByIdAndRemove({_id: articleId}, (err, articleRemoved) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al borrar articulo ! !'
                }); 
            }

            if (!articleRemoved) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No se ha borrado el articulo porque no existe ! !'
                }); 
            }
            return res.status(200).send({
                status: 'success',
                message: 'Articulo Borrado con Exito ! !',
                articleRemoved
            }); 

        });
    },

    search: (req, res) => {
        // Sacar el string a buscar
        var searchString = req.params.search;

        // Find or
        Article.find({ "$or": [
            { "title": { "$regex": searchString, "$options": "i"}},
            { "content": { "$regex": searchString, "$options": "i"}}
        ]})
        .sort([['date', 'descending']])
        .exec((err, articles) => {

            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición !!!'
                });
            }
            
            if(!articles || articles.length <= 0){
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay articulos que coincidan con tu busqueda !!!'
                });
            }

            return res.status(200).send({
                status: 'success',
                articles
            });

        });
    },
    upload: (req, res) => {
        // Configurar el modulo connect multiparty router/article.js (hecho)

        // Recoger el fichero de la petición
        var file_name = 'Imagen no subida...';

        if(!req.files){
            return res.status(404).send({
                status: 'error',
                message: file_name
            });
        }

        // Conseguir nombre y la extensión del archivo
        var file_path = req.files.file0.path;
        var file_split = file_path.split('\\');

        // Nombre del archivo
        var file_name = file_split[2];

        // Extensión del fichero
        var extension_split = file_name.split('\.');
        var file_ext = extension_split[1];

        // Comprobar la extension, solo imagenes, si es valida borrar el fichero
        if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif'){
            
            // borrar el archivo subido
            fs.unlink(file_path, (err) => {
                return res.status(200).send({
                    status: 'error',
                    message: 'La extensión de la imagen no es válida !!!'
                });
            });
        
        }else{
             // Si todo es valido, sacando id de la url
             var articleId = req.params.id;

             if(articleId){
                // Buscar el articulo, asignarle el nombre de la imagen y actualizarlo
                Article.findOneAndUpdate({_id: articleId}, {image: file_name}, {new:true}, (err, articleUpdated) => {

                    if(err || !articleUpdated){
                        return res.status(200).send({
                            status: 'error',
                            message: 'Error al guardar la imagen de articulo !!!'
                        });
                    }

                    return res.status(200).send({
                        status: 'success',
                        article: articleUpdated
                    });
                });
             }else{
                return res.status(200).send({
                    status: 'success',
                    image: file_name
                });
             }
            
        }   
    }, // end upload file

    getImage: (req, res) => {
        var file = req.params.image;
        var path_file = './upload/articles/'+file;

        fs.exists(path_file, (exists) => {
            if(exists){
                return res.sendFile(path.resolve(path_file));
            }else{
                return res.status(404).send({
                    status: 'error',
                    message: 'La imagen no existe !!!'
                });
            }
        });
    },

};

module.exports = controller;