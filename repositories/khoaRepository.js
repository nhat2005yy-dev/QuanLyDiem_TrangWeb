const { sql } = require('../config/db');

const khoaRepository = {
    getAll: async () => {
        const request = new sql.Request();
        const result = await request.execute('sp_GetAllKhoa');
        return result.recordset;
    },

    add: async (khoaData) => {
        const request = new sql.Request();
        request.input('MAKHOA', sql.NChar(10), khoaData.MAKHOA);
        request.input('TENKHOA', sql.NVarChar(50), khoaData.TENKHOA);
        request.output('StatusMessage', sql.NVarChar(255));

        const result = await request.execute('sp_AddKhoa');
        return result.output.StatusMessage;
    },

    update: async (id, khoaData) => {
        const request = new sql.Request();
        request.input('MAKHOA', sql.NChar(10), id);
        request.input('TENKHOA', sql.NVarChar(50), khoaData.TENKHOA);
        request.output('StatusMessage', sql.NVarChar(255));

        const result = await request.execute('sp_UpdateKhoa');
        return result.output.StatusMessage;
    },

    delete: async (id) => {
        const request = new sql.Request();
        request.input('MAKHOA', sql.NChar(10), id);
        request.output('StatusMessage', sql.NVarChar(255));

        const result = await request.execute('sp_DeleteKhoa');
        return result.output.StatusMessage;
    }
};

module.exports = khoaRepository;
