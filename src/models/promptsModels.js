const mongoose = require('mongoose');



const promptsSchema = new mongoose.Schema({
    question  : String , 
})

const Prompts = mongoose.model('Prompts' , promptsSchema )

module.exports = Prompts;