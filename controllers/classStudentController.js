const classStudentService = require('../services/classStudentService');

const classStudentController = {
    getClassStudents: async (req, res) => {
        try {
            const { MALTC } = req.query;

            if (!MALTC) {
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng cung cấp MALTC (VD: ?MALTC=1)"
                });
            }

            const data = await classStudentService.getClassStudents(MALTC);

            res.status(200).json({
                success: true,
                count: data.length,
                data: data
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
