const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authUser } = require('../middlewaares/auth.middleware');

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/logout', authController.logoutUser);

router.get('/me', authUser, authController.getMe);

module.exports = router;
