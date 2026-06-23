const classRepository = require('../repositories/classRepository');

const classService = {
    // Lớp Tín Chỉ (LOPTINCHI)
    getClasses: async (nienkhoa, hocky, magv) => {
        let cleanMagv = magv;
        if (!cleanMagv || cleanMagv === 'undefined' || cleanMagv === 'null' || (typeof cleanMagv === 'string' && cleanMagv.trim() === '')) {
            cleanMagv = null;
        }
        return await classRepository.getClasses(nienkhoa, hocky, cleanMagv);
    },

    addLopTinChi: async (classData) => {
        const isDuplicateTeacher = await classRepository.checkTeacherDuplicate(
            classData.NIENKHOA,
            parseInt(classData.HOCKY),
            classData.MAMH,
            classData.MAGV
        );
        if (isDuplicateTeacher) {
            return { success: false, message: 'Giảng viên đã dạy một nhóm khác của môn học này trong học kỳ/niên khóa này' };
        }

        const payload = {
            NIENKHOA: classData.NIENKHOA,
            HOCKY: parseInt(classData.HOCKY),
            MAMH: classData.MAMH,
            MAGV: classData.MAGV,
            MAKHOA: classData.MAKHOA,
            SOSVTOITHIEU: classData.SOSVTOITHIEU ? parseInt(classData.SOSVTOITHIEU) : 10,
            HUYLOP: classData.HUYLOP === 'true' || classData.HUYLOP === true || classData.HUYLOP === 1 ? 1 : 0
        };
        const result = await classRepository.addLopTinChi(payload);
        if (result.status === 'SUCCESS') {
            return { success: true, message: 'Tạo Lớp tín chỉ thành công', nhom: result.nhom };
        } else {
            return { success: false, message: result.status };
        }
    },

    updateLopTinChi: async (id, classData) => {
        const isDuplicateTeacher = await classRepository.checkTeacherDuplicate(
            classData.NIENKHOA,
            parseInt(classData.HOCKY),
            classData.MAMH,
            classData.MAGV,
            id
        );
        if (isDuplicateTeacher) {
            return { success: false, message: 'Giảng viên đã dạy một nhóm khác của môn học này trong học kỳ/niên khóa này' };
        }

        const payload = {
            NIENKHOA: classData.NIENKHOA,
            HOCKY: parseInt(classData.HOCKY),
            MAMH: classData.MAMH,
            MAGV: classData.MAGV,
            MAKHOA: classData.MAKHOA,
            SOSVTOITHIEU: parseInt(classData.SOSVTOITHIEU),
            HUYLOP: classData.HUYLOP === 'true' || classData.HUYLOP === true || classData.HUYLOP === 1 ? 1 : 0
        };
        const status = await classRepository.updateLopTinChi(id, payload);
        if (status === 'SUCCESS') {
            return { success: true, message: 'Cập nhật Lớp tín chỉ thành công' };
        } else {
            return { success: false, message: status };
        }
    },

    getNextNhom: async (nienkhoa, hocky, mamh) => {
        return await classRepository.getNextNhom(nienkhoa, hocky, mamh);
    },

    deleteLopTinChi: async (id) => {
        const status = await classRepository.deleteLopTinChi(id);
        if (status === 'SUCCESS') {
            return { success: true, message: 'Xóa Lớp tín chỉ thành công' };
        } else {
            return { success: false, message: status };
        }
    },

    // Lớp Hành Chính (LOP)
    getAllLop: async () => {
        return await classRepository.getAllLop();
    },

    addLop: async (lopData) => {
        if (lopData.MALOP.length > 20) {
            return { success: false, message: 'Mã lớp không được vượt quá 20 ký tự' };
        }
        if (lopData.TENLOP.length > 50) {
            return { success: false, message: 'Tên lớp không được vượt quá 50 ký tự' };
        }
        if (lopData.KHOAHOC && lopData.KHOAHOC.length > 9) {
            return { success: false, message: 'Khóa học không được vượt quá 9 ký tự (VD: 2023-2028)' };
        }
        if (lopData.MAKHOA.length > 10) {
            return { success: false, message: 'Mã khoa không được vượt quá 10 ký tự' };
        }

        const khoaExists = await classRepository.checkKhoaExists(lopData.MAKHOA);
        if (!khoaExists) {
            return { success: false, message: 'Khoa không tồn tại' };
        }

        const status = await classRepository.addLop(lopData);
        if (status === 'SUCCESS') {
            return { success: true, message: 'Thêm Lớp thành công' };
        } else {
            return { success: false, message: status };
        }
    },

    updateLop: async (id, lopData) => {
        if (lopData.TENLOP && lopData.TENLOP.length > 50) {
            return { success: false, message: 'Tên lớp không được vượt quá 50 ký tự' };
        }
        if (lopData.KHOAHOC && lopData.KHOAHOC.length > 9) {
            return { success: false, message: 'Khóa học không được vượt quá 9 ký tự (VD: 2023-2028)' };
        }
        if (lopData.MAKHOA) {
            if (lopData.MAKHOA.length > 10) {
                return { success: false, message: 'Mã khoa không được vượt quá 10 ký tự' };
            }
            const khoaExists = await classRepository.checkKhoaExists(lopData.MAKHOA);
            if (!khoaExists) {
                return { success: false, message: 'Khoa không tồn tại' };
            }
        }

        const status = await classRepository.updateLop(id, lopData);
        if (status === 'SUCCESS') {
            return { success: true, message: 'Cập nhật Lớp thành công' };
        } else {
            return { success: false, message: status };
        }
    },

    deleteLop: async (id) => {
        const status = await classRepository.deleteLop(id);
        if (status === 'SUCCESS') {
            return { success: true, message: 'Xóa Lớp thành công' };
        } else {
            return { success: false, message: status };
        }
    }
};

module.exports = classService;
