const giangVienRepository = require('../repositories/giangVienRepository');

const giangVienService = {
    getAllGiangVien: async () => {
        return await giangVienRepository.getAll();
    },

    getNextId: async () => {
        return await giangVienRepository.getNextId();
    },

    addGiangVien: async (gvData) => {
        const result = await giangVienRepository.add(gvData);
        if (result.status === 'SUCCESS') {
            return { success: true, message: 'Thêm Giảng viên thành công', magv: result.magv };
        } else {
            return { success: false, message: result.status };
        }
    },

    updateGiangVien: async (id, gvData) => {
        const status = await giangVienRepository.update(id, gvData);
        if (status === 'SUCCESS') {
            return { success: true, message: 'Cập nhật Giảng viên thành công' };
        } else {
            return { success: false, message: status };
        }
    },

    deleteGiangVien: async (id) => {
        const status = await giangVienRepository.delete(id);
        if (status === 'SUCCESS') {
            return { success: true, message: 'Xóa Giảng viên thành công' };
        } else {
            return { success: false, message: status };
        }
    }
};

module.exports = giangVienService;
