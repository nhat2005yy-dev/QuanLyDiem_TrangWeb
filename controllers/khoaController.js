aconst { sql } = require('../config/db');

const khoaController = {
    getAllKhoa: async (req, res) => {
        try {
            const request = new sql.Request();
            const result = await request.query('SELECT MAKHOA, TENKHOA FROM KHOA');
            res.status(200).json({ success: true, count: result.recordset.length, data: result.recordset });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách Khoa:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    addKhoa: async (req, res) => {
        try {
            const { MAKHOA, TENKHOA } = req.body;
            if (!MAKHOA || !TENKHOA) {
                return res.status(400).json({ success: false, message: 'Thiếu mã khoa hoặc tên khoa' });
            }

            const request = new sql.Request();
            request.input('MAKHOA', sql.VarChar, MAKHOA);
            request.input('TENKHOA', sql.NVarChar, TENKHOA);
            
            // Check if exists
            const check = await request.query('SELECT 1 FROM KHOA WHERE MAKHOA = @MAKHOA');
            if (check.recordset.length > 0) {
                return res.status(400).json({ success: false, message: 'Mã khoa đã tồn tại' });
            }

            await request.query('INSERT INTO KHOA (MAKHOA, TENKHOA) VALUES (@MAKHOA, @TENKHOA)');
            res.status(201).json({ success: true, message: 'Thêm Khoa thành công' });
        } catch (error) {
            console.error('Lỗi khi thêm Khoa:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    updateKhoa: async (req, res) => {
        try {
            const { id } = req.params; // MAKHOA
            const { TENKHOA } = req.body;

            if (!TENKHOA) {
                return res.status(400).json({ success: false, message: 'Thiếu tên khoa' });
            }

            const request = new sql.Request();
            request.input('MAKHOA', sql.VarChar, id);
            request.input('TENKHOA', sql.NVarChar, TENKHOA);

            const result = await request.query('UPDATE KHOA SET TENKHOA = @TENKHOA WHERE MAKHOA = @MAKHOA');
            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy Khoa cần sửa' });
            }

            res.status(200).json({ success: true, message: 'Cập nhật Khoa thành công' });
        } catch (error) {
            console.error('Lỗi khi sửa Khoa:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    deleteKhoa: async (req, res) => {
        try {
            const { id } = req.params;
            const request = new sql.Request();
            request.input('MAKHOA', sql.VarChar, id);

            // Xóa (Lưu ý: Thực tế nếu Khoa đang được dùng trong Lớp thì sẽ lỗi Foreign Key)
            const result = await request.query('DELETE FROM KHOA WHERE MAKHOA = @MAKHOA');
            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy Khoa cần xóa' });
            }

            res.status(200).json({ success: true, message: 'Xóa Khoa thành công' });
        } catch (error) {
            console.error('Lỗi khi xóa Khoa:', error);
            if (error.message.includes('REFERENCE constraint')) {
                return res.status(400).json({ success: false, message: 'Không thể xóa khoa này do đã có dữ liệu liên quan' });
            }
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    }
};

module.exports = khoaController;
