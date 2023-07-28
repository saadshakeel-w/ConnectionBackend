const mongoose = require("mongoose");
const personalitySchema = require("./personalitySchema");

const imageSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true,
  },
});

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
    unique: true,
  },
  phone: {
    type: String,
    required: false,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  genderPreference: {
    type: String,
    enum: ["Male", "Female", "Other", "Any"], // Add "Any" as an option to indicate no specific preference
    default: "Any",
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
      index: "2dsphere",
    },
  },
  promptAnswers: [
    {
      selectedPrompt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Prompts",
        required: true,
      },
      answer: {
        type: String,
        required: true,
      },
    },
  ],
  images: {
    type: [imageSchema],
    default: [],
  },
  emailVerified: {
    type: Boolean,
    default: true,
  },
  isBlindDate: {
    type: Boolean,
    default: false,
  },
  blindVisibility: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  resetPasswordOTP: {
    type: String,
  },
  personalitySchema: {
    smoke: {
      type: Boolean,
      default: false,
    },
    drink: {
      type: Boolean,
      default: false,
    },
    relationStatus: {
      type: String,
      enum: ["Single", "Married", "Divorced"],
      default: "Single",
    },
    watchMovies: {
      type: Boolean,
      default: false,
    },
    playVideoGames: {
      type: Boolean,
      default: false,
    },
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
