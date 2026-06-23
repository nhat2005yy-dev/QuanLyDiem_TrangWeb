const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Khai báo route GET /api/grades
router.get('/grades', gradeController.getGrades);

// Khai báo route PUT /api/grades (nhập điểm từng sinh viên) - cần bảo mật cho KHOA và PGV
router.put('/grades', verifyToken, checkRole(['PGV', 'KHOA']), gradeController.updateGrades);

// Khai báo route PUT /api/grades/bulk (nhập điểm hàng loạt) - cần bảo mật cho KHOA và PGV
router.put('/grades/bulk', verifyToken, checkRole(['PGV', 'KHOA']), gradeController.updateBulkGrades);

// Khai báo route GET /api/grades/students (lấy danh sách sv của 1 LTC) - cần bảo mật cho KHOA và PGV
router.get('/grades/students', verifyToken, checkRole(['PGV', 'KHOA']), gradeController.getStudentsByLTC);

module.exports = router;
