
const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const requireTrustedOrigin = require('../middleware/requireTrustedOrigin');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authController.getCurrentUser);
router.post('/logout', authController.logout);
router.put('/profile', authMiddleware, requireTrustedOrigin, authController.updateProfile);
router.put('/password', authMiddleware, requireTrustedOrigin, authController.updatePassword);
router.delete('/account', authMiddleware, requireTrustedOrigin, authController.deleteAccount);

module.exports = router;
