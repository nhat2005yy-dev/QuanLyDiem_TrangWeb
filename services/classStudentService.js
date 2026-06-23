const classStudentRepository = require('../repositories/classStudentRepository');

const classStudentService = {
    getClassStudents: async (maltc) => {
        return await classStudentRepository.getClassStudents(maltc);
    }
};

module.exports = classStudentService;
