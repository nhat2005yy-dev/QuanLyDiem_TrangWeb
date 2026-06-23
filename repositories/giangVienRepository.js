const { sql } = require('../config/db');

const giangVienRepository = {
    getAll: async () => {
        const request = new sql.Request();
        const result = await request.execute('sp_GetAllGiangVien');
        return result.recordset;
    },

    getNextId: async () => {
        const request = new sql.Request();
        const result = await request.query(`
            SELECT 
                ISNULL(MAX(CAST(SUBSTRING(MAGV, 3, LEN(RTRIM(MAGV)) - 2) AS INT)), 0) + 1 AS NextNumber 
            FROM GIANGVIEN 
            WHERE MAGV LIKE 'GV%'
        `);
        const nextNumber = result.recordset[0].NextNumber;
        const formattedId = 'GV' + String(nextNumber).padStart(4, '0');
        return formattedId;
    },

    add: async (gvData) => {
        const request = new sql.Request();
        request.input('HO', sql.NVarChar(50), gvData.HO);
        request.input('TEN', sql.NVarChar(10), gvData.TEN);
        request.input('HOCVI', sql.NVarChar(20), gvData.HOCVI || null);
        request.input('HOCHAM', sql.NVarChar(20), gvData.HOCHAM || null);
        request.input('CHUYENMON', sql.NVarChar(50), gvData.CHUYENMON || null);
        request.input('MAKHOA', sql.NChar(10), gvData.MAKHOA);
        request.output('StatusMessage', sql.NVarChar(255));

        const result = await request.execute('sp_AddGiangVien');
        return {
            status: result.output.StatusMessage,
            magv: result.recordset && result.recordset.length > 0 ? result.recordset[0].MAGV : null
        };
    },

    update: async (id, gvData) => {
        const request = new sql.Request();
        request.input('MAGV', sql.NChar(10), id);
        request.input('HO', sql.NVarChar(50), gvData.HO);
        request.input('TEN', sql.NVarChar(10), gvData.TEN);
        request.input('HOCVI', sql.NVarChar(20), gvData.HOCVI || null);
        request.input('HOCHAM', sql.NVarChar(20), gvData.HOCHAM || null);
        request.input('CHUYENMON', sql.NVarChar(50), gvData.CHUYENMON || null);
        request.input('MAKHOA', sql.NChar(10), gvData.MAKHOA);
        request.output('StatusMessage', sql.NVarChar(255));

        const result = await request.execute('sp_UpdateGiangVien');
        return result.output.StatusMessage;
    },

    delete: async (id) => {
        const request = new sql.Request();
        request.input('MAGV', sql.NChar(10), id);
        request.output('StatusMessage', sql.NVarChar(255));

        const result = await request.execute('sp_DeleteGiangVien');
        return result.output.StatusMessage;
    }
};

module.exports = giangVienRepository;
