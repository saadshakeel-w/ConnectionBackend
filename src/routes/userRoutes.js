const express = require("express");
const router = express.Router();
const userService = require("../services/userService");
const multer = require("multer");
const { auth } = require("../middlewares/auth");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images"); // Save the uploaded images in the 'custom' directory within the 'images' folder
  },
  filename: function (req, file, cb) {
    // Use a unique filename to prevent overwriting existing images
    const uniquePrefix = Date.now() + "-";
    cb(null, uniquePrefix + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/register", upload.none(), userService.registerUser);
router.post("/login", userService.loginUser);
router.post('/requestResetPass' , userService.generateAndStoreOTP)
router.post('/verifyOTP' , userService.verifyOTP)
router.post('/resetPassword' , userService.resetPassword)

router.get("/profile", auth, userService.getUserProfile);
router.get("/nearby", auth, userService.getNearbyUsers);
router.post(
  "/upload/:userId",
  upload.array("images", 3), // Allow single image upload with the field name 'images'
  userService.uploadImage
);
router.post("/editProfile", auth, userService.editUserProfile);
router.post("/editImages",
 auth, 
 upload.fields([
  { name: 'images', maxCount: 6 },
  {name : "updateImageIds" , maxCount:6,  }
  // Specify the field name and maximum number of files
  // Add more field configurations if needed
]) , 
 // upload.array("images", 3), 
//  upload.none(),
  userService.editImages); // New API for editing images

module.exports = router;
