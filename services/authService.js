const authRepository = require('../repositories/authRepository');
const jwt = require('jsonwebtoken');

const authService = {
    registerInternal: async (username, password, role) => {
        const result = await authRepository.registerInternal(username, password, role);
        if (result.status === 'SUCCESS') {
            return { success: true, message: 'Tạo tài khoản thành công!' };
        } else {
            return { success: false, message: result.status };
        }
    },

    login: async (username, password) => {
        const result = await authRepository.login(username, password);
        if (result.status === 'SUCCESS' && result.user) {
            const user = result.user;
            
            // Tạo JWT token
            const token = jwt.sign(
                { username: user.USERNAME, role: user.ROLE },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES || '1d' }
            );

            return {
                success: true,
                message: 'Đăng nhập thành công',
                token: token,
                data: {
                    username: user.USERNAME,
                    role: user.ROLE
                }
            };
        } else {
            return {
                success: false,
                message: result.status || 'Sai tài khoản hoặc mật khẩu'
            };
        }
    }
};

module.exports = authService;
