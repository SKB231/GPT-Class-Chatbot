const { registerQuery, autocomplete, writeDataToJson } = require("./database");
require("dotenv").config();
const io = require("socket.io")(3000);

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
  //io.emit("RecieveMessageResponse", { "msg": outputMessage, "sender": "GPT" });
};

console.log("Server is running...");
//retrieveQuery("what can be started with the command demo?"));

// start = Date.now()
// console.log("Query: what are fir filt-")
// console.log("Suggestions:")
// val = autocomplete('what are fir filt')
// end = Date.now()
// console.log(val)
// console.log(end - start)
