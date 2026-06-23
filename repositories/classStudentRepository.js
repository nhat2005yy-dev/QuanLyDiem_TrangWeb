const { sql } = require('../config/db');

const classStudentRepository = {
    getClassStudents: async (maltc) => {
        const request = new sql.Request();
        request.input('MALTC', sql.Int, maltc);

        const result = await request.execute('sp_GetClassStudents');
        return result.recordset;
    }
};

module.exports = classStudentRepository;
