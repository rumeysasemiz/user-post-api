const express = require("express");
const router = express.Router();
const { registerUser, loginUser,getAllUsers ,getUserById,updateUser,deleteUser, logoutUser,sessionStatus} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const sessionAuth = require("../middlewares/sessionMiddleware");
const { userValidator } = require('../middlewares/validator');
//router.get("/search", searchUsers);

router.get("/", getAllUsers);

// user routes  
router.post("/register", userValidator,registerUser);
router.post("/login", loginUser);
router.get("/logout",sessionAuth,logoutUser);

router.get("/:id", getUserById);
router.put("/:id", authMiddleware, updateUser);
router.delete("/:id", authMiddleware, deleteUser);
router.get("/session/status", sessionStatus);
module.exports = router;
