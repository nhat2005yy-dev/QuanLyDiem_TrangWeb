const { sql } = require('../config/db');

const registerController = {
    registerClass: async (req, res) => {
        try {
            const { MASV, MALTC } = req.body;

            if (!MASV || !MALTC) {
                return res.status(400).json({ message: "Thiếu MASV hoặc MALTC" });
            }

            const request = new sql.Request();
            request.input('MASV', MASV);
            request.input('MALTC', MALTC);

            // 1. Lấy thông tin môn học, học kỳ, niên khóa của lớp tín chỉ đang muốn đăng ký
            const ltcInfo = await request.query(`SELECT MAMH, HOCKY, NIENKHOA FROM LOPTINCHI WHERE MALTC = @MALTC`);
            if (ltcInfo.recordset.length === 0) {
                return res.status(404).json({ message: "Lớp tín chỉ không tồn tại" });
            }
            const { MAMH, HOCKY, NIENKHOA } = ltcInfo.recordset[0];
            
            request.input('MAMH', MAMH);
            request.input('HOCKY', HOCKY);
            request.input('NIENKHOA', NIENKHOA);

            // 2. Kiểm tra sinh viên đã đăng ký lớp nào có cùng MAMH trong cùng HOCKY, NIENKHOA chưa
            const checkQuery = `
                SELECT 1 
                FROM DANGKY DK
                JOIN LOPTINCHI LTC ON DK.MALTC = LTC.MALTC
                WHERE DK.MASV = @MASV 
                  AND LTC.MAMH = @MAMH 
                  AND LTC.HOCKY = @HOCKY 
                  AND LTC.NIENKHOA = @NIENKHOA
            `;
            const checkResult = await request.query(checkQuery);

            if (checkResult.recordset.length > 0) {
                return res.status(400).json({ message: "Bạn đã đăng ký môn học này trong học kỳ rồi" });
            }

            const insertQuery = `INSERT INTO DANGKY (MASV, MALTC) VALUES (@MASV, @MALTC)`;
            await request.query(insertQuery);

            return res.status(200).json({ message: "Register success" });

        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    cancelClass: async (req, res) => {
        try {
            // Hỗ trợ cả query và body
            const MASV = req.body.MASV || req.query.MASV;
            const MALTC = req.body.MALTC || req.query.MALTC;

            if (!MASV || !MALTC) {
                return res.status(400).json({ message: "Thiếu MASV hoặc MALTC" });
            }

            const request = new sql.Request();
            request.input('MASV', MASV);
            request.input('MALTC', MALTC);

            const deleteQuery = `DELETE FROM DANGKY WHERE MASV = @MASV AND MALTC = @MALTC`;
            const result = await request.query(deleteQuery);

            if (result.rowsAffected[0] === 0) {
                return res.status(400).json({ message: "Không tìm thấy dữ liệu đăng ký tương ứng" });
            }

            return res.status(200).json({ message: "Hủy đăng ký thành công" });

        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    getRegisteredClasses: async (req, res) => {
        try {
            const { MASV, NIENKHOA, HOCKY } = req.query;

            if (!MASV || !NIENKHOA || !HOCKY) {
                return res.status(400).json({ message: "Cần truyền MASV, NIENKHOA và HOCKY" });
            }

            const request = new sql.Request();
            request.input('MASV', MASV);
            request.input('NIENKHOA', NIENKHOA);
            request.input('HOCKY', HOCKY);

            const query = `
                SELECT 
                    LTC.MALTC, 
                    LTC.MAMH, 
                    MH.TENMH, 
                    LTC.NHOM, 
                    LTC.SOSVTOITHIEU,
                    (GV.HO + ' ' + GV.TEN) AS HOTEN_GV
                FROM DANGKY DK
                JOIN LOPTINCHI LTC ON DK.MALTC = LTC.MALTC
                JOIN MONHOC MH ON LTC.MAMH = MH.MAMH
                JOIN GIANGVIEN GV ON LTC.MAGV = GV.MAGV
                WHERE DK.MASV = @MASV 
                  AND LTC.NIENKHOA = @NIENKHOA 
                  AND LTC.HOCKY = @HOCKY
                  AND LTC.HUYLOP = 0
            `;

            const result = await request.query(query);

            return res.status(200).json({
                success: true,
                data: result.recordset
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

module.exports = registerController;
