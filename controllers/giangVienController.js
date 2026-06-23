const giangVienService = require('../services/giangVienService');

const giangVienController = {
    getAllGiangVien: async (req, res) => {
        try {
            const data = await giangVienService.getAllGiangVien();
            res.status(200).json({ success: true, count: data.length, data: data });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách Giảng viên:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    getNextId: async (req, res) => {
        try {
            const nextId = await giangVienService.getNextId();
            res.status(200).json({ success: true, magv: nextId });
        } catch (error) {
            console.error('Lỗi khi lấy mã giảng viên tiếp theo:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    addGiangVien: async (req, res) => {
        try {
            const { HO, TEN, HOCVI, HOCHAM, CHUYENMON, MAKHOA } = req.body;
            if (!HO || !TEN || !MAKHOA) {
                return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc (HO, TEN, MAKHOA)' });
            }

            const result = await giangVienService.addGiangVien({ HO, TEN, HOCVI, HOCHAM, CHUYENMON, MAKHOA });

            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Lỗi khi thêm Giảng viên:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    updateGiangVien: async (req, res) => {
        try {
            const { id } = req.params;
            const { HO, TEN, HOCVI, HOCHAM, CHUYENMON, MAKHOA } = req.body;

            const result = await giangVienService.updateGiangVien(id, { HO, TEN, HOCVI, HOCHAM, CHUYENMON, MAKHOA });

            if (result.success) {
                res.status(200).json(result);
            } else {
                const isNotFound = result.message.includes('Không tìm thấy');
                res.status(isNotFound ? 404 : 400).json(result);
            }
        } catch (error) {
            console.error('Lỗi khi sửa Giảng viên:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    deleteGiangVien: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await giangVienService.deleteGiangVien(id);

            if (result.success) {
                res.status(200).json(result);
            } else {
                const isNotFound = result.message.includes('Không tìm thấy');
                res.status(isNotFound ? 404 : 400).json(result);
            }
        } catch (error) {
            console.error('Lỗi khi xóa Giảng viên:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    }
};

module.exports = giangVienController;
