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

  socket.on("NodeJS Server Port", async (data) => {
    console.log("Recieved message: " + data);
    const matchParam = /^\/(\w+)/;
    const matchMessage = /^\/\w+\s+(\w+)/;

    const match = data.match(matchParam);
    let returnMessage = "";
    if (match && match[1] === "useGPT" && data.match(matchMessage)) {
      const message = data.substring(data.indexOf(' ') + 1);
      io.emit("iOS Client Port", { msg: "User: " + message });
      getTextResponse(message, callback)
    } else {
      returnMessage = data;
      io.emit("iOS Client Port", { msg: "User: " + data });
    }
  });
});



callback = (outputMessage) => {
  io.emit("iOS Client Port", { msg: "Server: " + outputMessage });
};

console.log("Server is running...");

