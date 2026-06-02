const { sql } = require('../config/db');

const classStudentController = {
    getClassStudents: async (req, res) => {
        try {
            // Bước dễ 1: Lấy MALTC từ đường dẫn
            const { MALTC } = req.query;

            if (!MALTC) {
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng cung cấp MALTC (VD: ?MALTC=1)"
                });
            }

            const request = new sql.Request();
            request.input('MALTC', MALTC);

            // Bước dễ 2: Viết câu truy vấn JOIN 2 bảng DANGKY và SINHVIEN
            const query = `
                SELECT 
                    SV.MASV, 
                    SV.HO, 
                    SV.TEN, 
                    SV.MALOP
                FROM DANGKY DK
                JOIN SINHVIEN SV ON DK.MASV = SV.MASV
                WHERE DK.MALTC = @MALTC
            `;

            const result = await request.query(query);

            res.status(200).json({
                success: true,
                count: result.recordset.length,
                data: result.recordset
            });

        } catch (error) {
            console.error('Error fetching class students:', error);
            res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy danh sách sinh viên của lớp tín chỉ",
                error: error.message
            });
        }
    }
};

module.exports = classStudentController;
