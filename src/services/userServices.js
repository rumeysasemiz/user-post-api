const User = require("../models/userModel");
const Post = require("../models/postModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const logger = require("../utils/logger");  
const { default: mongoose } = require("mongoose");
const { elasticClient } = require("../config/elastic_search_config");
const redisClient = require("../config/redisClient");
const { logoutUser } = require("../controllers/userController");

const registerUser = async (username, email, password, role) => {
    try {
        const existingUser = await User.findOne({ email }); // email adresi ile kayıtlı kullanıcı var mı kontrol ediyoruz.
        if (existingUser) throw new Error("This email already exists"); // eğer varsa hata fırlatıyoruz.
        const newUser = new User({ username, email, password, role }); // eğer yoksa yeni kullanıcı oluşturuyoruz.
        await newUser.save(); // yeni kullanıcıyı kaydediyoruz.
         await redisClient.del('all_users'); // tüm kullanıcıları redis cache'den sil
        // elastic seache kaydetme işlemi
        await elasticClient.index({
            index: "users",
            id: newUser._id.toString(),
            document:{
                username,
                email,
                role: role || 'user',
                userId: newUser._id.toString(),
                createdAt: new Date()
            }
        });
        logger.info(`New user registered: ${username}, ${email}, ${role || 'user'}`);

        return {
            message: "User created",
            userId: newUser._id,
        };

    } catch (error) {
        logger.error(`Error in registerUser: ${error.message}`);
        throw new Error(error.message);
    }
};
const loginUser = async (email, password) => {
    try {
        logger.debug(`login attempt for: ${email}`);
        const user = await User.findOne({ email });
        if (!user) {
            logger.warn(`Login failed: User with email ${email} not found`);
            throw new Error("User not found");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error("Invalid credentials"); // şifre kontrolü yapıyoruz eğer eşleşmiyorsa hata fırlatıyoruz.  
        logger.info(`Login successful for user: ${user._id}`);
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" }); // token oluşturuyoruz.
        logger.debug(`Generated token for user: ${user._id}`);
        return {
            token,
            userId: user._id,

        };

    } catch (error) {
        logger.error(`Error: ${error.message}`);
        throw new Error(error.message);

    }
};
const getAllUsers = async () => {
    try {
        // önce redissten kontrol et 
        const cachedUsers=await redisClient.get('all_users');
        if(cachedUsers){
            logger.info('Users fetched from Redis cache');
            return JSON.parse(cachedUsers); // redisden gelen veriyi parse et
        }
        // tüm kullanıcıları al daha sonra kullanıcıları döndür
        const users = await User.find({});
        // sonuçları redis cache'e kaydet
        await redisClient.set('all_users', JSON.stringify(users), 'EX', 3600); // 1 saat süreyle cachele
        logger.info('Users fetched from MongoDB and cached in Redis');
        return users;
    } catch (error) {
        logger.error(`Error: ${error.message}`);
        throw new Error(error.message);

    }
}
const getUserById = async (userId) => {
    try {
        /// önce redissten kontrol et
        const cachedUser = await redisClient.get(`user_${userId}`);
        if(cachedUser){
            logger.info('User fetched from Redis cache');
            return JSON.parse(cachedUser); // redisden gelen veriyi parse et
        }
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");
        // sonuçları redis cache'e kaydet
        await redisClient.set(`user_${userId}`, JSON.stringify(user), 'EX', 3600); // 1 saat süreyle cachele
        logger.info('User fetched from MongoDB and cached in Redis');
        return user;
    } catch (error) {
        logger.error(`Error: ${error.message}`);
        throw new Error(error.message);

    }
}
const updateUser = async (userId, updateData) => {
    try {
        // user var mı kontrol ediyoruz.
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");
        if (updateData.email && updateData.email !== user.email) {
            const existingUser = await User.findOne({
                email: updateData.email,
            }); // email adresi ile kayıtlı kullanıcı var mı kontrol ediyoruz.
            if (existingUser) throw new Error("This email already exists"); // eğer varsa hata fırlatıyoruz.
        }
        if (updateData.username && updateData.username !== user.username) {
            const existingUser = await User.findOne({
                username: updateData.username,

            });
            if (existingUser) throw new Error("This username already exists");
        }
        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }
        // kullanıcıyı güncelle yeni verilerle 
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password");
        // elastic search güncelleme işlemi
        await elasticClient.update({
            index: "users",
            id: userId,
            doc: {
                username: updateData.username || user.username,
                email: updateData.email || user.email,
                role: updateData.role || user.role,
                updatedAt: new Date()
            }
        });
        logger.info(`User updated in MongoDB and Elasticsearch: ${userId}`);
        await redisClient.del(`user_${userId}`); // güncellenen kullanıcıyı redis cache'den sil	
        await redisClient.del('all_users'); // tüm kullanıcıları redis cache'den sil

        return updatedUser;
    } catch (error) {
        logger.error(`Error: ${error.message}`);
        throw new Error(error.message);

    }

};
const deleteUser = async (userId) => {
    try {
        // Önce kullanıcıyı bul ve sil
        const user = await User.findByIdAndDelete(userId);
        if (!user) throw new Error("User not found");

        
        // Kullanıcıya ait tüm postları sil(mongo db den)
        const deletedPosts = await Post.deleteMany({ userId: userId });
  // Elasticsearch'den kullanıcı ve postlarını sil
  await Promise.all([
    elasticClient.delete({
        index: 'users',
        id: userId
    }),
    elasticClient.deleteByQuery({
        index: 'posts',
        body: {
            query: {
                term: { userId: userId }
            }
        }
    })
]);
logger.info(`User and related data deleted from MongoDB and Elasticsearch: ${userId}`);
await redisClient.del(`user_${userId}`); // silinen kullanıcıyı redis cache'den sil
await redisClient.del('all_users'); // tüm kullanıcıları redis cache'den sil
        return {
            user: user,
            deletedPostsCount: deletedPosts.deletedCount
        };
    } catch (error) {
        logger.error(`Error: ${error.message}`);
        throw new Error(error.message);
    }
};
const searchUsers = async (query) => {
    try {
        const result = await elasticClient.search({
            index: 'users',
            body: {
                query: {
                    multi_match: {
                        query: query,
                        fields: ['username', 'email']
                    }
                }
            }
        });

        logger.info(`Search performed with query: ${query}`);
        return result.hits.hits.map(hit => ({
            ...hit._source,
            score: hit._score
        }));
    } catch (error) {
        logger.error(`Error in searchUsers: ${error.message}`);
        throw new Error(error.message);
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
    searchUsers
    
};