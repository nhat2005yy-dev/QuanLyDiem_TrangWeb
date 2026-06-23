const studentRepository = require('../repositories/studentRepository');

const studentService = {
    getAllStudents: async () => {
        return await studentRepository.getAll();
    },

    addStudent: async (studentData) => {
        const payload = {
            MASV: studentData.MASV,
            HO: studentData.HO,
            TEN: studentData.TEN,
            PHAI: studentData.PHAI === 'true' || studentData.PHAI === true || studentData.PHAI === 1 ? 1 : 0,
            DIACHI: studentData.DIACHI,
            NGAYSINH: studentData.NGAYSINH,
            MALOP: studentData.MALOP,
            DANGHIHOC: studentData.DANGHIHOC === 'true' || studentData.DANGHIHOC === true || studentData.DANGHIHOC === 1 ? 1 : 0,
            PASSWORD: studentData.PASSWORD
        };

        // Backend validation: Kiểm tra định dạng và khóa học của sinh viên / lớp
        if (payload.NGAYSINH) {
            const birthDate = new Date(payload.NGAYSINH);
            const today = new Date();
            today.setHours(23, 59, 59, 999); // Cho phép chọn ngày hôm nay
            if (birthDate > today) {
                return { success: false, message: 'Ngày sinh không hợp lệ' };
            }
        }

        const masvMatch = payload.MASV.match(/^[^0-9]*([0-9]{2})/);
        if (!masvMatch) {
            return { success: false, message: 'Mã sinh viên không đúng định dạng' };
        }
        const svCohort = parseInt(masvMatch[1]);
        const lopCohort = parseInt(payload.MALOP.substring(1, 3));
        if (isNaN(svCohort) || isNaN(lopCohort)) {
            return { success: false, message: 'Mã sinh viên hoặc mã lớp không đúng định dạng' };
        }
        if (svCohort !== lopCohort) {
            return { success: false, message: `Sinh viên khóa ${svCohort} chỉ được vào lớp khóa ${svCohort}` };
        }

        const status = await studentRepository.add(payload);
        if (status === 'SUCCESS') {
            return { success: true, message: 'Thêm Sinh viên thành công' };
        } else {
            return { success: false, message: status };
        }
    },

    updateStudent: async (id, studentData) => {
        const payload = {
            MASV_MOI: studentData.MASV_MOI,
            HO: studentData.HO,
            TEN: studentData.TEN,
            PHAI: studentData.PHAI === 'true' || studentData.PHAI === true || studentData.PHAI === 1 ? 1 : 0,
            DIACHI: studentData.DIACHI,
            NGAYSINH: studentData.NGAYSINH,
            MALOP: studentData.MALOP,
            DANGHIHOC: studentData.DANGHIHOC === 'true' || studentData.DANGHIHOC === true || studentData.DANGHIHOC === 1 ? 1 : 0,
            PASSWORD: studentData.PASSWORD
        };

        // Backend validation: Kiểm tra định dạng và khóa học của sinh viên / lớp
        if (payload.NGAYSINH) {
            const birthDate = new Date(payload.NGAYSINH);
            const today = new Date();
            today.setHours(23, 59, 59, 999); // Cho phép chọn ngày hôm nay
            if (birthDate > today) {
                return { success: false, message: 'Ngày sinh không hợp lệ' };
            }
        }

        const currentMASV = payload.MASV_MOI || id;
        const masvMatch = currentMASV.match(/^[^0-9]*([0-9]{2})/);
        if (!masvMatch) {
            return { success: false, message: 'Mã sinh viên không đúng định dạng' };
        }
        const svCohort = parseInt(masvMatch[1]);
        const lopCohort = parseInt(payload.MALOP.substring(1, 3));
        if (isNaN(svCohort) || isNaN(lopCohort)) {
            return { success: false, message: 'Mã sinh viên hoặc mã lớp không đúng định dạng' };
        }
        if (lopCohort < svCohort) {
            return { success: false, message: `Sinh viên khóa ${svCohort} không được vào lớp khóa ${lopCohort}` };
        }

        const status = await studentRepository.update(id, payload);
        if (status === 'SUCCESS') {
            return { success: true, message: 'Cập nhật Sinh viên thành công' };
        } else {
            return { success: false, message: status };
        }
    },

    deleteStudent: async (id) => {
        const status = await studentRepository.delete(id);
        if (status === 'SUCCESS') {
            return { success: true, message: 'Xóa Sinh viên thành công' };
        } else {
            return { success: false, message: status };
        }
    }
};

module.exports = studentService;
