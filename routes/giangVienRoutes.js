const express = require('express');
const router = express.Router();
const giangVienController = require('../controllers/giangVienController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.get('/giangvien', giangVienController.getAllGiangVien);
router.get('/giangvien/next-id', verifyToken, checkRole(['PGV']), giangVienController.getNextId);
router.post('/giangvien', verifyToken, checkRole(['PGV']), giangVienController.addGiangVien);
router.put('/giangvien/:id', verifyToken, checkRole(['PGV']), giangVienController.updateGiangVien);
router.delete('/giangvien/:id', verifyToken, checkRole(['PGV']), giangVienController.deleteGiangVien);

module.exports = router;
