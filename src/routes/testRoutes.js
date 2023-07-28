const express = require('express');
const router = express.Router();
const Test =  require('../models/testModel')
router.get('/', async (req , res)=>{
        let user = new Test({
            firstName : req.body.firstName
        })
       await user.save()
       let previousUser = await Test.find()
        res.status(200).send({message : "your querry has been recieved" , user : previousUser})
});
  
// router.post('/create', promptServices.createPrompt);


module.exports = router;
