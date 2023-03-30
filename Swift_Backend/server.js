const {autocomplete} = require("./firebase")


require("dotenv").config();
const io = require("socket.io")(3000);

const { getTextResponse } = require("./Utilities/RunOpenAIPrompt");

const connections = [];

io.on("connection", (socket) => {
  connections.push(socket);
  console.log("%s sockets are connected.", connections.length);

  socket.on("disconnect", () => {
    connections.splice(connections.indexOf(socket), 1);
  });

  socket.on("RecieveAutoCompleteRequest", async (data) => {
    console.log("Recieved Query: " + data );
    io.emit("RecieveAutoCompleteResponse", autocomplete(data));
  })

  socket.on("RecieveUserMessage", async (data) => {
    console.log("Recieved message: " + data);
    const matchParam = /^\/(\w+)/;
    const matchMessage = /^\/\w+\s+(\w+)/;

    const match = data.match(matchParam);
    let returnMessage = "";
    if (match && match[1] === "useGPT" && data.match(matchMessage)) {
      const message = data.substring(data.indexOf(' ') + 1);
      getTextResponse(message, callback)
    } else {
      returnMessage = data;
      io.emit("RecieveMessageResponse", { msg: "Recieved Message", "sender": "GPT" });
    }
  });
});



callback = (outputMessage) => {
  io.emit("RecieveMessageResponse", { "msg": outputMessage, "sender": "GPT" });
};

console.log("Server is running...");

