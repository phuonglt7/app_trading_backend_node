import APIController from '../controllers/ProductsController';
import express from "express";
import APIAuthController from '../controllers/AuthController';
import APIUserController from '../controllers/UsersController';
import AuthMiddleWare from "../middlewares/AuthMiddleware";
let router = express.Router();
const initProduct = (app) => {
    router.post('/login', APIAuthController.login);

    router.post('/register', APIAuthController.register);
    router.post("/refresh-token", APIAuthController.refreshToken);
    router.use(AuthMiddleWare.isAuth);

    router.get('/users', APIUserController.getAll); // method GET -> READ data
    router.post('/user/new', APIUserController.create); // method POST -> CREATE data
    router.get('/user/:id/show', APIUserController.show); //method PUT -> UPDATE data
    router.put('/user/:id/update', APIUserController.update); //method PUT -> UPDATE data
    router.delete('/user/:id/delete', APIUserController.deleteItem); //method DELETE -> DELETE data

    router.get('/products', APIController.getAllProducts); // method GET -> READ data
    router.post('/product/new', APIController.createNewProduct); // method POST -> CREATE data
    router.put('/product/:id/update', APIController.updateProduct); //method PUT -> UPDATE data
    router.delete('/product/:id/delete', APIController.deleteProduct); //method DELETE -> DELETE data

    return app.use('/api/', router)
};

module.exports = initProduct