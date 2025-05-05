const logger= require('../utils/logger');
const sessionAuth= (req, res, next) => {
    // sessionda userıd var mı kontrol ediyoruz
    if(req.session && req.session.userId){
        logger.info(`Authenticated request from user ${req.session.userId}: ${req.method} ${req.url}`);
        next(); // oturum varsa bir sonraki middleware'e geçiyoruz
        return;
}
logger.warn(`Unauthenticated request: ${req.method} ${req.url}`);
    return res.status(401).json({message:'Unauthorized'}); // oturum yoksa 401 hata kodu döndürüyoruz
};
module.exports= sessionAuth; // session middleware'i dışa aktarıyoruz
