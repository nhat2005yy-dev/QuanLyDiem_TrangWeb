const authService = require('../services/authService');

const authController = {
    // API Tạo tài khoản nội bộ (dành cho PGV/KHOA)
    registerInternal: async (req, res) => {
        try {
            const { USERNAME, PASSWORD, ROLE } = req.body;

            if (!USERNAME || !PASSWORD || !ROLE) {
                return res.status(400).json({ success: false, message: 'Nhập thiếu thông tin' });
            }

            // Ràng buộc bảo mật: KHOA chỉ được tạo tài khoản KHOA
            if (req.user && req.user.role === 'KHOA' && ROLE !== 'KHOA') {
                return res.status(403).json({ success: false, message: 'Tài khoản Khoa chỉ có quyền tạo tài khoản thuộc nhóm KHOA!' });
            }

            const result = await authService.registerInternal(USERNAME, PASSWORD, ROLE);

            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(400).json(result);
            }
        } 
        catch (error) {
            console.error('Error in registerInternal:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    // API Đăng nhập
    login: async (req, res) => {
        try {
            const { USERNAME, PASSWORD } = req.body;

            if (!USERNAME || !PASSWORD) {
                return res.status(400).json({ success: false, message: 'Vui lòng nhập tài khoản và mật khẩu' });
            }

            const result = await authService.login(USERNAME, PASSWORD);

            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(401).json(result);
            }
        } catch (error) {
            console.error('Error in login:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = authController;
