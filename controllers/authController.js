const { sql } = require('../config/db');
const jwt = require('jsonwebtoken');

const authController = {
    // API Đăng ký tài khoản
    // register: async (req, res) => {
    //     try {
    //         const { USERNAME, PASSWORD } = req.body;
    //         // Ép buộc role là Sinh viên cho đăng ký công khai
    //         const ROLE = 'SINHVIEN';

    //         if (!USERNAME || !PASSWORD) {
    //             return res.status(400).json({ success: false, message: 'Nhập thiếu thông tin' });
    //         }

    //         const request = new sql.Request();

    //         // 1. Kiểm tra bảng TAIKHOAN có chưa, nếu chưa có thì tự động tạo luôn (hỗ trợ tiện lợi)
    //         await request.query(`
    //             IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='TAIKHOAN' and xtype='U')
    //             CREATE TABLE TAIKHOAN (
    //                 USERNAME VARCHAR(50) PRIMARY KEY,
    //                 PASSWORD VARCHAR(100) NOT NULL,
    //                 ROLE VARCHAR(20) NOT NULL
    //             )
    //         `);

    //         // 2. Kiểm tra xem tài khoản đã tồn tại chưa
    //         request.input('USERNAME', USERNAME);
    //         request.input('PASSWORD', PASSWORD);
    //         request.input('ROLE', ROLE);

    //         const checkUser = await request.query(`SELECT 1 FROM TAIKHOAN WHERE USERNAME = @USERNAME`);
    //         if (checkUser.recordset.length > 0) {
    //             return res.status(400).json({ success: false, message: 'Tài khoản đã tồn tại!' });
    //         }

    //         // 3. Đăng ký tài khoản (Insert nguyên bản để dễ demo, thực tế nên mã hóa Hash)
    //         await request.query(`INSERT INTO TAIKHOAN (USERNAME, PASSWORD, ROLE) VALUES (@USERNAME, @PASSWORD, @ROLE)`);

    //         return res.status(200).json({ success: true, message: 'Đăng ký thành công!' });

    //     } 
    //     catch (error) {
    //         console.error('Error in register:', error);
    //         return res.status(500).json({ 
    //             success: false,
    //             message: error.message 
    //         });
    //     }
    // },

    // API Tạo tài khoản nội bộ (dành cho PGV/KHOA)
    registerInternal: async (req, res) => {
        try {
            const { USERNAME, PASSWORD, ROLE } = req.body;

            if (!USERNAME || !PASSWORD || !ROLE) {
                return res.status(400).json({ success: false, message: 'Nhập thiếu thông tin' });
            }

            const request = new sql.Request();

            await request.query(`
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='TAIKHOAN' and xtype='U')
                CREATE TABLE TAIKHOAN (
                    USERNAME VARCHAR(50) PRIMARY KEY,
                    PASSWORD VARCHAR(100) NOT NULL,
                    ROLE VARCHAR(20) NOT NULL
                )
            `);

            request.input('USERNAME', USERNAME);
            request.input('PASSWORD', PASSWORD);
            request.input('ROLE', ROLE);

            const checkUser = await request.query(`SELECT 1 FROM TAIKHOAN WHERE USERNAME = @USERNAME`);
            if (checkUser.recordset.length > 0) {
                return res.status(400).json({ success: false, message: 'Tài khoản đã tồn tại!' });
            }

            await request.query(`INSERT INTO TAIKHOAN (USERNAME, PASSWORD, ROLE) VALUES (@USERNAME, @PASSWORD, @ROLE)`);

            return res.status(200).json({ success: true, message: 'Tạo tài khoản thành công!' });

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

            const request = new sql.Request();
            request.input('USERNAME', USERNAME);
            request.input('PASSWORD', PASSWORD);

            // Truy xuất từ bảng TAIKHOAN duy nhất
            const query = `SELECT USERNAME, ROLE FROM TAIKHOAN WHERE USERNAME = @USERNAME AND PASSWORD = @PASSWORD`;
            const result = await request.query(query);

            if (result.recordset.length > 0) {
                // Đăng nhập thành công, trả về Role và token
                const user = result.recordset[0];
                
                // Tạo JWT token
                const token = jwt.sign(
                    { username: user.USERNAME, role: user.ROLE },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRES || '1d' }
                );

                return res.status(200).json({
                    success: true,
                    message: 'Đăng nhập thành công',
                    token: token,
                    data: {
                        username: user.USERNAME,
                        role: user.ROLE
                    }
                });
            } else {
                return res.status(401).json({ success: false, message: 'Sai tài khoản hoặc mật khẩu' });
            }
        } catch (error) {
            console.error('Error in login:', error);
            // Nếu lỗi do bảng TAIKHOAN chưa được tạo bao giờ (vì chưa đăng ký ai)
            if (error.message.includes("Invalid object name 'TAIKHOAN'")) {
                return res.status(401).json({ success: false, message: 'Chưa có tài khoản nào được đăng ký trong hệ thống' });
            }
            return res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = authController;
