const { sql } = require('../config/db');

const studentRepository = {
    getAll: async () => {
        const request = new sql.Request();
        const result = await request.execute('sp_GetStudents');
        return result.recordset;
    },

    add: async (studentData) => {
        const request = new sql.Request();
        request.input('MASV', sql.NChar(10), studentData.MASV);
        request.input('HO', sql.NVarChar(50), studentData.HO);
        request.input('TEN', sql.NVarChar(10), studentData.TEN);
        request.input('PHAI', sql.Bit, studentData.PHAI);
        request.input('DIACHI', sql.NVarChar(100), studentData.DIACHI);
        request.input('NGAYSINH', sql.Date, studentData.NGAYSINH);
        request.input('MALOP', sql.NVarChar(20), studentData.MALOP);
        request.input('DANGHIHOC', sql.Bit, studentData.DANGHIHOC);
        request.input('PASSWORD', sql.NVarChar(255), studentData.PASSWORD || '123456');
        request.output('StatusMessage', sql.NVarChar(255));

        const result = await request.execute('sp_AddStudent');
        return result.output.StatusMessage;
    },

    update: async (id, studentData) => {
        const request = new sql.Request();
        request.input('MASV', sql.NChar(10), id);
        request.input('MASV_MOI', sql.NChar(10), studentData.MASV_MOI || null);
        request.input('HO', sql.NVarChar(50), studentData.HO);
        request.input('TEN', sql.NVarChar(10), studentData.TEN);
        request.input('PHAI', sql.Bit, studentData.PHAI);
        request.input('DIACHI', sql.NVarChar(100), studentData.DIACHI);
        request.input('NGAYSINH', sql.Date, studentData.NGAYSINH);
        request.input('MALOP', sql.NVarChar(20), studentData.MALOP);
        request.input('DANGHIHOC', sql.Bit, studentData.DANGHIHOC);
        request.input('PASSWORD', sql.NVarChar(255), studentData.PASSWORD || null);
        request.output('StatusMessage', sql.NVarChar(255));

        const result = await request.execute('sp_UpdateStudent');
        return result.output.StatusMessage;
    },

    delete: async (id) => {
        const request = new sql.Request();
        request.input('MASV', sql.NChar(10), id);
        request.output('StatusMessage', sql.NVarChar(255));

        const result = await request.execute('sp_DeleteStudent');
        return result.output.StatusMessage;
    }
};

module.exports = studentRepository;
