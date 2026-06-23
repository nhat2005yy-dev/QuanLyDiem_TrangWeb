const gradeRepository = require('../repositories/gradeRepository');

const gradeService = {
    getGrades: async (masv) => {
        return await gradeRepository.getGradesByStudent(masv);
    },

    updateGrades: async (gradeData) => {
        const payload = {
            MASV: gradeData.MASV,
            MALTC: parseInt(gradeData.MALTC),
            DIEM_CC: gradeData.DIEM_CC !== undefined && gradeData.DIEM_CC !== '' ? parseFloat(gradeData.DIEM_CC) : null,
            DIEM_GK: gradeData.DIEM_GK !== undefined && gradeData.DIEM_GK !== '' ? parseFloat(gradeData.DIEM_GK) : null,
            DIEM_CK: gradeData.DIEM_CK !== undefined && gradeData.DIEM_CK !== '' ? parseFloat(gradeData.DIEM_CK) : null
        };
        const status = await gradeRepository.updateGrades(payload);
        if (status === 'SUCCESS') {
            return { success: true, message: 'Cập nhật điểm thành công' };
        } else {
            return { success: false, message: status };
        }
    },

    updateBulkGrades: async (gradesArray) => {
        const formattedGrades = gradesArray.map(grade => ({
            MASV: grade.MASV,
            MALTC: parseInt(grade.MALTC),
            DIEM_CC: grade.DIEM_CC !== undefined && grade.DIEM_CC !== '' ? parseFloat(grade.DIEM_CC) : null,
            DIEM_GK: grade.DIEM_GK !== undefined && grade.DIEM_GK !== '' ? parseFloat(grade.DIEM_GK) : null,
            DIEM_CK: grade.DIEM_CK !== undefined && grade.DIEM_CK !== '' ? parseFloat(grade.DIEM_CK) : null
        }));
        
        const status = await gradeRepository.updateBulkGrades(formattedGrades);
        if (status === 'SUCCESS') {
            return { success: true, message: "Cập nhật điểm hàng loạt thành công!" };
        } else {
            return { success: false, message: status };
        }
    },

    getStudentsByLTC: async (maltc) => {
        return await gradeRepository.getStudentsByLTC(parseInt(maltc));
    },

    checkClassLecturer: async (maltc, magv) => {
        return await gradeRepository.checkClassLecturer(maltc, magv);
    },

    getClassStatus: async (maltc) => {
        return await gradeRepository.getClassStatus(maltc);
    }
};

module.exports = gradeService;
