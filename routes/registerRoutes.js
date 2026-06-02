const express = require('express');
const router = express.Router();
const registerController = require('../controllers/registerController');

router.get('/course-registration', registerController.getRegisteredClasses);
router.post('/course-registration', registerController.registerClass);
router.delete('/course-registration', registerController.cancelClass);

module.exports = router;
