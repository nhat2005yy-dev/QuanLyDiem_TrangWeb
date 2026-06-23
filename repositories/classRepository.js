const { sql } = require('../config/db');

const classRepository = {
    // Lớp Tín Chỉ (LOPTINCHI)
    getClasses: async (nienkhoa, hocky, magv) => {
        const request = new sql.Request();
        request.input('NIENKHOA', sql.NVarChar(18), nienkhoa);
        request.input('HOCKY', sql.Int, hocky);
        request.input('MAGV', sql.NChar(10), magv || null);

        const result = await request.execute('sp_GetClasses');
        return result.recordset;
    },

    addLopTinChi: async (classData) => {
        const request = new sql.Request();
        request.input('NIENKHOA', sql.NVarChar(18), classData.NIENKHOA);
        request.input('HOCKY', sql.Int, classData.HOCKY);
        request.input('MAMH', sql.NChar(10), classData.MAMH);
        request.input('MAGV', sql.NChar(10), classData.MAGV);
        request.input('MAKHOA', sql.NChar(10), classData.MAKHOA);
        request.input('SOSVTOITHIEU', sql.Int, classData.SOSVTOITHIEU || 10);
        request.input('HUYLOP', sql.Bit, classData.HUYLOP);
        request.output('StatusMessage', sql.NVarChar(255));

        const result = await request.execute('sp_AddLopTinChi');
        return {
            status: result.output.StatusMessage,
            nhom: result.recordset && result.recordset.length > 0 ? result.recordset[0].NHOM : null
        };
    },

    updateLopTinChi: async (id, classData) => {
        const request = new sql.Request();
        request.input('MALTC', sql.Int, id);
        request.input('NIENKHOA', sql.NVarChar(18), classData.NIENKHOA);
        request.input('HOCKY', sql.Int, classData.HOCKY);
        request.input('MAMH', sql.NChar(10), classData.MAMH);
        request.input('MAGV', sql.NChar(10), classData.MAGV);
        request.input('MAKHOA', sql.NChar(10), classData.MAKHOA);
        request.input('SOSVTOITHIEU', sql.Int, classData.SOSVTOITHIEU);
        request.input('HUYLOP', sql.Bit, classData.HUYLOP);
        request.output('StatusMessage', sql.NVarChar(255));

        const result = await request.execute('sp_UpdateLopTinChi');
        return result.output.StatusMessage;
    },

    deleteLopTinChi: async (id) => {
        const request = new sql.Request();
        request.input('MALTC', sql.Int, id);
        request.output('StatusMessage', sql.NVarChar(255));

        const result = await request.execute('sp_DeleteLopTinChi');
        return result.output.StatusMessage;
    },

    getNextNhom: async (nienkhoa, hocky, mamh) => {
        const request = new sql.Request();
        request.input('NIENKHOA', sql.NVarChar(18), nienkhoa);
        request.input('HOCKY', sql.Int, hocky);
        request.input('MAMH', sql.NChar(10), mamh);
        const result = await request.query(`
            SELECT ISNULL(MAX(NHOM), 0) + 1 AS NEXT_NHOM 
            FROM LOPTINCHI 
            WHERE NIENKHOA = @NIENKHOA AND HOCKY = @HOCKY AND MAMH = @MAMH
        `);
        return result.recordset[0].NEXT_NHOM;
    },

    checkTeacherDuplicate: async (nienkhoa, hocky, mamh, magv, excludeMaltc = null) => {
        const request = new sql.Request();
        request.input('NIENKHOA', sql.NVarChar(18), nienkhoa);
        request.input('HOCKY', sql.Int, hocky);
        request.input('MAMH', sql.NChar(10), mamh);
        request.input('MAGV', sql.NChar(10), magv);

        let query = `
            SELECT 1 FROM LOPTINCHI 
            WHERE NIENKHOA = @NIENKHOA 
              AND HOCKY = @HOCKY 
              AND MAMH = @MAMH 
              AND MAGV = @MAGV
        `;
        if (excludeMaltc !== null) {
            request.input('EXCLUDE_MALTC', sql.Int, excludeMaltc);
            query += ` AND MALTC <> @EXCLUDE_MALTC`;
        }

        const result = await request.query(query);
        return result.recordset.length > 0;
    },

    // Lớp Hành Chính (LOP)
    getAllLop: async () => {
        const request = new sql.Request();
        const result = await request.execute('sp_GetAllLop');
        return result.recordset;
    },

    addLop: async (lopData) => {
        const request = new sql.Request();
        request.input('MALOP', sql.NVarChar(20), lopData.MALOP);
        request.input('TENLOP', sql.NVarChar(50), lopData.TENLOP);
        request.input('KHOAHOC', sql.NChar(9), lopData.KHOAHOC);
        request.input('MAKHOA', sql.NChar(10), lopData.MAKHOA);
        request.output('StatusMessage', sql.NVarChar(255));

        const result = await request.execute('sp_AddLop');
        return result.output.StatusMessage;
    },

    updateLop: async (id, lopData) => {
        const request = new sql.Request();
        request.input('MALOP', sql.NVarChar(20), id);
        request.input('TENLOP', sql.NVarChar(50), lopData.TENLOP);
        request.input('KHOAHOC', sql.NChar(9), lopData.KHOAHOC);
        request.input('MAKHOA', sql.NChar(10), lopData.MAKHOA);
        request.output('StatusMessage', sql.NVarChar(255));

        const result = await request.execute('sp_UpdateLop');
        return result.output.StatusMessage;
    },

    deleteLop: async (id) => {
        const request = new sql.Request();
        request.input('MALOP', sql.NVarChar(20), id);
        request.output('StatusMessage', sql.NVarChar(255));

        const result = await request.execute('sp_DeleteLop');
        return result.output.StatusMessage;
    },

    checkKhoaExists: async (makhoa) => {
        const request = new sql.Request();
        request.input('MAKHOA', sql.NChar(10), makhoa);
        const result = await request.query('SELECT 1 FROM KHOA WHERE MAKHOA = @MAKHOA');
        return result.recordset.length > 0;
    }
};

module.exports = classRepository;
