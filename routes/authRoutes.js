const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');


// Khai báo route Đăng nhập
router.post('/login', authController.login);

// Khai báo route Tạo tài khoản nội bộ (PGV/KHOA)
router.post('/register-internal', verifyToken, checkRole(['PGV', 'KHOA']), authController.registerInternal);

module.exports = router;
