'use strict'

var express = require('express');
var articleController = require('../controllers/articleController');

var router = express.Router();
var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './upload/articles'});

//Rutas prueba
router.get('/test-controlador', articleController.datosCursoGet);
router.post('/test-controlador-post', articleController.datosCursoPost);

//Rutas articulos
router.post('/save', articleController.save);
router.get('/articles/:last?', articleController.getArticles);
router.get('/article/:id', articleController.getArticle);
router.put('/update/:id', articleController.updateArticle);
router.delete('/delete/:id', articleController.removeArticle);
router.get('/search/:search', articleController.search);
router.post('/upload-image/:id?', md_upload, articleController.upload);
router.get('/get-image/:image', articleController.getImage);

module.exports = router;