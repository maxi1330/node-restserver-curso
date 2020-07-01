const express = require('express');
let { verificaToken, verificaAdmin_Role } = require ('../middlewares/autenticacion');
let app = express();
let Categoria = require('../models/categoria');

// ===========================
// Mostrar todas la categorias
// ===========================
app.get('/categoria', verificaToken, (req,res)=>{
    Categoria.find({})
        .sort('descripcion') // ordena segun el campo q se le pase
        .populate('usuario', 'nombre email') // llena el 'usuario' con los datos d otra tabla
        .exec( (err, categorias) => {
            if(err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Categoria.count({} , (err,conteo) => {
                res.json({
                    ok: true,
                    categorias,
                    count: conteo
                });
            })
            
        });
});

// ===========================
// Mostrar un categoria por id
// ===========================
app.get('/categoria/:id', verificaToken, (req,res)=>{
    let id = req.params.id;

    Categoria.findById( id, {}, {new: true}, (err, categoriaDB) => {
        if(err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if(!categoriaDB){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no es correcto'
                }
            })
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        })
    });
});

// ===========================
// Crear una categoria
// ===========================
app.post('/categoria', [verificaToken,verificaAdmin_Role] , (req,res)=>{
    let body = req.body;

    let categoria = new Categoria ({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });
    
    categoria.save( (err,categoriaDB) => {
        console.log(err);
        if(err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };
        
        if(!categoriaDB){
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    })
});

// ===========================
// Actualizar una categoria
// ===========================
app.put('/categoria/:id', [verificaToken, verificaAdmin_Role] , (req,res)=>{
    let id = req.params.id;
    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    }

    Categoria.findByIdAndUpdate( id, descCategoria, {new: true, runValidators: true}, (err, categoriaDB) => {
        
        if(err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

// ===========================
// Borrar una categoria
// ===========================
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role] , (req,res)=>{
    let id = req.params.id;

    Categoria.findByIdAndDelete(id, (err, categoriaBorrada) => {
        if(err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };

        if( !categoriaBorrada ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Categoria borrada'
        })

    });
});

module.exports = app;