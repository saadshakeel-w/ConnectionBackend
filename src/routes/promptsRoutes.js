const express = require('express');
const router = express.Router();
const promptServices  = require('../services/promptServices')

router.get('/', promptServices.getAllPrompts);
  
router.post('/create', promptServices.createPrompt);


module.exports = router;
