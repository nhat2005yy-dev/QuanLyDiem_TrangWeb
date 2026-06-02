const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Khai báo route Đăng ký public (Mặc định cho Sinh viên)
router.post('/register', authController.register);

// Khai báo route Đăng nhập
router.post('/login', authController.login);

// Khai báo route Tạo tài khoản nội bộ (KHOA/PGV)
router.post('/register-internal', verifyToken, checkRole(['PGV', 'KHOA']), authController.registerInternal);

module.exports = router;
