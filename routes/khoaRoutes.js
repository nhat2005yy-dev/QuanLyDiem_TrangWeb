const express = require('express');
const khoaController = require('../controllers/khoaController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/khoa', verifyToken, khoaController.getAllKhoa);
router.post('/khoa', verifyToken, checkRole(['PGV']), khoaController.addKhoa);
router.put('/khoa/:id', verifyToken, checkRole(['PGV']), khoaController.updateKhoa);
router.delete('/khoa/:id', verifyToken, checkRole(['PGV']), khoaController.deleteKhoa);

module.exports = router;
