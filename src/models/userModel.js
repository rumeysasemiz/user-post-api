const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        trim: true,
        
    },
 
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^\S+@\S+\.\S+$/, 'Please provide a valid email address',
        ],// girilen e postanın dogru formatta olup olmadıgnı kontrol ediyor.
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"],

    },
    role: {
        type: String,
        enum: ["user", "admin"],// kullanıcnın rollerini seçmesi için koyuyoruz.
        default: "user",

    },

},
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret) {
                delete ret.password;
                return ret;
            }
        }
    }
);
// şifreyi kaydetmeden önce hashliyopruz 
userSchema.pre("save", async function (next) { 
    // eğer şifre daha önce değişmediyse
    if (!this.isModified("password")) return next(); // eğer şifre değişmediyse bir sonraki işleme geç
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
        
    } catch (error) {
        next(error);
    }

});
// şifre kontrolü
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};
const User = mongoose.model("User", userSchema);
module.exports = User;
    