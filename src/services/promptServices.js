const Prompt = require('../models/promptsModels')
const staticPrompts = require('../utils/PromptsJson.json')


const getAllPrompts =async(req , res  , list)=> { 
    try {
        const allPrompts = await Prompt.find();
        if (allPrompts.length === 0) {
         const response =  await createPrompt(staticPrompts);
         console.log(response , "response")
         res.status(200).send(response)
        }else { 
            res.status(200).send(allPrompts)
        }
      } catch (error) {
        console.log(error);
        res.status(400).send({ message: error });
      }
}

const createPrompt =async (req , res  )=> { 
    try {
        const list = req?.body?.questions || req; // Use the request body or direct parameter
        const prompts = list.map((element) => ({ question: element }));
        const response = await Prompt.insertMany(prompts);
        if (res) {
          res.status(200).send({ message: "Successfully added prompt(s)" });
        } else {
          return response;
        }
      } catch (error) {
        console.log(error);
        res.status(400).send({ message: error });
      }
}

module.exports ={ 
     getAllPrompts , 
     createPrompt
}