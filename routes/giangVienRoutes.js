const express = require('express');
const router = express.Router();
const giangVienController = require('../controllers/giangVienController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.get('/giangvien', giangVienController.getAllGiangVien);
router.post('/giangvien', verifyToken, checkRole(['PGV', 'KHOA']), giangVienController.addGiangVien);
router.put('/giangvien/:id', verifyToken, checkRole(['PGV', 'KHOA']), giangVienController.updateGiangVien);
router.delete('/giangvien/:id', verifyToken, checkRole(['PGV', 'KHOA']), giangVienController.deleteGiangVien);

module.exports = router;
