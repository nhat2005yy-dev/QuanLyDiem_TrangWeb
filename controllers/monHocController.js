const monHocService = require('../services/monHocService');

const monHocController = {
    getAllMonHoc: async (req, res) => {
        try {
            const data = await monHocService.getAllMonHoc();
            res.status(200).json({ success: true, count: data.length, data: data });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách Môn học:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    addMonHoc: async (req, res) => {
        try {
            let { MAMH, TENMH, SOTINCHI_LT, SOTINCHI_TH } = req.body;
            if (!MAMH || !TENMH) {
                return res.status(400).json({ success: false, message: 'Thiếu mã môn học hoặc tên môn học' });
            }

            MAMH = MAMH.toUpperCase().trim().replace(/\s/g, '');
            TENMH = TENMH.trim();

            const result = await monHocService.addMonHoc({ MAMH, TENMH, SOTINCHI_LT, SOTINCHI_TH });

            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Lỗi khi thêm Môn học:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    updateMonHoc: async (req, res) => {
        try {
            const { id } = req.params;
            let { TENMH, SOTINCHI_LT, SOTINCHI_TH } = req.body;

            const cleanId = id.toUpperCase().trim().replace(/\s/g, '');
            TENMH = TENMH.trim();

            const result = await monHocService.updateMonHoc(cleanId, { TENMH, SOTINCHI_LT, SOTINCHI_TH });

            if (result.success) {
                res.status(200).json(result);
            } else {
                const isNotFound = result.message.includes('Không tìm thấy');
                res.status(isNotFound ? 404 : 400).json(result);
            }
        } catch (error) {
            console.error('Lỗi khi sửa Môn học:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    deleteMonHoc: async (req, res) => {
        try {
            const { id } = req.params;
            const cleanId = id.toUpperCase().trim().replace(/\s/g, '');
            const result = await monHocService.deleteMonHoc(cleanId);

            if (result.success) {
                res.status(200).json(result);
            } else {
                const isNotFound = result.message.includes('Không tìm thấy');
                res.status(isNotFound ? 404 : 400).json(result);
            }
        } catch (error) {
            console.error('Lỗi khi xóa Môn học:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    }
};

module.exports = monHocController;
