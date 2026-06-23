const { sql } = require('../config/db');

const gradeRepository = {
    getGradesByStudent: async (masv) => {
        const request = new sql.Request();
        request.input('MASV', sql.NChar(10), masv);
        const result = await request.execute('sp_GetGrades');
        return result.recordset;
    },

    updateGrades: async (gradeData) => {
        const request = new sql.Request();
        request.input('MASV', sql.NChar(10), gradeData.MASV);
        request.input('MALTC', sql.Int, gradeData.MALTC);
        request.input('DIEM_CC', sql.Float, gradeData.DIEM_CC);
        request.input('DIEM_GK', sql.Float, gradeData.DIEM_GK);
        request.input('DIEM_CK', sql.Float, gradeData.DIEM_CK);
        request.output('StatusMessage', sql.NVarChar(255));

        const result = await request.execute('sp_UpdateGrades');
        return result.output.StatusMessage;
    },

    updateBulkGrades: async (gradesArray) => {
        const transaction = new sql.Transaction();
        await transaction.begin();

        try {
            for (const grade of gradesArray) {
                const reqTx = new sql.Request(transaction);
                reqTx.input('MASV', sql.NChar(10), grade.MASV);
                reqTx.input('MALTC', sql.Int, grade.MALTC);
                reqTx.input('DIEM_CC', sql.Float, grade.DIEM_CC);
                reqTx.input('DIEM_GK', sql.Float, grade.DIEM_GK);
                reqTx.input('DIEM_CK', sql.Float, grade.DIEM_CK);
                reqTx.output('StatusMessage', sql.NVarChar(255));

                const result = await reqTx.execute('sp_UpdateGrades');
                if (result.output.StatusMessage !== 'SUCCESS') {
                    throw new Error(result.output.StatusMessage || 'Lỗi cập nhật điểm');
                }
            }

            await transaction.commit();
            return 'SUCCESS';
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    getStudentsByLTC: async (maltc) => {
        const request = new sql.Request();
        request.input('MALTC', sql.Int, maltc);
        const result = await request.execute('sp_GetStudentsByLTC');
        return result.recordset;
    },

    checkClassLecturer: async (maltc, magv) => {
        const request = new sql.Request();
        request.input('MALTC', sql.Int, maltc);
        request.input('MAGV', sql.NChar(10), magv);
        const result = await request.query(`
            SELECT 1 FROM LOPTINCHI 
            WHERE MALTC = @MALTC AND RTRIM(MAGV) = RTRIM(@MAGV)
        `);
        return result.recordset.length > 0;
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

module.exports = gradeRepository;
