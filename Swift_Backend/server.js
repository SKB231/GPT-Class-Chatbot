const { registerQuery, autocomplete, writeDataToJson } = require("./database");
require("dotenv").config();
const io = require("socket.io")(process.env.PORT);
const {checkExists} = require('./firebase.js');

const Chat = require("./Utilities/RunOpenAIPrompt");

const connections = [];

io.use((socket,next)=>{
  const sessionID = socket.handshake.auth;//.sessionID
  console.log(socket.handshake.auth);
  socket.join('room1');
  console.log();
  next();
});

io.on("connection", (socket) => {
  connections.push(socket);
  console.log("%s sockets are connected.", connections.length);

  let chatInstance = new Chat();//constructor: initialized with {"role": "system", "content": instructions}
  checkExists("testUserID").then(pastMessages =>{
    //chatInstance.messages = pastMessages; does not hold roles
    for (let i=0;i<pastMessages.length;i++){
      chatInstance.messages.push({"role": "user", "content": pastMessages[i] });
    }
    /*
    for (let i=0;i<chatInstance.messages.length;i++){
      console.log("message: "+ chatInstance.messages[i].role + chatInstance.messages[i].content);
    }
    */
  })

  

  socket.on("disconnect", () => {
    connections.splice(connections.indexOf(socket), 1);
  });

  socket.on("RecieveAutoCompleteRequest", async (data) => {
    if (data.length < 100) {
      console.log(data);
      io.emit("RecieveAutoCompleteResponse", autocomplete(data));
    } else {
      return {};
    }
  });

  socket.on("RecieveUserMessage", async (data) => {
    console.log("Recieved message: " + data);
    const matchParam = /^\/(\w+)/;
    const matchMessage = /^\/\w+\s+(\w+)/;
    const match = data.match(matchParam);
    let returnMessage = "";
    console.log(match)
    if (match && match[1] === "useGPT" && data.match(matchMessage)) {
      const message = data.substring(data.indexOf(" ") + 1);
      console.log(message);
      chatInstance.addMessage("user", message);
      chatInstance.getTextResponse(callback);
    } else {
      returnMessage = data;

      io.emit("RecieveMessageResponse", {
        msg: "Recieved Message",
        sender: "GPT",
      });
    }
  });

  socket.on("UpdateQuestionFrequency", async (data) => {
    registerQuery(data);
    writeDataToJson();
  });
});

callback = (outputMessage) => {
  console.log(outputMessage);
  io.emit("RecieveMessageResponse", { "msg": outputMessage, "sender": "GPT" });
};

console.log(`Server is running on port ${process.env.PORT}`);

// retrieveQuery("what can be started with the command demo?");

// start = Date.now()
// console.log("Query: what are fir filt-")
// console.log("Suggestions:")
// val = autocomplete('what are fir filt')
// end = Date.now()
// console.log(val)
// console.log(end - start)
