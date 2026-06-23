const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');

const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Các Action cho Lớp Tín Chỉ
router.get('/classes', classController.getClasses);
router.get('/classes/next-nhom', verifyToken, classController.getNextNhom);
router.post('/classes', verifyToken, checkRole(['PGV']), classController.addLopTinChi);
router.put('/classes/:id', verifyToken, checkRole(['PGV']), classController.updateLopTinChi);
router.delete('/classes/:id', verifyToken, checkRole(['PGV']), classController.deleteLopTinChi);

// Quản lý Lớp (LOP)
router.get('/lop', verifyToken, classController.getAllLop);
router.post('/lop', verifyToken, checkRole(['PGV']), classController.addLop);
router.put('/lop/:id', verifyToken, checkRole(['PGV']), classController.updateLop);
router.delete('/lop/:id', verifyToken, checkRole(['PGV']), classController.deleteLop);

module.exports = router;
