const khoaService = require('../services/khoaService');

const khoaController = {
    getAllKhoa: async (req, res) => {
        try {
            const data = await khoaService.getAllKhoa();
            res.status(200).json({ success: true, count: data.length, data: data });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách Khoa:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    addKhoa: async (req, res) => {
        try {
            let { MAKHOA, TENKHOA } = req.body;
            if (!MAKHOA || !TENKHOA) {
                return res.status(400).json({ success: false, message: 'Thiếu mã khoa hoặc tên khoa' });
            }

            MAKHOA = MAKHOA.toUpperCase().trim().replace(/\s/g, '');
            TENKHOA = TENKHOA.trim();

            const result = await khoaService.addKhoa({ MAKHOA, TENKHOA });

            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Lỗi khi thêm Khoa:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    updateKhoa: async (req, res) => {
        try {
            const { id } = req.params; // MAKHOA
            let { TENKHOA } = req.body;

            if (!TENKHOA) {
                return res.status(400).json({ success: false, message: 'Thiếu tên khoa' });
            }

            const cleanId = id.toUpperCase().trim().replace(/\s/g, '');
            TENKHOA = TENKHOA.trim();

            const result = await khoaService.updateKhoa(cleanId, { TENKHOA });

            if (result.success) {
                res.status(200).json(result);
            } else {
                const isNotFound = result.message.includes('Không tìm thấy');
                res.status(isNotFound ? 404 : 400).json(result);
            }
        } catch (error) {
            console.error('Lỗi khi sửa Khoa:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    deleteKhoa: async (req, res) => {
        try {
            const { id } = req.params;
            const cleanId = id.toUpperCase().trim().replace(/\s/g, '');
            const result = await khoaService.deleteKhoa(cleanId);

            if (result.success) {
                res.status(200).json(result);
            } else {
                const isNotFound = result.message.includes('Không tìm thấy');
                res.status(isNotFound ? 404 : 400).json(result);
            }
        } catch (error) {
            console.error('Lỗi khi xóa Khoa:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    }
};

module.exports = khoaController;
