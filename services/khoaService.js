const khoaRepository = require('../repositories/khoaRepository');

const khoaService = {
    getAllKhoa: async () => {
        return await khoaRepository.getAll();
    },

    addKhoa: async (khoaData) => {
        const status = await khoaRepository.add(khoaData);
        if (status === 'SUCCESS') {
            return { success: true, message: 'Thêm Khoa thành công' };
        } else {
            return { success: false, message: status };
        }
    },

    updateKhoa: async (id, khoaData) => {
        const status = await khoaRepository.update(id, khoaData);
        if (status === 'SUCCESS') {
            return { success: true, message: 'Cập nhật Khoa thành công' };
        } else {
            return { success: false, message: status };
        }
    },

    deleteKhoa: async (id) => {
        try {
            const status = await khoaRepository.delete(id);
            if (status === 'SUCCESS') {
                return { success: true, message: 'Xóa Khoa thành công' };
            } else {
                return { success: false, message: status };
            }
        } catch (error) {
            if (error.message.includes('REFERENCE constraint')) {
                return { success: false, message: 'Không thể xóa khoa này do đã có dữ liệu liên quan' };
            }
            throw error;
        }
    }
};

module.exports = khoaService;
