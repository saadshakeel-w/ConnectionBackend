const User = require("../models/usersModel");
const bcrypt = require("bcrypt");
const saltRounds = 10; // The number of salt rounds for bcrypt hashing
const multer = require("multer");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const fs = require("fs");
// ...
const upload = multer();

const registerUser = async (req, res) => {
  try {
    console.log(req.body.firstName);
    const {
      firstName,
      lastName,
      email,
      password,
      dateOfBirth,
      gender,
      latitude,
      longitude,
      promptAnswers,
    } = req.body;
    const DOBDate = moment(dateOfBirth, "MM-DD-YYYY");
    // Check if the user with the provided email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .send({ message: "User with this email already exists." });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      dateOfBirth: DOBDate,
      gender,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      promptAnswers: promptAnswers, // You can add more fields to the user registration as needed
      images: [],
    });
    await newUser.save();
    res.status(201).send({ message: "User registered successfully." });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .send({ message: "Error occurred during user registration." });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user with the provided email exists
    const user = await User.findOne({ email }).populate({
      path: "promptAnswers.selectedPrompt",
      model: "Prompts",
    });
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    // Compare the provided password with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).send({ message: "Invalid credentials." });
    }

    // Generate a JWT token and include any necessary user data (optional)
    const token = jwt.sign({ userId: user._id }, "privateKey");

    // You can include any additional user data in the response if needed (e.g., user ID, name, etc.)
    res.status(200).send({
      message: "Login successful.",
      token,
      user: user,
      firstName: user.firstName,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error occurred during login." });
  }
};

const getUserProfile = async (req, res) => {
  try {
    // req.user contains the authenticated user data from the auth middleware
    console.log(req.user);
    const userId = req.user.id;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    // Return the user's profile
    res.status(200).send({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      location: user.location,
      // Include any other profile fields you want to expose
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Error occurred while fetching the user profile." });
  }
};

const getNearbyUsers = async (req, res) => {
  try {
    // Get the user's latitude and longitude from the authenticated user data (req.user)
    const [longitude, latitude] = req.user.location.coordinates;
    console.log(latitude, longitude, "location");
    // Find all users and sort them by location using the MongoDB $geoNear aggregation

    const nearbyUsers = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          distanceField: "distance",
          spherical: true,
        },
      },
      {
        $match: {
          _id: { $ne: req.user._id }, // Exclude the authenticated user's document
        },
      },
      {
        $project: {
          distance: 1,
          // Include other user fields that you want to display in the response
          firstName: 1,
          lastName: 1,
          email: 1,
          // Add more user fields as needed
        },
      },
      { $sort: { distance: 1 } }, // Sort the users by distance in ascending order (closest first)
    ]);

    // Return the list of nearby users sorted by distance
    res.status(200).send({ nearbyUsers });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Error occurred while fetching nearby users." });
  }
};

const uploadImage = async (req, res) => {
  try {
    const userId = req.params.userId;
    const customImagePaths = req.files.map((file) => ({
      path: "images/" + file.filename,
    })); // Array of custom image paths as objects
    console.log(customImagePaths);
    // Find the user by user ID

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    // Add the custom image path to the user's 'images' array
    user.images = customImagePaths;
    await user.save();

    res.status(201).send({ message: "Image uploaded successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error occurred while uploading image." });
  }
};

const editUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Get the user ID from the authenticated user data
    var DOBDate;
    // Find the user by user ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }
    if (req.body.dateOfBirth) {
      DOBDate = moment(req.body.dateOfBirth, "MM-DD-YYYY");
    }

    // Prepare the fields to update using Object.assign
    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      dateOfBirth: DOBDate,
      gender: req.body.gender,
    };

    // Filter out undefined values to keep existing user fields if not provided
    for (const key in fieldsToUpdate) {
      if (fieldsToUpdate[key] === undefined) {
        delete fieldsToUpdate[key];
      }
    }

    // Update the user document with the provided data
    Object.assign(user, fieldsToUpdate);

    // If latitude and longitude are provided, update the location coordinates
    if (req.body.latitude && req.body.longitude) {
      user.location.coordinates = [
        parseFloat(req.body.longitude),
        parseFloat(req.body.latitude),
      ];
    }

    // Save the updated user document
    await user.save();

    res.status(200).send({ message: "User profile updated successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error occurred while updating profile." });
  }
};

const editImages = async (req, res) => {
  try {
    const userId = req.user._id;
    const newImages = req.files.images; // New images sent through form-data
    const { updateImageIds } = req.body;
    console.log(newImages, "images id  ");
    const user = await User.findById(userId);

    // Delete the old images from the directory
    if (updateImageIds && Array.isArray(updateImageIds)) {
      for (const updateId of updateImageIds) {
        const imageToUpdate = user.images.find(
          (image) => image.id === updateId
        );
        if (imageToUpdate) {
          // Extract the filename from the image path
          const filename = imageToUpdate.path.split("/").pop();

          // Delete the image file from the directory
          fs.unlinkSync(`images/${filename}`);
        }
      }
    }

    // Update images: Add new images to the user's 'images' array
    if (updateImageIds && Array.isArray(updateImageIds)) {
      for (let i = 0; i < updateImageIds.length; i++) {
        const updateId = updateImageIds[i];
        const imageToUpdate = user.images.find(
          (image) => image.id === updateId
        );
        if (imageToUpdate) {
          imageToUpdate.path = "images/" + newImages[i].filename;
        }
      }
    }
    // }

    console.log(user, "user");
    // Update specific images: Update paths for specific images in the user's 'images' array

    await user.save();
    res.status(200).send({ message: "Images updated successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error occurred while updating images." });
  }
};

async function generateAndStoreOTP(req, res) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(200).json({ success: false, message: "User not found." });
    }

    // Generate a random OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Convert the random number to a string and pad with leading zeros if necessary
    const otpString = otp.toString().padStart(6, "0");
    // Store the OTP and its expiration time in the database
    user.resetPasswordOTP = otpString;
    await user.save();

    // Return the OTP to send in the response
    return res.status(200).json({ message: "OTP sent successfully.", otp: otpString });
  } catch (error) {
    console.log(error);
    return { success: false, message: "Error occurred while generating OTP." };
  }
}


const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find the user by email and check if the OTP matches
    const user = await User.findOne({ email, resetPasswordOTP: otp });
    if (!user) {
      return res.status(400).send({ message: 'Invalid OTP.' });
    }

    // If the OTP is valid, clear the OTP field in the user document
    await user.save();

    // You can also send additional data in the response if needed
    res.status(200).send({ message: 'OTP verified successfully.', status : true });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'Error occurred while verifying OTP.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Find the user by email and check if the OTP matches
    const user = await User.findOne({ email, resetPasswordOTP: otp });
    if (!user) {
      return res.status(400).send({ message: 'Invalid or expired OTP.' });
    }

    // Reset the user's password with the new password
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;
    user.resetPasswordOTP = undefined;
    await user.save();

    // Send a success response
    res.status(200).send({ message: 'Password reset successful.' });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'Error occurred while resetting the password.' });
  }
};


module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getNearbyUsers,
  uploadImage,
  editUserProfile,
  editImages,
  generateAndStoreOTP,
  verifyOTP,
  resetPassword
};
