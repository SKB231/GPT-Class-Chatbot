const axios = require('axios');
require('dotenv').config()

const url = 'https://api.openai.com/v1/completions';

const max_tokens = 50;
const n = 1;

const OPENAI_API_KEY = `${process.env.OPENAI_API_KEY}`;

const headers = {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
}

exports.getTextResponse = async (promptQuestion, callback) => {
    const prompt = promptQuestion
    axios.post(url, {
        prompt: prompt,
        max_tokens:max_tokens,
        n:n,
        model: "text-davinci-003"
    },
    {
        headers: headers
    }).then(response => {
        console.log(response.data.choices[0].text)
        callback(response.data.choices[0].text)
    }).catch(error => {
        console.log(error)
    })
    
}