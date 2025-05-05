const userService = require("../services/userServices");
const logger=require('../utils/logger');
// kullanıcı kayıt ediyoruz 
const registerUser = async (req, res) => {
    try {
        const result = await userService.registerUser(req.body.username, req.body.email, req.body.password, req.body.role);
        logger.info(`User registered: ${result.userId}`);
        res.status(201).json(result);
    } catch (error) {
        logger.error(`Error registering user: ${error.message}`);
        res.status(400).json({ message: error.message });
    }
};
const loginUser = async (req, res) => {
    try {
        const result = await userService.loginUser(req.body.email, req.body.password);
        logger.info(`User logged in: ${result.userId}`);
        // Session'a kullanıcı bilgilerini kaydetme
        req.session.userId = result.userId;
        req.session.email = req.body.email;
        
        res.json(result);
    } catch (error) {
        logger.error(`Error logging in user: ${error.message}`);
        res.status(400).json({ message: error.message });

    }
};
const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        logger.info(`Retrieved ${users.length} users`);

        res.status(200).json(users);
    } catch (error) {
        logger.error(`Error retrieving all users: ${error.message}`);
        res.status(500).json({ message: error.message });

    }
};
const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await userService.getUserById(userId);
        logger.info(`Retrieved user: ${userId}`);

        res.status(200).json(user);
    } catch (error) {
        logger.error(`Error retrieving user ${req.params.id}: ${error.message}`);
        if (error.message === "User not found") {
            res.status(404).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: error.message });
        }

    }

};
const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const updateData = req.body;
        const updatedUser = await userService.updateUser(userId, updateData);
        logger.info(`User updated: ${userId}`);

        res.status(200).json({
            message: "User updated",
            user: updatedUser,
        });
    } catch (error) {
        logger.error(`Error updating user ${req.params.id}: ${error.message}`);
        if (error.message === "User not found") {
            res.status(404).json({ message: error.message });
        } else if (error.message === "This email already exists" || error.message === "This username already exists") {
            res.status(400).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: error.message });
        }
    };
}
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const result = await userService.deleteUser(userId);
        logger.info(`User deleted: ${userId}, with ${result.deletedPostsCount} associated posts`);

        res.status(200).json({
            success: true,
            message: "User and associated posts deleted successfully",
            data: {
                deletedUser: result.user,
                deletedPostsCount: result.deletedPostsCount
            }
        });
    } catch (error) {
        logger.error(`Error deleting user ${req.params.id}: ${error.message}`);
        if (error.message === "User not found") {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};
const logoutUser = async(req, res) => {
    try {
        const userId = req.session.userId;
        // session'dan kullanıcı bilgilerini sil
        req.session.destroy((err)=>{
            if(err){
                logger.error(`Error logging out user ${userId}: ${err.message}`);
                return res.status(500).json({message:'Internal server error'});

            };
            logger.info(`User logged out: ${userId}`);
            res.clearCookie('user_sid'); // cookie'yi temizle
            res.json({message:'User logged out successfully'}); // kullanıcıyı çıkış yaptık
        })
    } catch (error) {
        logger.error(`Error logging out user ${req.session.userId}: ${error.message}`);
        res.status(500).json({ message: error.message });
        
    }
 };
 // session durumunu kontrol etmek için fonksiyon ekleyin 
const sessionStatus= async(req,res)=>{
    if(req.session && req.session.userId){
        try {
            const user= await userService.getUserById(req.session.userId);
            res.json({
                isAuthenticated: true,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            logger.error(`Error in sessionStatus: ${error.message}`);
            req.session.destroy();
            res.status(401).json({
                isAuthenticated: false,
                message: "geçersiz oturum",
            });
            
        }
      
}else{
    res.json({
        isAuthenticated: false,
        message: "oturum açık değil",
    });
}
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    sessionStatus,
};
