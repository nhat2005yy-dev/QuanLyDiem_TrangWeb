const { sql } = require('../config/db');

const monHocRepository = {
    getAll: async () => {
        const request = new sql.Request();
        const result = await request.execute('sp_GetAllMonHoc');
        return result.recordset;
    },

    add: async (mhData) => {
        const request = new sql.Request();
        request.input('MAMH', sql.NChar(10), mhData.MAMH);
        request.input('TENMH', sql.NVarChar(100), mhData.TENMH);
        request.input('SOTINCHI_LT', sql.Int, mhData.SOTINCHI_LT || 0);
        request.input('SOTINCHI_TH', sql.Int, mhData.SOTINCHI_TH || 0);
        request.output('StatusMessage', sql.NVarChar(255));

        const result = await request.execute('sp_AddMonHoc');
        return result.output.StatusMessage;
    },

    update: async (id, mhData) => {
        const request = new sql.Request();
        request.input('MAMH', sql.NChar(10), id);
        request.input('TENMH', sql.NVarChar(100), mhData.TENMH);
        request.input('SOTINCHI_LT', sql.Int, mhData.SOTINCHI_LT);
        request.input('SOTINCHI_TH', sql.Int, mhData.SOTINCHI_TH);
        request.output('StatusMessage', sql.NVarChar(255));

        const result = await request.execute('sp_UpdateMonHoc');
        return result.output.StatusMessage;
    },

    delete: async (id) => {
        const request = new sql.Request();
        request.input('MAMH', sql.NChar(10), id);
        request.output('StatusMessage', sql.NVarChar(255));

        const result = await request.execute('sp_DeleteMonHoc');
        return result.output.StatusMessage;
    }
};

module.exports = monHocRepository;
