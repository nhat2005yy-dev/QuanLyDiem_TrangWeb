const { sql } = require('../config/db');

const monHocController = {
    getAllMonHoc: async (req, res) => {
        try {
            const request = new sql.Request();
            const result = await request.query('SELECT * FROM MONHOC');
            res.status(200).json({ success: true, count: result.recordset.length, data: result.recordset });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách Môn học:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    addMonHoc: async (req, res) => {
        try {
            const { MAMH, TENMH, SOTINCHI_LT, SOTINCHI_TH } = req.body;
            if (!MAMH || !TENMH) {
                return res.status(400).json({ success: false, message: 'Thiếu mã môn học hoặc tên môn học' });
            }

            const request = new sql.Request();
            request.input('MAMH', sql.VarChar, MAMH);
            request.input('TENMH', sql.NVarChar, TENMH);
            request.input('SOTINCHI_LT', sql.Int, SOTINCHI_LT || 0);
            request.input('SOTINCHI_TH', sql.Int, SOTINCHI_TH || 0);

            const check = await request.query('SELECT 1 FROM MONHOC WHERE MAMH = @MAMH');
            if (check.recordset.length > 0) {
                return res.status(400).json({ success: false, message: 'Mã môn học đã tồn tại' });
            }

            // Dùng số tín chỉ chung nếu DB chỉ lưu STC (bắt lỗi trong Catch nếu table schema khác)
            // Cấu trúc chuẩn QLDSV HCMUTE / PTIT là SOTINCHI_LT, SOTINCHI_TH. 
            // Nếu bảng chỉ có cột STC, chúng ta sẽ linh hoạt sửa sau.
            await request.query(`
                INSERT INTO MONHOC (MAMH, TENMH, SOTINCHI_LT, SOTINCHI_TH) 
                VALUES (@MAMH, @TENMH, @SOTINCHI_LT, @SOTINCHI_TH)
            `);
            res.status(201).json({ success: true, message: 'Thêm Môn học thành công' });
        } catch (error) {
            console.error('Lỗi khi thêm Môn học:', error);
            res.status(500).json({ success: false, message: 'Lỗi server (Lưu ý: kiểm tra số lượng cột tương thích với CSDL)', error: error.message });
        }
    },

    updateMonHoc: async (req, res) => {
        try {
            const { id } = req.params;
            const { TENMH, SOTINCHI_LT, SOTINCHI_TH } = req.body;

            const request = new sql.Request();
            request.input('MAMH', sql.VarChar, id);
            request.input('TENMH', sql.NVarChar, TENMH);
            request.input('SOTINCHI_LT', sql.Int, SOTINCHI_LT);
            request.input('SOTINCHI_TH', sql.Int, SOTINCHI_TH);

            const result = await request.query(`
                UPDATE MONHOC 
                SET TENMH = @TENMH, SOTINCHI_LT = @SOTINCHI_LT, SOTINCHI_TH = @SOTINCHI_TH 
                WHERE MAMH = @MAMH
            `);

            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy Môn học' });
            }

            res.status(200).json({ success: true, message: 'Cập nhật Môn học thành công' });
        } catch (error) {
            console.error('Lỗi khi sửa Môn học:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    deleteMonHoc: async (req, res) => {
        try {
            const { id } = req.params;
            const request = new sql.Request();
            request.input('MAMH', sql.VarChar, id);

            const result = await request.query('DELETE FROM MONHOC WHERE MAMH = @MAMH');
            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy Môn học' });
            }

            res.status(200).json({ success: true, message: 'Xóa Môn học thành công' });
        } catch (error) {
            console.error('Lỗi khi xóa Môn học:', error);
            if (error.message.includes('REFERENCE constraint')) {
                return res.status(400).json({ success: false, message: 'Không thể xóa môn này do đã được sử dụng trong Lớp Tín Chỉ' });
            }
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    }
};

module.exports = monHocController;
