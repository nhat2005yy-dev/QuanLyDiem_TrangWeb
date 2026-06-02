const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // 1. Lấy token từ header Authorization theo dạng "Bearer <token>"
    const bearerHeader = req.headers['authorization'];
    
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        
        // 2. Xác thực token
        jwt.verify(bearerToken, process.env.JWT_SECRET, (err, authData) => {
            if (err) {
                return res.status(403).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn (Forbidden)' });
            }
            
            // 3. Gắn thông tin giải mã (authData) vào req.user để các controller tiếp theo sử dụng
            req.user = authData;
            next();
        });
    } else {
        // Không tìm thấy token trong header
        return res.status(401).json({ success: false, message: 'Từ chối truy cập. Bạn cần truyền Token ở Header (Unauthorized)' });
    }
};

// Middleware kiểm tra quyền theo Role
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập chức năng này!' });
        }
        next();
    };
};

module.exports = {
    verifyToken,
    checkRole
};
