const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Khai báo route GET /api/students
router.get('/students', verifyToken, studentController.getStudents);
router.post('/students', verifyToken, checkRole(['PGV']), studentController.addStudent);
router.put('/students/:id', verifyToken, checkRole(['PGV']), studentController.updateStudent);
router.delete('/students/:id', verifyToken, checkRole(['PGV']), studentController.deleteStudent);

module.exports = router;
