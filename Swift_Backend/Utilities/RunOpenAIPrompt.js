const axios = require('axios');
const url = 'https://api.openai.com/v1/chat/completions';
const {addMessage} = require('../firebase.js');

const OPENAI_API_KEY = `${process.env.OPENAI_API_KEY}`;
const fs = require("fs");
const headers = {
  Authorization: `Bearer ${OPENAI_API_KEY}`,
  "Content-Type": "application/json",
};

const instructions =
  "You are a assistant, named Cosine, meant for students of Georgia Tech.";

const get_section = (sectionIndex) => {
  sectionIndex -= 1;
  let data = fs.readFileSync("./Utilities/article.json", "utf8");
  console.log(data);
  const dataArr = JSON.parse(data);
  console.log(dataArr);
  sectionIndex = Math.max(Math.min(dataArr.length - 1, sectionIndex), 0);
  return dataArr[sectionIndex];
};

class Chat {
  constructor() {
    this.messages = [{ role: "system", content: instructions }];
  }

  addMessage(role, message) {
    this.messages.push({
      role: role == "GPT" ? "system" : role,
      content: message,
    });
      addMessage("testUserID", message);//from reese branch
  }

  getTextResponse = async (callback) => {
    console.log("===============XXXXXX==============");
    console.log(this.messages);
    this.messages.forEach((message) => {
      console.log(message.content);
    });
    const functions = [
      {
        name: "get_section",
        description:
          "Given the section index, returns that section from the Stephen Wolfram's article. Use this function whenever student asks for a particular section of the article",
        parameters: {
          type: "object",
          properties: {
            index: {
              type: "string",
              description: "The section index",
            },
            shouldContinue: {
              type: "boolean",
              description:
                "A boolean for should this data be sent back as a second API call to GPT",
            },
          },
          required: ["index", "shouldContinue"],
        },
      },
    ];
    const requestBody = {
      model: "gpt-3.5-turbo",
      messages: this.messages,
      functions: functions,
      function_call: "auto",
    };
    console.log("Sending request");
    console.log(headers);
    console.log(requestBody);

    axios
      .post(url, requestBody, {
        headers: headers,
      })
      .then((response) => {
        let chatResponseContent = "";
        const role = response.data.choices[0].message;
        if (response.data.choices[0].finish_reason == "function_call") {
          // Function is called.
          const functionName =
            response.data.choices[0].message["function_call"]["name"];
          if (
            response.data.choices[0].message &&
            response.data.choices[0].message?.content != ""
          ) {
            chatResponseContent = response.data.choices[0].message.content;
          } else {
            chatResponseContent = "Called function! ";
          }
          if (functionName == "get_section") {
            console.log(
              JSON.parse(
                response.data.choices[0].message["function_call"]["arguments"],
              ),
            );
            console.log(response.data.choices[0].message["function_call"]);

            const articleSection = get_section(
              JSON.parse(
                response.data.choices[0].message["function_call"]["arguments"],
              )["index"],
            );

            chatResponseContent = articleSection;
          }
        } else {
          chatResponseContent = response.data.choices[0].message.content;
        }

        this.addMessage("GPT", chatResponseContent);
        callback(chatResponseContent);
        return chatResponseContent;
      })
      .catch((error) => {
        console.log(JSON.stringify(error));
      });
  };
}

module.exports = Chat;

// let chat = new Chat()
// chat.addMessage("user","Hi!")

// chat.getTextResponse()
