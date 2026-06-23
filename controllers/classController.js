const classService = require('../services/classService');

const classController = {
    // Quản lý Lớp Tín Chỉ (LOPTINCHI)
    getClasses: async (req, res) => {
        try {
            const { NIENKHOA, HOCKY, MAGV } = req.query;

            if (!NIENKHOA || !HOCKY) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng cung cấp NIENKHOA và HOCKY trên URL (VD: ?NIENKHOA=2023-2024&HOCKY=1)'
                });
            }

            const data = await classService.getClasses(NIENKHOA, HOCKY, MAGV);

            res.status(200).json({
                success: true,
                count: data.length,
                data: data
            });
        } catch (error) {
            console.error('Error fetching classes:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy danh sách lớp tín chỉ',
                error: error.message
            });
        }
    },

    addLopTinChi: async (req, res) => {
        try {
            let { NIENKHOA, HOCKY, MAMH, MAGV, MAKHOA, SOSVTOITHIEU, HUYLOP } = req.body;
            
            if (!NIENKHOA || !HOCKY || !MAMH || !MAGV || !MAKHOA) {
                return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc để tạo Lớp tín chỉ' });
            }

            NIENKHOA = NIENKHOA.toUpperCase().trim().replace(/\s/g, '');
            MAMH = MAMH.toUpperCase().trim().replace(/\s/g, '');
            MAGV = MAGV.toUpperCase().trim().replace(/\s/g, '');
            MAKHOA = MAKHOA.toUpperCase().trim().replace(/\s/g, '');

            const result = await classService.addLopTinChi({
                NIENKHOA,
                HOCKY,
                MAMH,
                MAGV,
                MAKHOA,
                SOSVTOITHIEU,
                HUYLOP
            });
            
            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Lỗi khi thêm LTC:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    updateLopTinChi: async (req, res) => {
        try {
            const { id } = req.params; // MALTC
            let { NIENKHOA, HOCKY, MAMH, MAGV, MAKHOA, SOSVTOITHIEU, HUYLOP } = req.body;

            const cleanId = parseInt(id);
            if (NIENKHOA) NIENKHOA = NIENKHOA.toUpperCase().trim().replace(/\s/g, '');
            if (MAMH) MAMH = MAMH.toUpperCase().trim().replace(/\s/g, '');
            if (MAGV) MAGV = MAGV.toUpperCase().trim().replace(/\s/g, '');
            if (MAKHOA) MAKHOA = MAKHOA.toUpperCase().trim().replace(/\s/g, '');

            const result = await classService.updateLopTinChi(cleanId, {
                NIENKHOA,
                HOCKY,
                MAMH,
                MAGV,
                MAKHOA,
                SOSVTOITHIEU,
                HUYLOP
            });

            if (result.success) {
                res.status(200).json(result);
            } else {
                const isNotFound = result.message.includes('Không tìm thấy');
                res.status(isNotFound ? 404 : 400).json(result);
            }
        } catch (error) {
            console.error('Lỗi khi sửa LTC:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    getNextNhom: async (req, res) => {
        try {
            let { NIENKHOA, HOCKY, MAMH } = req.query;

            if (!NIENKHOA || !HOCKY || !MAMH) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu thông tin NIENKHOA, HOCKY hoặc MAMH'
                });
            }

            NIENKHOA = NIENKHOA.toUpperCase().trim().replace(/\s/g, '');
            MAMH = MAMH.toUpperCase().trim().replace(/\s/g, '');

            const nextNhom = await classService.getNextNhom(NIENKHOA, parseInt(HOCKY), MAMH);

            res.status(200).json({
                success: true,
                nhom: nextNhom
            });
        } catch (error) {
            console.error('Error fetching next group number:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy số nhóm tiếp theo',
                error: error.message
            });
        }
    },

    deleteLopTinChi: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await classService.deleteLopTinChi(id);

            if (result.success) {
                res.status(200).json(result);
            } else {
                const isNotFound = result.message.includes('Không tìm thấy');
                res.status(isNotFound ? 404 : 400).json(result);
            }
        } catch (error) {
            console.error('Lỗi khi xóa LTC:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    // Quản lý Lớp Hành Chính (LOP)
    getAllLop: async (req, res) => {
        try {
            const data = await classService.getAllLop();
            res.status(200).json({ success: true, count: data.length, data: data });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách Lớp:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    addLop: async (req, res) => {
        try {
            let { MALOP, TENLOP, KHOAHOC, MAKHOA } = req.body;
            if (!MALOP || !TENLOP || !MAKHOA) {
                return res.status(400).json({ success: false, message: 'Thiếu thông tin lớp' });
            }

            MALOP = MALOP.toUpperCase().trim().replace(/\s/g, '');
            MAKHOA = MAKHOA.toUpperCase().trim().replace(/\s/g, '');
            TENLOP = TENLOP.trim();
            if (KHOAHOC) KHOAHOC = KHOAHOC.trim();

            const result = await classService.addLop({ MALOP, TENLOP, KHOAHOC, MAKHOA });

            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Lỗi khi thêm Lớp:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    updateLop: async (req, res) => {
        try {
            const { id } = req.params;
            let { TENLOP, KHOAHOC, MAKHOA } = req.body;

            const cleanId = id.toUpperCase().trim().replace(/\s/g, '');
            if (MAKHOA) MAKHOA = MAKHOA.toUpperCase().trim().replace(/\s/g, '');
            TENLOP = TENLOP.trim();
            if (KHOAHOC) KHOAHOC = KHOAHOC.trim();

            const result = await classService.updateLop(cleanId, { TENLOP, KHOAHOC, MAKHOA });

            if (result.success) {
                res.status(200).json(result);
            } else {
                const isNotFound = result.message.includes('Không tìm thấy');
                res.status(isNotFound ? 404 : 400).json(result);
            }
        } catch (error) {
            console.error('Lỗi khi sửa Lớp:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    deleteLop: async (req, res) => {
        try {
            const { id } = req.params;
            const cleanId = id.toUpperCase().trim().replace(/\s/g, '');
            const result = await classService.deleteLop(cleanId);

            if (result.success) {
                res.status(200).json(result);
            } else {
                const isNotFound = result.message.includes('Không tìm thấy');
                res.status(isNotFound ? 404 : 400).json(result);
            }
        } catch (error) {
            console.error('Lỗi khi xóa Lớp:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    }
};

module.exports = classController;
