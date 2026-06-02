const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');

// Khai báo route GET /api/grades
router.get('/grades', gradeController.getGrades);

// Khai báo route PUT /api/grades (nhập điểm từng sinh viên)
router.put('/grades', gradeController.updateGrades);

// Khai báo route PUT /api/grades/bulk (nhập điểm hàng loạt)
router.put('/grades/bulk', gradeController.updateBulkGrades);

// Khai báo route GET /api/grades/students (lấy danh sách sv của 1 LTC)
router.get('/grades/students', gradeController.getStudentsByLTC);

module.exports = router;
