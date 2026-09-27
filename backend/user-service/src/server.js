const path = require('path');

require('dotenv').config({
    path: path.resolve(__dirname, '../.env')
});

const express = require('express');
const cors = require('cors');


// ========================================
// USUARIOS
// ========================================

const UserRepositoryAdapter =
    require('./infrastructure/userRepositoryAdapter');

const UserService =
    require('./application/userService');

const createUserController =
    require('./interfaces/userController');


// ========================================
// SOLICITUDES DE VENDEDOR
// ========================================

const SellerRequestRepositoryAdapter =
    require('./infrastructure/sellerRequestRepositoryAdapter');

const SellerRequestService =
    require('./application/sellerRequestService');

const createSellerRequestController =
    require('./interfaces/sellerRequestController');


// ========================================
// PUBLICACIONES
// ========================================

const PublicationRepositoryAdapter =
    require('./infrastructure/publicationRepositoryAdapter');

const PublicationService =
    require('./application/publicationService');

const createPublicationController =
    require('./interfaces/publicationController');


// ========================================
// EXPRESS
// ========================================

const app = express();

app.use(cors());
app.use(express.json());


// ========================================
// USUARIOS
// ========================================

const userRepository =
    new UserRepositoryAdapter();

const userService =
    new UserService(
        userRepository
    );


// ========================================
// SOLICITUDES DE VENDEDOR
// ========================================

const sellerRequestRepository =
    new SellerRequestRepositoryAdapter();

const sellerRequestService =
    new SellerRequestService(
        sellerRequestRepository
    );


// ========================================
// PUBLICACIONES
// ========================================

const publicationRepository =
    new PublicationRepositoryAdapter();

const publicationService =
    new PublicationService(
        publicationRepository
    );


// ========================================
// RUTA PRINCIPAL
// ========================================

app.get('/', (req, res) => {
    res.json({
        msg:
            'API E-Tienda funcionando con PostgreSQL'
    });
});


// ========================================
// CONTROLADORES
// ========================================

app.use(
    '/',
    createUserController(
        userService
    )
);

app.use(
    '/',
    createSellerRequestController(
        sellerRequestService
    )
);

app.use(
    '/',
    createPublicationController(
        publicationService
    )
);


// ========================================
// SERVIDOR
// ========================================

const PORT =
    process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(
        `Servidor ejecutándose en http://localhost:${PORT}`
    );
});