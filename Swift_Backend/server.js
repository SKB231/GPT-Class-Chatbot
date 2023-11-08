const { registerQuery, autocomplete, writeDataToJson } = require("./database");
const {
  startHttpServer,
} = require("./studentDatabaseViewer/studentDataViewer");
require("dotenv").config();
// create and start HTTP server
const httpServerObj = startHttpServer();
// create a SocketIO instance to handle socket connections
const io = require("socket.io")(httpServerObj);
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

    const dataObject = await JSON.parse(data)

    const userID = dataObject["userId"]
    const message = dataObject["message"]
    console.log("Recieved message from user with ID: ", userID, "!")
    const matchParam = /^\/(\w+)/;
    const matchMessage = /^\/\w+\s+(\w+)/;
    const match = message.match(matchParam);
    let returnMessage = "";
    console.log(match);
    if (match && match[1] === "useGPT" && message.match(matchMessage)) {

      const messageWithoutPrefix = message.substring(message.indexOf(" ") + 1);
      chatInstance.addMessage("user", messageWithoutPrefix);
      chatInstance.getTextResponse(callback);
    } else {
      returnMessage = message;

      io.emit("RecieveMessageResponse", {
        msg: "Recieved Message",
        sender: "GPT",
      });
    }
  });

  socket.on("UpdateQuestionFrequency", async (message) => {
    registerQuery(message);
    writeDataToJson();
  });
});

callback = (outputMessage) => {
  console.log(outputMessage);
  io.emit("RecieveMessageResponse", { msg: outputMessage, sender: "GPT" });
};

console.log(`Server is running on port ${process.env.PORT}`);
