const userService = require("../services/userServices");
// kullanıcı kayıt ediyoruz 
const registerUser = async (req, res) => {
    try {
        const result = await userService.registerUser(req.body.username, req.body.email, req.body.password, req.body.role);
        console.log("user saved", result);
        res.status(201).json(result);
    } catch (error) {
        console.log("error:", error.message);
        res.status(400).json({ message: error.message });
    }
};
const loginUser = async (req, res) => {
    try {
        const result = await userService.loginUser(req.body.email, req.body.password);
        res.json(result);
    } catch (error) {
        console.log("error:", error.message);
        res.status(400).json({ message: error.message });

    }
};
const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        console.log("error:", error.message);
        res.status(500).json({ message: error.message });// neden 500 hatası aldıgım araştır 

    }
};
const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await userService.getUserById(userId);
        res.status(200).json(user);
    } catch (error) {
        console.log("error:", error.message);
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

        res.status(200).json({
            message: "User updated",
            user: updatedUser,
        });
    } catch (error) {
        console.log("error:", error.message);
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
        await userService.deleteUser(userId);
        res.status(200).json({ message: "User deleted" });

    } catch (error) {
        console.log("error:", error.message);
        if (error.message === "User not found") {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};
