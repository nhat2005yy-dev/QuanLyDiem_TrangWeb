const express = require('express');
const router = express.Router();
const monHocController = require('../controllers/monHocController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Chỉ lấy list không yêu cầu quá khắt khe, nhưng các thao tác thêm sửa xóa yêu cầu quyền PGV
router.get('/monhoc', monHocController.getAllMonHoc);
router.post('/monhoc', verifyToken, checkRole(['PGV']), monHocController.addMonHoc);
router.put('/monhoc/:id', verifyToken, checkRole(['PGV']), monHocController.updateMonHoc);
router.delete('/monhoc/:id', verifyToken, checkRole(['PGV']), monHocController.deleteMonHoc);

module.exports = router;
