const studentService = require('../services/studentService');

const studentController = {
    getStudents: async (req, res) => {
        try {
            const data = await studentService.getAllStudents();
            res.status(200).json({
                success: true,
                count: data.length,
                data: data
            });
        } catch (error) {
            console.error('Error fetching students:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy danh sách sinh viên',
                error: error.message
            });
        }
    },

    addStudent: async (req, res) => {
        try {
            let { MASV, HO, TEN, PHAI, DIACHI, NGAYSINH, MALOP, DANGHIHOC, PASSWORD } = req.body;
            if (!MASV || !HO || !TEN || !MALOP) {
                return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc (MASV, HO, TEN, MALOP)' });
            }

            MASV = MASV.toUpperCase().trim().replace(/\s/g, '');
            MALOP = MALOP.toUpperCase().trim().replace(/\s/g, '');
            HO = HO.trim();
            TEN = TEN.trim();

            const result = await studentService.addStudent({
                MASV,
                HO,
                TEN,
                PHAI,
                DIACHI,
                NGAYSINH,
                MALOP,
                DANGHIHOC,
                PASSWORD
            });

            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Lỗi khi thêm Sinh viên:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    updateStudent: async (req, res) => {
        try {
            const { id } = req.params;
            let { MASV_MOI, HO, TEN, PHAI, DIACHI, NGAYSINH, MALOP, DANGHIHOC, PASSWORD } = req.body;

            const cleanId = id.toUpperCase().trim().replace(/\s/g, '');
            if (MASV_MOI) {
                MASV_MOI = MASV_MOI.toUpperCase().trim().replace(/\s/g, '');
            }
            if (MALOP) {
                MALOP = MALOP.toUpperCase().trim().replace(/\s/g, '');
            }
            HO = HO.trim();
            TEN = TEN.trim();

            const result = await studentService.updateStudent(cleanId, {
                MASV_MOI,
                HO,
                TEN,
                PHAI,
                DIACHI,
                NGAYSINH,
                MALOP,
                DANGHIHOC,
                PASSWORD
            });

            if (result.success) {
                res.status(200).json(result);
            } else {
                const isNotFound = result.message.includes('Không tìm thấy');
                res.status(isNotFound ? 404 : 400).json(result);
            }
        } catch (error) {
            console.error('Lỗi khi sửa Sinh viên:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    deleteStudent: async (req, res) => {
        try {
            const { id } = req.params;
            const cleanId = id.toUpperCase().trim().replace(/\s/g, '');
            const result = await studentService.deleteStudent(cleanId);

            if (result.success) {
                res.status(200).json(result);
            } else {
                const isNotFound = result.message.includes('Không tìm thấy');
                res.status(isNotFound ? 404 : 400).json(result);
            }
        } catch (error) {
            console.error('Lỗi khi xóa Sinh viên:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    }
};

module.exports = studentController;
