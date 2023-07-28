const mongoose = require('mongoose');



const testSchema = new mongoose.Schema({
    firstName  : String , 
})

const Test = mongoose.model('Test123' , testSchema )

module.exports = Test;