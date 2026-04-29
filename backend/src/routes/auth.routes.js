const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/register', authController.registerUser);

router.post('/login', authController.loginUser);

const authMiddleware = require('../middlewaares/auth.middleware');

router.post('/logout', authController.logoutUser);

router.get('/me', authMiddleware.authUser, authController.getMe);

module.exports = router;
