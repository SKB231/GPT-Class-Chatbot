const { registerQuery, autocomplete, writeDataToJson } = require("./database");
const {
  startHttpServer,
} = require("./studentDatabaseViewer/studentDataViewer");
require("dotenv").config();
// create and start HTTP server
const httpServerObj = startHttpServer();
// create a SocketIO instance to handle socket connections
const io = require("socket.io")(httpServerObj);

const Chat = require("./Utilities/RunOpenAIPrompt");

const connections = [];

io.on("connection", (socket) => {
  connections.push(socket);
  console.log("%s sockets are connected.", connections.length);

  let chatInstance = new Chat();

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
    console.log(match);
    if (match && match[1] === "useGPT" && data.match(matchMessage)) {
      const message = data.substring(data.indexOf(" ") + 1);
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
  io.emit("RecieveMessageResponse", { msg: outputMessage, sender: "GPT" });
};

console.log(`Server is running on port ${process.env.PORT}`);
