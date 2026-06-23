const registerService = require('../services/registerService');

const registerController = {
    registerClass: async (req, res) => {
        try {
            const { MASV, MALTC } = req.body;

            if (!MASV || !MALTC) {
                return res.status(400).json({ message: "Thiếu MASV hoặc MALTC" });
            }

            const result = await registerService.registerClass(MASV, MALTC);

            if (result.success) {
                return res.status(200).json({ message: "Register success" });
            } else {
                return res.status(400).json({ message: result.message });
            }

        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    cancelClass: async (req, res) => {
        try {
            const MASV = (req.body && req.body.MASV) || req.query.MASV;
            const MALTC = (req.body && req.body.MALTC) || req.query.MALTC;

            if (!MASV || !MALTC) {
                return res.status(400).json({ message: "Thiếu MASV hoặc MALTC" });
            }

            const result = await registerService.cancelClass(MASV, MALTC);

            if (result.success) {
                return res.status(200).json({ message: "Hủy đăng ký thành công" });
            } else {
                return res.status(400).json({ message: result.message });
            }

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

            const data = await registerService.getRegisteredClasses(MASV, NIENKHOA, HOCKY);

            return res.status(200).json({
                success: true,
                data: data
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

module.exports = registerController;
