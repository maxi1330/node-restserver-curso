const { JsonWebTokenError } = require("jsonwebtoken");

const jwt = require('jsonwebtoken');
const e = require("express");

// ======================
//  Verificar Token
// ======================

let verificaToken = (req,res, next) => {
    let token = req.get('token');  //Extraigo el token del header

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if(err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no valido'
                }
            });
        }
        req.usuario = decoded.usuario;
        next();
    });
};

// ======================
//  Verifica Admin Role
// ======================

let verificaAdmin_Role = (req,res, next) => {
    let usuario = req.usuario;
    if (usuario.role != 'ADMIN_ROLE'){
        return res.status(400).json({
            ok: false,
            err : {
                message: 'Se requiere permisos de administrador'
            }
        });
    }
    next();
};

// ======================
//  Verificar Token para imagen
// ======================

let verificaTokenImg = (req, res, next) =>{
    let token = req.query.token;

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if(err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no valido'
                }
            });
        }
        req.usuario = decoded.usuario;
        next();
    });
}

module.exports = {
    verificaToken,
    verificaAdmin_Role,
    verificaTokenImg
}