const axios = require("axios");
const url = "https://api.openai.com/v1/chat/completions";

const OPENAI_API_KEY = `${process.env.OPENAI_API_KEY}`;

const headers = {
    Authorization: `Bearer ${OPENAI_API_KEY}`,
    "Content-Type": "application/json",
};

const instructions =
    "You are a assistant, named Cosine, meant for students of Georgia Tech.";

const get_section = (sectionIndex) => {
    console.log(sectionIndex);
    console.log(`Returning the ${sectionIndex} section from the article!`);
};

class Chat {
    constructor() {
        this.messages = [{ role: "system", content: instructions }];
    }

    addMessage(role, message) {
        this.messages.push({ role: role, content: message });
    }

    getTextResponse = async (callback) => {
        axios
            .post(
                url,
                {
                    model: "gpt-3.5-turbo",
                    // Messages should be an array of objects with 'role' and 'text' properties
                    messages: this.messages,
                    functions: [
                        {
                            name: "get_section",
                            description:
                                "Given the section index, returns that section from the Stephen Wolfram's article",
                            parameters: {
                                type: "object",
                                properties: {
                                    index: {
                                        type: "string",
                                        description: "The section index",
                                    },
                                },
                                required: ["index"],
                            },
                        },
                    ],
                },
                {
                    headers: headers,
                }
            )
            .then((response) => {
                let chatResponseContent = "";
                const role = response.data.choices[0].message;
                if (response.data.choices[0].finish_reason == "function_call") {
                    // Function is called.
                    const functionName =
                        response.data.choices[0].message["function_call"][
                            "name"
                        ];
                    if (
                        response.data.choices[0].message &&
                        response.data.choices[0].message?.content != ""
                    ) {
                        chatResponseContent =
                            response.data.choices[0].message.content;
                    } else {
                        chatResponseContent = "Called function! ";
                    }
                    if (functionName == "get_section") {
                        console.log(
                            JSON.parse(
                                response.data.choices[0].message[
                                    "function_call"
                                ]["arguments"]
                            )["index"]
                        );
                        console.log(
                            response.data.choices[0].message["function_call"]
                        );

                        get_section(
                            JSON.parse(
                                response.data.choices[0].message[
                                    "function_call"
                                ]["arguments"]
                            )["index"]
                        );
                    }
                } else {
                    chatResponseContent = response.data.choices[0].message;
                }

                this.addMessage("GPT", chatResponseContent);
                callback(chatResponseContent);
                return chatResponseContent;
            })
            .catch((error) => {
                console.log(error);
            });
    };
}

module.exports = Chat;

// let chat = new Chat()
// chat.addMessage("user","Hi!")

// chat.getTextResponse()
