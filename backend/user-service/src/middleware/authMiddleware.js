const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {

    const authorization =
        req.headers.authorization;


    if (!authorization) {

        return res.status(401).json({
            msg: 'Token requerido'
        });
    }


    const partes =
        authorization.split(' ');


    if (
        partes.length !== 2 ||
        partes[0] !== 'Bearer'
    ) {

        return res.status(401).json({
            msg: 'Formato de token inválido'
        });
    }


    const token = partes[1];


    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );


        // Guardamos los datos del JWT
        // dentro de la petición.

        req.user = decoded;


        next();

    } catch (error) {

        return res.status(401).json({
            msg: 'Token inválido o expirado'
        });
    }
}

module.exports = authMiddleware;