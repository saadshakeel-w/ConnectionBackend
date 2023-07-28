const mongoose = require("mongoose");

const personalitySchema = new mongoose.Schema({
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
});

const Personality = mongoose.model("Personality", personalitySchema);
module.exports = Personality;
