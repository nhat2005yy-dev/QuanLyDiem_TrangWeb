const express = require('express');
const router = express.Router();
const classStudentController = require('../controllers/classStudentController');

// Khai báo route GET /api/class-students
router.get('/class-students', classStudentController.getClassStudents);

module.exports = router;
