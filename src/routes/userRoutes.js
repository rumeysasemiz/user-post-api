const express = require("express");
const router = express.Router();
const { registerUser, loginUser,getAllUsers ,getUserById,updateUser,deleteUser} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const { userValidator } = require('../middlewares/validator');

// user routes  
router.post("/register", userValidator,registerUser);
router.post("/login", loginUser);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", authMiddleware, updateUser);
router.delete("/:id", authMiddleware, deleteUser);
module.exports = router;
