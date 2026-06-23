const monHocRepository = require('../repositories/monHocRepository');

const monHocService = {
    getAllMonHoc: async () => {
        return await monHocRepository.getAll();
    },

    addMonHoc: async (mhData) => {
        const payload = {
            MAMH: mhData.MAMH,
            TENMH: mhData.TENMH,
            SOTINCHI_LT: mhData.SOTINCHI_LT ? parseInt(mhData.SOTINCHI_LT) : 0,
            SOTINCHI_TH: mhData.SOTINCHI_TH ? parseInt(mhData.SOTINCHI_TH) : 0
        };
        const status = await monHocRepository.add(payload);
        if (status === 'SUCCESS') {
            return { success: true, message: 'Thêm Môn học thành công' };
        } else {
            return { success: false, message: status };
        }
    },

    updateMonHoc: async (id, mhData) => {
        const payload = {
            TENMH: mhData.TENMH,
            SOTINCHI_LT: mhData.SOTINCHI_LT !== undefined ? parseInt(mhData.SOTINCHI_LT) : undefined,
            SOTINCHI_TH: mhData.SOTINCHI_TH !== undefined ? parseInt(mhData.SOTINCHI_TH) : undefined
        };
        const status = await monHocRepository.update(id, payload);
        if (status === 'SUCCESS') {
            return { success: true, message: 'Cập nhật Môn học thành công' };
        } else {
            return { success: false, message: status };
        }
    },

    deleteMonHoc: async (id) => {
        try {
            const status = await monHocRepository.delete(id);
            if (status === 'SUCCESS') {
                return { success: true, message: 'Xóa Môn học thành công' };
            } else {
                return { success: false, message: status };
            }
        } catch (error) {
            if (error.message.includes('REFERENCE constraint')) {
                return { success: false, message: 'Không thể xóa môn này do đã được sử dụng trong Lớp Tín Chỉ' };
            }
            throw error;
        }
    }
};

module.exports = monHocService;
