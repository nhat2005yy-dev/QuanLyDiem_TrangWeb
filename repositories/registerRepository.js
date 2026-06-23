const { sql } = require('../config/db');

const registerRepository = {
    registerClass: async (masv, maltc) => {
        const request = new sql.Request();
        request.input('MASV', sql.NChar(10), masv);
        request.input('MALTC', sql.Int, maltc);
        request.output('StatusMessage', sql.NVarChar(255));

        const result = await request.execute('sp_RegisterClass');
        return result.output.StatusMessage;
    },

    cancelClass: async (masv, maltc) => {
        const request = new sql.Request();
        request.input('MASV', sql.NChar(10), masv);
        request.input('MALTC', sql.Int, maltc);
        request.output('StatusMessage', sql.NVarChar(255));

        const result = await request.execute('sp_CancelClass');
        return result.output.StatusMessage;
    },

    getRegisteredClasses: async (masv, nienkhoa, hocky) => {
        const request = new sql.Request();
        request.input('MASV', sql.NChar(10), masv);
        request.input('NIENKHOA', sql.NVarChar(18), nienkhoa);
        request.input('HOCKY', sql.Int, hocky);

        const result = await request.execute('sp_GetRegisteredClasses');
        return result.recordset;
    },

    getClassStatus: async (maltc) => {
        const request = new sql.Request();
        request.input('MALTC', sql.Int, maltc);
        const result = await request.query('SELECT NIENKHOA, HOCKY, HUYLOP FROM LOPTINCHI WHERE MALTC = @MALTC');
        if (result.recordset.length === 0) return null;
        
        const row = result.recordset[0];
        const cleanNK = row.NIENKHOA.trim();
        const parts = cleanNK.split('-');
        if (parts.length !== 2) return 'INACTIVE';
        
        const startYear = parseInt(parts[0]);
        const endYear = parseInt(parts[1]);
        const now = new Date();
        let startDate, endDate;
        const hkVal = parseInt(row.HOCKY);
        
        if (hkVal === 1) {
            startDate = new Date(startYear, 8, 1, 0, 0, 0, 0); // 1/9
            endDate = new Date(endYear, 0, 1, 23, 59, 59, 999); // 1/1
        } else if (hkVal === 2) {
            startDate = new Date(endYear, 0, 2, 0, 0, 0, 0); // 2/1
            endDate = new Date(endYear, 6, 7, 23, 59, 59, 999); // 7/7
        } else {
            startDate = new Date(endYear, 6, 8, 0, 0, 0, 0); // 8/7
            endDate = new Date(endYear, 7, 31, 23, 59, 59, 999); // 31/8
        }
        
        if (row.HUYLOP) {
            return 'CANCELED';
        } else if (now < startDate) {
            return 'FUTURE';
        } else if (now >= startDate && now <= endDate) {
            return 'ACTIVE';
        } else {
            return 'INACTIVE';
        }
    }
};

module.exports = registerRepository;
