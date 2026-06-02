const { sql } = require('../config/db');

const classController = {
    getClasses: async (req, res) => {
        try {
            // Nhận NIENKHOA và HOCKY từ query
            const { NIENKHOA, HOCKY, MAGV } = req.query;

            // Kiểm tra tham số
            if (!NIENKHOA || !HOCKY) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng cung cấp NIENKHOA và HOCKY trên URL (VD: ?NIENKHOA=2023-2024&HOCKY=1)'
                });
            }

            const request = new sql.Request();
            request.input('NIENKHOA', NIENKHOA);
            request.input('HOCKY', HOCKY);

            let query = `
                SELECT 
                    LTC.MALTC,
                    LTC.NIENKHOA,
                    LTC.HOCKY,
                    LTC.MAMH, 
                    MH.TENMH, 
                    LTC.NHOM, 
                    LTC.MAGV,
                    LTC.MAKHOA,
                    (GV.HO + ' ' + GV.TEN) AS HOTEN_GV, 
                    LTC.SOSVTOITHIEU,
                    LTC.HUYLOP
                FROM LOPTINCHI LTC
                JOIN MONHOC MH ON LTC.MAMH = MH.MAMH
                JOIN GIANGVIEN GV ON LTC.MAGV = GV.MAGV
                WHERE LTC.NIENKHOA = @NIENKHOA AND LTC.HOCKY = @HOCKY
            `;

            if (MAGV) {
                request.input('MAGV', MAGV);
                query += ` AND LTC.MAGV = @MAGV`;
            }

            const result = await request.query(query);

            res.status(200).json({
                success: true,
                count: result.recordset.length,
                data: result.recordset
            });

        } catch (error) {
            console.error('Error fetching classes:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy danh sách lớp tín chỉ',
                error: error.message
            });
        }
    },

    // Quản lý Lớp Tín Chỉ nâng cao (Thêm/Sửa/Xóa)
    addLopTinChi: async (req, res) => {
        try {
            const { NIENKHOA, HOCKY, MAMH, NHOM, MAGV, MAKHOA, SOSVTOITHIEU, HUYLOP } = req.body;
            
            if (!NIENKHOA || !HOCKY || !MAMH || !NHOM || !MAGV || !MAKHOA) {
                return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc để tạo Lớp tín chỉ' });
            }

            const request = new sql.Request();
            request.input('NIENKHOA', sql.VarChar, NIENKHOA);
            request.input('HOCKY', sql.Int, HOCKY);
            request.input('MAMH', sql.VarChar, MAMH);
            request.input('NHOM', sql.Int, NHOM);
            request.input('MAGV', sql.VarChar, MAGV);
            request.input('MAKHOA', sql.VarChar, MAKHOA);
            request.input('SOSVTOITHIEU', sql.Int, SOSVTOITHIEU || 10);
            request.input('HUYLOP', sql.Bit, HUYLOP === 'true' || HUYLOP === true || HUYLOP === 1 ? 1 : 0);

            // Bảng LOPTINCHI sinh viên nói MASV/MALTC thường dùng tự động tăng (Identity) cho MALTC.
            // Nên truyền các tham số, không cần MALTC.
            await request.query(`
                INSERT INTO LOPTINCHI (NIENKHOA, HOCKY, MAMH, NHOM, MAGV, MAKHOA, SOSVTOITHIEU, HUYLOP)
                VALUES (@NIENKHOA, @HOCKY, @MAMH, @NHOM, @MAGV, @MAKHOA, @SOSVTOITHIEU, @HUYLOP)
            `);
            
            res.status(201).json({ success: true, message: 'Tạo Lớp tín chỉ thành công' });
        } catch (error) {
            console.error('Lỗi khi thêm LTC:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    updateLopTinChi: async (req, res) => {
        try {
            const { id } = req.params; // MALTC
            const { NIENKHOA, HOCKY, MAMH, NHOM, MAGV, MAKHOA, SOSVTOITHIEU, HUYLOP } = req.body;

            const request = new sql.Request();
            request.input('MALTC', sql.Int, id);
            request.input('NIENKHOA', sql.VarChar, NIENKHOA);
            request.input('HOCKY', sql.Int, HOCKY);
            request.input('MAMH', sql.VarChar, MAMH);
            request.input('NHOM', sql.Int, NHOM);
            request.input('MAGV', sql.VarChar, MAGV);
            request.input('MAKHOA', sql.VarChar, MAKHOA);
            request.input('SOSVTOITHIEU', sql.Int, SOSVTOITHIEU);
            request.input('HUYLOP', sql.Bit, HUYLOP === 'true' || HUYLOP === true || HUYLOP === 1 ? 1 : 0);

            const result = await request.query(`
                UPDATE LOPTINCHI 
                SET NIENKHOA=@NIENKHOA, HOCKY=@HOCKY, MAMH=@MAMH, NHOM=@NHOM, 
                    MAGV=@MAGV, MAKHOA=@MAKHOA, SOSVTOITHIEU=@SOSVTOITHIEU, HUYLOP=@HUYLOP
                WHERE MALTC=@MALTC
            `);

            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy Lớp tín chỉ' });
            }
            res.status(200).json({ success: true, message: 'Cập nhật Lớp tín chỉ thành công' });
        } catch (error) {
            console.error('Lỗi khi sửa LTC:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    deleteLopTinChi: async (req, res) => {
        try {
            const { id } = req.params;
            const request = new sql.Request();
            request.input('MALTC', sql.Int, id);

            const result = await request.query('DELETE FROM LOPTINCHI WHERE MALTC = @MALTC');
            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy Lớp tín chỉ' });
            }
            res.status(200).json({ success: true, message: 'Xóa Lớp tín chỉ thành công' });
        } catch (error) {
            console.error('Lỗi khi xóa LTC:', error);
            res.status(500).json({ success: false, message: 'Không thể xóa Lớp tín chỉ này vì đã có dữ liệu ràng buộc' });
        }
    },

    // Quản lý bảng LOP
    getAllLop: async (req, res) => {
        try {
            const request = new sql.Request();
            const result = await request.query('SELECT MALOP, TENLOP, KHOAHOC, MAKHOA FROM LOP');
            res.status(200).json({ success: true, count: result.recordset.length, data: result.recordset });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách Lớp:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    addLop: async (req, res) => {
        try {
            const { MALOP, TENLOP, KHOAHOC, MAKHOA } = req.body;
            if (!MALOP || !TENLOP || !MAKHOA) {
                return res.status(400).json({ success: false, message: 'Thiếu thông tin lớp' });
            }

            const request = new sql.Request();
            request.input('MALOP', sql.VarChar, MALOP);
            request.input('TENLOP', sql.NVarChar, TENLOP);
            request.input('KHOAHOC', sql.VarChar, KHOAHOC);
            request.input('MAKHOA', sql.VarChar, MAKHOA);

            const check = await request.query('SELECT 1 FROM LOP WHERE MALOP = @MALOP');
            if (check.recordset.length > 0) {
                return res.status(400).json({ success: false, message: 'Mã lớp đã tồn tại' });
            }

            await request.query('INSERT INTO LOP (MALOP, TENLOP, KHOAHOC, MAKHOA) VALUES (@MALOP, @TENLOP, @KHOAHOC, @MAKHOA)');
            res.status(201).json({ success: true, message: 'Thêm Lớp thành công' });
        } catch (error) {
            console.error('Lỗi khi thêm Lớp:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    updateLop: async (req, res) => {
        try {
            const { id } = req.params;
            const { TENLOP, KHOAHOC, MAKHOA } = req.body;

            const request = new sql.Request();
            request.input('MALOP', sql.VarChar, id);
            request.input('TENLOP', sql.NVarChar, TENLOP);
            request.input('KHOAHOC', sql.VarChar, KHOAHOC);
            request.input('MAKHOA', sql.VarChar, MAKHOA);

            const result = await request.query('UPDATE LOP SET TENLOP = @TENLOP, KHOAHOC = @KHOAHOC, MAKHOA = @MAKHOA WHERE MALOP = @MALOP');
            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy Lớp cần sửa' });
            }

            res.status(200).json({ success: true, message: 'Cập nhật Lớp thành công' });
        } catch (error) {
            console.error('Lỗi khi sửa Lớp:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    deleteLop: async (req, res) => {
        try {
            const { id } = req.params;
            const request = new sql.Request();
            request.input('MALOP', sql.VarChar, id);

            const result = await request.query('DELETE FROM LOP WHERE MALOP = @MALOP');
            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy Lớp cần xóa' });
            }

            res.status(200).json({ success: true, message: 'Xóa Lớp thành công' });
        } catch (error) {
            console.error('Lỗi khi xóa Lớp:', error);
            if (error.message.includes('REFERENCE constraint')) {
                return res.status(400).json({ success: false, message: 'Không thể xóa lớp này do đã có dữ liệu liên quan (Sinh viên đang học)' });
            }
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    }
};

module.exports = classController;
