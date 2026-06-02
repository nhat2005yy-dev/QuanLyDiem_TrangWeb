const { sql } = require('../config/db');

const gradeController = {
    getGrades: async (req, res) => {
        try {
            // Lấy MASV từ query string (?MASV=...)
            const { MASV } = req.query;

            // Kiểm tra MASV có được gửi lên không
            if (!MASV) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng cung cấp MASV (ví dụ: /api/grades?MASV=N19DCCN001)'
                });
            }

            const request = new sql.Request();
            // Truyền tham số để tránh SQL Injection
            request.input('MASV', sql.VarChar, MASV);

            // Câu truy vấn join DANGKY, LOPTINCHI, MONHOC và tính điểm tổng
            // Giả định trọng số: CC 10%, GK 30%, CK 60%
            const query = `
                SELECT 
                    MH.TENMH, 
                    DK.DIEM_CC, 
                    DK.DIEM_GK, 
                    DK.DIEM_CK,
                    ROUND((ISNULL(DK.DIEM_CC, 0) * 0.1 + ISNULL(DK.DIEM_GK, 0) * 0.3 + ISNULL(DK.DIEM_CK, 0) * 0.6), 2) AS DIEM_TONG
                FROM DANGKY DK
                JOIN LOPTINCHI LTC ON DK.MALTC = LTC.MALTC
                JOIN MONHOC MH ON LTC.MAMH = MH.MAMH
                WHERE DK.MASV = @MASV
            `;

            const result = await request.query(query);

            res.status(200).json({
                success: true,
                count: result.recordset.length,
                data: result.recordset
            });

        } catch (error) {
            console.error('Error fetching grades:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy kết quả điểm sinh viên',
                error: error.message
            });
        }
    },

    updateGrades: async (req, res) => {
        try {
            // Bước dễ nhất: lấy dữ liệu điểm từ body request
            const { MASV, MALTC, DIEM_CC, DIEM_GK, DIEM_CK } = req.body;

            // Kiểm tra thông tin đầu vào
            if (!MASV || !MALTC) {
                return res.status(400).json({ message: "Vui lòng truyền đủ MASV và MALTC" });
            }

            const request = new sql.Request();
            request.input('MASV', MASV);
            request.input('MALTC', MALTC);
            request.input('DIEM_CC', DIEM_CC);
            request.input('DIEM_GK', DIEM_GK);
            request.input('DIEM_CK', DIEM_CK);

            // Cập nhật điểm vào bảng DANGKY
            const updateQuery = `
                UPDATE DANGKY
                SET DIEM_CC = @DIEM_CC,
                    DIEM_GK = @DIEM_GK,
                    DIEM_CK = @DIEM_CK
                WHERE MASV = @MASV AND MALTC = @MALTC
            `;
            
            await request.query(updateQuery);

            return res.status(200).json({ message: "Update success" });
            
        } catch (error) {
            console.error('Error updating grades:', error);
            res.status(500).json({ message: error.message });
        }
    },

    updateBulkGrades: async (req, res) => {
        try {
            const gradesArray = req.body; // Expect an array of objects
            if (!Array.isArray(gradesArray) || gradesArray.length === 0) {
                return res.status(400).json({ success: false, message: "Dữ liệu không hợp lệ" });
            }

            const request = new sql.Request();

            // Using transaction for bulk update to ensure atomicity
            const transaction = new sql.Transaction();
            await transaction.begin();
            
            try {
                for (const grade of gradesArray) {
                    const reqTx = new sql.Request(transaction);
                    reqTx.input('MASV', sql.VarChar, grade.MASV);
                    reqTx.input('MALTC', sql.Int, grade.MALTC);
                    reqTx.input('DIEM_CC', sql.Float, grade.DIEM_CC);
                    reqTx.input('DIEM_GK', sql.Float, grade.DIEM_GK);
                    reqTx.input('DIEM_CK', sql.Float, grade.DIEM_CK);

                    await reqTx.query(`
                        UPDATE DANGKY
                        SET DIEM_CC = @DIEM_CC,
                            DIEM_GK = @DIEM_GK,
                            DIEM_CK = @DIEM_CK
                        WHERE MASV = @MASV AND MALTC = @MALTC
                    `);
                }
                
                await transaction.commit();
                return res.status(200).json({ success: true, message: "Cập nhật điểm hàng loạt thành công!" });
            } catch (txError) {
                await transaction.rollback();
                throw txError;
            }

        } catch (error) {
            console.error('Error in bulk update grades:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getStudentsByLTC: async (req, res) => {
        try {
            const { MALTC } = req.query;

            if (!MALTC) {
                return res.status(400).json({ success: false, message: 'Vui lòng cung cấp MALTC' });
            }

            const request = new sql.Request();
            request.input('MALTC', sql.Int, MALTC);

            const query = `
                SELECT 
                    SV.MASV, 
                    (SV.HO + ' ' + SV.TEN) AS HOTEN_SV,
                    SV.MALOP,
                    DK.DIEM_CC, 
                    DK.DIEM_GK, 
                    DK.DIEM_CK,
                    ROUND((ISNULL(DK.DIEM_CC, 0) * 0.1 + ISNULL(DK.DIEM_GK, 0) * 0.3 + ISNULL(DK.DIEM_CK, 0) * 0.6), 2) AS DIEM_TONG
                FROM DANGKY DK
                JOIN SINHVIEN SV ON DK.MASV = SV.MASV
                WHERE DK.MALTC = @MALTC
                ORDER BY SV.TEN ASC, SV.HO ASC
            `;

            const result = await request.query(query);

            res.status(200).json({
                success: true,
                count: result.recordset.length,
                data: result.recordset
            });
        } catch (error) {
            console.error('Error fetching students by class:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    }
};

module.exports = gradeController;
