const registerRepository = require('../repositories/registerRepository');

const registerService = {
    registerClass: async (masv, maltc) => {
        // Ràng buộc thời gian: Chỉ được đăng ký lớp đang hoạt động
        const timeStatus = await registerRepository.getClassStatus(parseInt(maltc));
        if (!timeStatus) {
            return { success: false, message: 'Lớp tín chỉ không tồn tại!' };
        }
        if (timeStatus !== 'ACTIVE') {
            return { success: false, message: 'Lớp tín chỉ không trong trạng thái hoạt động (chưa mở hoặc đã kết thúc/hủy), không thể đăng ký!' };
        }

        const status = await registerRepository.registerClass(masv, parseInt(maltc));
        if (status === 'SUCCESS') {
            return { success: true, message: 'Đăng ký thành công!' };
        } else {
            return { success: false, message: status };
        }
    },

    cancelClass: async (masv, maltc) => {
        const status = await registerRepository.cancelClass(masv, parseInt(maltc));
        if (status === 'SUCCESS') {
            return { success: true, message: 'Hủy đăng ký thành công' };
        } else {
            return { success: false, message: status };
        }
    },

    getRegisteredClasses: async (masv, nienkhoa, hocky) => {
        return await registerRepository.getRegisteredClasses(masv, nienkhoa, parseInt(hocky));
    }
};

module.exports = registerService;
