const axios = require('axios');
const url = 'https://api.openai.com/v1/chat/completions';

const OPENAI_API_KEY = `${process.env.OPENAI_API_KEY}`;

const headers = {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
}

class Chat {
    constructor() {
      this.messages = [{"role": "system", "content": "You are a assistant, named Bob, meant for students taking the Signal processing class of Georgia Tech. Students may converse with you or ask questions."}];
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