const { sql } = require('../config/db');

const studentController = {
    getStudents: async (req, res) => {
        try {
            // Tạo một request mới từ đối tượng sql
            const request = new sql.Request();
            
            // Câu lệnh truy vấn lấy sinh viên
            const query = `
                SELECT MASV, HO, TEN, MALOP 
                FROM SINHVIEN
            `;
            
            // Thực thi truy vấn
            const result = await request.query(query);
            
            // Trả về kết quả
            res.status(200).json({
                success: true,
                count: result.recordset.length,
                data: result.recordset
            });
        } catch (error) {
            console.error('Error fetching students:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy danh sách sinh viên',
                error: error.message
            });
        }
    },

    addStudent: async (req, res) => {
        try {
            const { MASV, HO, TEN, PHAI, DIACHI, NGAYSINH, MALOP, DANGHIHOC, PASSWORD } = req.body;
            if (!MASV || !HO || !TEN || !MALOP) {
                return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc (MASV, HO, TEN, MALOP)' });
            }

            const request = new sql.Request();
            request.input('MASV', sql.VarChar, MASV);
            request.input('HO', sql.NVarChar, HO);
            request.input('TEN', sql.NVarChar, TEN);
            request.input('PHAI', sql.Bit, PHAI === 'true' || PHAI === true || PHAI === 1 ? 1 : 0);
            request.input('DIACHI', sql.NVarChar, DIACHI);
            request.input('NGAYSINH', sql.Date, NGAYSINH);
            request.input('MALOP', sql.VarChar, MALOP);
            request.input('DANGHIHOC', sql.Bit, DANGHIHOC === 'true' || DANGHIHOC === true || DANGHIHOC === 1 ? 1 : 0);
            request.input('PASSWORD', sql.VarChar, PASSWORD || '123456');

            const check = await request.query('SELECT 1 FROM SINHVIEN WHERE MASV = @MASV');
            if (check.recordset.length > 0) {
                return res.status(400).json({ success: false, message: 'Mã sinh viên đã tồn tại' });
            }

            await request.query(`
                INSERT INTO SINHVIEN (MASV, HO, TEN, PHAI, DIACHI, NGAYSINH, MALOP, DANGHIHOC, PASSWORD) 
                VALUES (@MASV, @HO, @TEN, @PHAI, @DIACHI, @NGAYSINH, @MALOP, @DANGHIHOC, @PASSWORD)
            `);
            res.status(201).json({ success: true, message: 'Thêm Sinh viên thành công' });
        } catch (error) {
            console.error('Lỗi khi thêm Sinh viên:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    updateStudent: async (req, res) => {
        try {
            const { id } = req.params;
            const { HO, TEN, PHAI, DIACHI, NGAYSINH, MALOP, DANGHIHOC, PASSWORD } = req.body;

            const request = new sql.Request();
            request.input('MASV', sql.VarChar, id);
            request.input('HO', sql.NVarChar, HO);
            request.input('TEN', sql.NVarChar, TEN);
            request.input('PHAI', sql.Bit, PHAI === 'true' || PHAI === true || PHAI === 1 ? 1 : 0);
            request.input('DIACHI', sql.NVarChar, DIACHI);
            request.input('NGAYSINH', sql.Date, NGAYSINH);
            request.input('MALOP', sql.VarChar, MALOP);
            request.input('DANGHIHOC', sql.Bit, DANGHIHOC === 'true' || DANGHIHOC === true || DANGHIHOC === 1 ? 1 : 0);
            request.input('PASSWORD', sql.VarChar, PASSWORD);

            let query = `
                UPDATE SINHVIEN 
                SET HO = @HO, TEN = @TEN, PHAI = @PHAI, DIACHI = @DIACHI, NGAYSINH = @NGAYSINH, MALOP = @MALOP, DANGHIHOC = @DANGHIHOC
            `;
            if (PASSWORD) {
                query += `, PASSWORD = @PASSWORD `;
            }
            query += ` WHERE MASV = @MASV`;

            const result = await request.query(query);
            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy Sinh viên cần sửa' });
            }

            res.status(200).json({ success: true, message: 'Cập nhật Sinh viên thành công' });
        } catch (error) {
            console.error('Lỗi khi sửa Sinh viên:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    deleteStudent: async (req, res) => {
        try {
            const { id } = req.params;
            const request = new sql.Request();
            request.input('MASV', sql.VarChar, id);

            const result = await request.query('DELETE FROM SINHVIEN WHERE MASV = @MASV');
            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy Sinh viên cần xóa' });
            }

            res.status(200).json({ success: true, message: 'Xóa Sinh viên thành công' });
        } catch (error) {
            console.error('Lỗi khi xóa Sinh viên:', error);
            if (error.message.includes('REFERENCE constraint')) {
                return res.status(400).json({ success: false, message: 'Không thể xóa sinh viên này do có điểm hoặc tín chỉ liên quan' });
            }
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    }
};

module.exports = studentController;
