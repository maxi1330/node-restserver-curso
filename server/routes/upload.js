const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const fs = require('fs');
const path = require('path');
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

// default options
app.use(fileUpload());

app.put('/upload/:tipo/:id', function(req, res) {
    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No files were uploaded.'
            }   
        });
    }

    //validar tipo
    let tiposValidos = ['productos','usuarios'];
    if( tiposValidos.indexOf(tipo) < 0){
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las tipos permitidos son ' + tiposValidos.join(', ')
            }
        })
    }
    let archivo = req.files.archivo;

    // Extensiones permitidas
    let extensionesPermitidas = ['png','jpg','gif','jpeg'];
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length -1];

    if( extensionesPermitidas.indexOf(extension) < 0){
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son ' + extensionesPermitidas.join(', ')
            }
        })
    }

    //Cambiar nombre al archivo
    let nombreDelArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`

    let uploadPath = `uploads/${tipo}/${nombreDelArchivo}`;

    archivo.mv(uploadPath, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //Aca, la imagen ya se cargo
        //Actualizo la imagen del usuario
        if( tipo === 'usuarios'){
            imagenUsuario(id,res,nombreDelArchivo);
        } else {
            imagenProducto(id, res, nombreDelArchivo);
        }
    });
});

function imagenUsuario(id, res, nombreDelArchivo) {
    Usuario.findById(id, (err, usuarioDB)=>{
        if(err) {
            borraArchivo(nombreDelArchivo, 'usuarios');
            return res.status(500).json({
                ok:false,
                err
            });
        }

        if(!usuarioDB){
            borraArchivo(nombreDelArchivo, 'usuarios');
            return res.status(400).json({
                ok:false,
                err: {
                    message: 'El usuario no existe'
                }
            });
        }

        borraArchivo(usuarioDB.img, 'usuarios');

        usuarioDB.img = nombreDelArchivo;
        usuarioDB.save( (err, usuarioGuardado)=>{
            if(err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreDelArchivo
            });
        });
    });
}

function imagenProducto(id, res, nombreDelArchivo) {
    Producto.findById(id, (err, productoDB)=>{
        if(err) {
            borraArchivo(nombreDelArchivo, 'productos');
            return res.status(500).json({
                ok:false,
                err
            });
        }

        if(!productoDB){
            borraArchivo(nombreDelArchivo, 'productos');
            return res.status(400).json({
                ok:false,
                err: {
                    message: 'El usuario no existe'
                }
            });
        }

        borraArchivo(productoDB.img, 'productos');

        productoDB.img = nombreDelArchivo;
        productoDB.save( (err, productoGuardado)=>{
            if(err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            
            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreDelArchivo
            });
        });
    });
}

function borraArchivo(nombreImagen, tipo) {
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    if (fs.existsSync(pathImagen)){
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;