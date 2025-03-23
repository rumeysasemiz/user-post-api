const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const authMiddleware =  async (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) {
        return res.status(401).json({ message: "Yetkisiz erişim token gerekli" });

    }
    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        // Kullanıcının hala var olduğunu kontrol et
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "Kullanıcı bulunamadı veya silinmiş" });
        }
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Geçersiz veya süresi dolmuş token  token" });

    }

};
module.exports = authMiddleware;