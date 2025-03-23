const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
//const joi = require("joi"); joiyi araştır kullanmam gerkeilyor mu kullanmamam gerekiyrı mu

const registerUser = async (username, email, password, role) => {
    try {
        const existingUser = await User.findOne({ email }); // email adresi ile kayıtlı kullanıcı var mı kontrol ediyoruz.
        if (existingUser) throw new Error("This email already exists"); // eğer varsa hata fırlatıyoruz.
        const newUser = new User({ username, email, password, role }); // eğer yoksa yeni kullanıcı oluşturuyoruz.
        await newUser.save(); // yeni kullanıcıyı kaydediyoruz.
        return {
            message: "User created",
            userId: newUser._id,
        };

    } catch (error) {
        console.log("error:", error);
        throw new Error(error.message);
    }
};
const loginUser = async (email, password) => {
    try {
        console.log("login ...", email, password);
        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found");
            throw new Error("User not found");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error("Invalid credentials"); // şifre kontrolü yapıyoruz eğer eşleşmiyorsa hata fırlatıyoruz.  
        console.log("Login success");
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" }); // token oluşturuyoruz.
        console.log("token:", token);
        return {
            token,
            userId: user._id,

        };

    } catch (error) {
        console.log("error:", error);
        throw new Error(error.message);

    }
};
const getAllUsers = async () => {
    try {
        // tüm kullanıcıları al daha sonra kullanıcıları döndür
        const users = await User.find({});
        return users;
    } catch (error) {
        console.log("error:", error);
        throw new Error(error.message);
        
    }
}
const getUserById = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");
        return user;
    } catch (error) {
        console.log("error:", error);
        throw new Error(error.message);
        
    }
}
const updateUser = async (userId, updateData) => {
    try {
        // user var mı kontrol ediyoruz.
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");
        if(updateData.email  && updateData.email !== user.email) {
            const existingUser = await User.findOne({
                email: updateData.email,
            }); // email adresi ile kayıtlı kullanıcı var mı kontrol ediyoruz.
            if (existingUser) throw new Error("This email already exists"); // eğer varsa hata fırlatıyoruz.
        }
        if (updateData.username && updateData.username !== user.username) {
            const existingUser = await User.findOne({
                username: updateData.username,

            });
            if(existingUser) throw new Error("This username already exists");
        }
        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }
        // kullanıcıyı güncelle yeni verilerle 
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true,runValidators: true }
        ).select("-password");
        
        return updatedUser  ;
    } catch (error) {
        console.log("error:", error);
        throw new Error(error.message);
        
    }
    
};
const deleteUser = async (userId) => {
    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) throw new Error("User not found");
        return user;
    } catch (error) {
        console.log("error:", error);
        throw new Error(error.message);
        
    }
};

module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
}