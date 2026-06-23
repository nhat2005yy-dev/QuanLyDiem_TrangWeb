const gradeService = require('../services/gradeService');

const gradeController = {
    getGrades: async (req, res) => {
        try {
            const { MASV } = req.query;

            if (!MASV) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng cung cấp MASV (ví dụ: /api/grades?MASV=N19DCCN001)'
                });
            }

            const data = await gradeService.getGrades(MASV);

            res.status(200).json({
                success: true,
                count: data.length,
                data: data
            });

        } catch (error) {
            console.error('Error fetching grades:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy kết quả điểm sinh viên',
                error: error.message
            });
        }
    },

    updateGrades: async (req, res) => {
        try {
            const { MASV, MALTC, DIEM_CC, DIEM_GK, DIEM_CK } = req.body;

            if (!MASV || !MALTC) {
                return res.status(400).json({ message: "Vui lòng truyền đủ MASV và MALTC" });
            }

            // Ràng buộc thời gian: Không cho phép nhập điểm lớp tương lai
            const timeStatus = await gradeService.getClassStatus(parseInt(MALTC));
            if (timeStatus === 'FUTURE') {
                return res.status(400).json({ success: false, message: 'Lớp tín chỉ chưa mở (trong tương lai), không thể nhập điểm!' });
            }

            // Bảo mật: Nếu là KHOA, kiểm tra giảng viên có dạy lớp này hay không
            if (req.user && req.user.role === 'KHOA') {
                const isOwner = await gradeService.checkClassLecturer(parseInt(MALTC), req.user.username);
                if (!isOwner) {
                    return res.status(403).json({ success: false, message: 'Bạn không có quyền nhập điểm cho lớp tín chỉ của giảng viên khác!' });
                }
            }

            const result = await gradeService.updateGrades({ MASV, MALTC, DIEM_CC, DIEM_GK, DIEM_CK });

            if (result.success) {
                return res.status(200).json({ message: "Update success" });
            } else {
                return res.status(400).json({ message: result.message });
            }
            
        } catch (error) {
            console.error('Error updating grades:', error);
            res.status(500).json({ message: error.message });
        }
    },

    updateBulkGrades: async (req, res) => {
        try {
            const gradesArray = req.body;
            if (!Array.isArray(gradesArray) || gradesArray.length === 0) {
                return res.status(400).json({ success: false, message: "Dữ liệu không hợp lệ" });
            }

            const uniqMaltcs = [...new Set(gradesArray.map(g => parseInt(g.MALTC)))];

            // Ràng buộc thời gian: Không cho phép nhập điểm lớp tương lai
            for (const maltc of uniqMaltcs) {
                const timeStatus = await gradeService.getClassStatus(maltc);
                if (timeStatus === 'FUTURE') {
                    return res.status(400).json({ success: false, message: `Lớp tín chỉ #${maltc} chưa mở (trong tương lai), không thể nhập điểm!` });
                }
            }

            // Bảo mật: Nếu là KHOA, kiểm tra giảng viên có dạy tất cả các lớp này hay không
            if (req.user && req.user.role === 'KHOA') {
                for (const maltc of uniqMaltcs) {
                    const isOwner = await gradeService.checkClassLecturer(maltc, req.user.username);
                    if (!isOwner) {
                        return res.status(403).json({ success: false, message: `Bạn không có quyền nhập điểm cho lớp tín chỉ #${maltc} của giảng viên khác!` });
                    }
                }
            }

            const result = await gradeService.updateBulkGrades(gradesArray);
            
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(400).json(result);
            }

        } catch (error) {
            console.error('Error in bulk update grades:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getStudentsByLTC: async (req, res) => {
        try {
            const { MALTC } = req.query;

            if (!MALTC) {
                return res.status(400).json({ success: false, message: 'Vui lòng cung cấp MALTC' });
            }

            // Ràng buộc thời gian: Không cho phép xem lớp tương lai để nhập điểm
            const timeStatus = await gradeService.getClassStatus(parseInt(MALTC));
            if (timeStatus === 'FUTURE') {
                return res.status(400).json({ success: false, message: 'Lớp tín chỉ chưa mở (trong tương lai), không thể xem danh sách nhập điểm!' });
            }

            // Bảo mật: Nếu là KHOA, kiểm tra giảng viên có dạy lớp này hay không
            if (req.user && req.user.role === 'KHOA') {
                const isOwner = await gradeService.checkClassLecturer(parseInt(MALTC), req.user.username);
                if (!isOwner) {
                    return res.status(403).json({ success: false, message: 'Bạn không có quyền xem danh sách sinh viên lớp tín chỉ của giảng viên khác!' });
                }
            }

            const data = await gradeService.getStudentsByLTC(MALTC);

            res.status(200).json({
                success: true,
                count: data.length,
                data: data
            });
        } catch (error) {
            console.error('Error fetching students by class:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    }
};

module.exports = gradeController;
