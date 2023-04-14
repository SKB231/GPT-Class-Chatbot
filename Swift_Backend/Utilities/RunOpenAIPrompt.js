const axios = require('axios');
const url = 'https://api.openai.com/v1/chat/completions';

const OPENAI_API_KEY = `${process.env.OPENAI_API_KEY}`;

const headers = {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
}

const instructions = 'You are a assistant, named Cosine, meant for students taking the Signal processing class of Georgia Tech.' + 
                     'Students may converse with you or ask questions. This course is taught by James McClellan, and the course textbook is Signal Processing First by James McClellan.' +
                     'Your first source for information should be this textbook.' +
                     'If a user asks a shorter question, try to give a brief answer.' +
                     'If a user asks a longer question, you can elaborate further, but try to focus on only what the user asks' +
                     'If a user asks for you to elaborate, then feel free to elaborate' +
                     'When answering users questions, if you can remember which chapter from Signal Processing First you got your answer from, then explicitly let the student know at the end of every response'

class Chat {
    constructor() {
      this.messages = [{"role": "system", "content": instructions}];
    }
  
    addMessage(role, message) {
      this.messages.push({"role": role, "content": message });
    }

    getTextResponse = async (callback) => {
        axios.post(url, {
            model: 'gpt-3.5-turbo',
            // Messages should be an array of objects with 'role' and 'text' properties
            messages: this.messages
        },
        {
            headers: headers
        }).then(response => {
            console.log(response.data.choices[0].message)
            let chatResponse = response.data.choices[0].message
            this.addMessage(chatResponse.role, chatResponse.content)
            callback(chatResponse.content)
            return this.chatResponse
        }).catch(error => {
            console.log(error);
        });
    }
}
  
module.exports = Chat

// let chat = new Chat()
// chat.addMessage("user","Hi!")

// chat.getTextResponse()