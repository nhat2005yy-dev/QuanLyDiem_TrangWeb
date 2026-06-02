const { sql } = require('../config/db');

const giangVienController = {
    getAllGiangVien: async (req, res) => {
        try {
            const request = new sql.Request();
            const result = await request.query('SELECT MAGV, HO, TEN, HOCVI, HOCHAM, CHUYENMON, MAKHOA FROM GIANGVIEN');
            res.status(200).json({ success: true, count: result.recordset.length, data: result.recordset });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách Giảng viên:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    addGiangVien: async (req, res) => {
        try {
            const { MAGV, HO, TEN, HOCVI, HOCHAM, CHUYENMON, MAKHOA } = req.body;
            if (!MAGV || !HO || !TEN || !MAKHOA) {
                return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc (MAGV, HO, TEN, MAKHOA)' });
            }

            const request = new sql.Request();
            request.input('MAGV', sql.VarChar, MAGV);
            request.input('HO', sql.NVarChar, HO);
            request.input('TEN', sql.NVarChar, TEN);
            request.input('HOCVI', sql.NVarChar, HOCVI || null);
            request.input('HOCHAM', sql.NVarChar, HOCHAM || null);
            request.input('CHUYENMON', sql.NVarChar, CHUYENMON || null);
            request.input('MAKHOA', sql.VarChar, MAKHOA);

            const check = await request.query('SELECT 1 FROM GIANGVIEN WHERE MAGV = @MAGV');
            if (check.recordset.length > 0) {
                return res.status(400).json({ success: false, message: 'Mã giảng viên đã tồn tại' });
            }

            await request.query(`
                INSERT INTO GIANGVIEN (MAGV, HO, TEN, HOCVI, HOCHAM, CHUYENMON, MAKHOA) 
                VALUES (@MAGV, @HO, @TEN, @HOCVI, @HOCHAM, @CHUYENMON, @MAKHOA)
            `);
            res.status(201).json({ success: true, message: 'Thêm Giảng viên thành công' });
        } catch (error) {
            console.error('Lỗi khi thêm Giảng viên:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    updateGiangVien: async (req, res) => {
        try {
            const { id } = req.params;
            const { HO, TEN, HOCVI, HOCHAM, CHUYENMON, MAKHOA } = req.body;

            const request = new sql.Request();
            request.input('MAGV', sql.VarChar, id);
            request.input('HO', sql.NVarChar, HO);
            request.input('TEN', sql.NVarChar, TEN);
            request.input('HOCVI', sql.NVarChar, HOCVI || null);
            request.input('HOCHAM', sql.NVarChar, HOCHAM || null);
            request.input('CHUYENMON', sql.NVarChar, CHUYENMON || null);
            request.input('MAKHOA', sql.VarChar, MAKHOA);

            const result = await request.query(`
                UPDATE GIANGVIEN 
                SET HO = @HO, TEN = @TEN, HOCVI = @HOCVI, HOCHAM = @HOCHAM, 
                    CHUYENMON = @CHUYENMON, MAKHOA = @MAKHOA 
                WHERE MAGV = @MAGV
            `);

            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy Giảng viên' });
            }

            res.status(200).json({ success: true, message: 'Cập nhật Giảng viên thành công' });
        } catch (error) {
            console.error('Lỗi khi sửa Giảng viên:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    deleteGiangVien: async (req, res) => {
        try {
            const { id } = req.params;
            const request = new sql.Request();
            request.input('MAGV', sql.VarChar, id);

            const result = await request.query('DELETE FROM GIANGVIEN WHERE MAGV = @MAGV');
            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy Giảng viên' });
            }

            res.status(200).json({ success: true, message: 'Xóa Giảng viên thành công' });
        } catch (error) {
            console.error('Lỗi khi xóa Giảng viên:', error);
            if (error.message.includes('REFERENCE constraint')) {
                return res.status(400).json({ success: false, message: 'Không thể xóa giảng viên này do đã phân công dạy Lớp tín chỉ' });
            }
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    }
};

module.exports = giangVienController;
