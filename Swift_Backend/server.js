require("dotenv").config();
const io = require("socket.io")(3000);

const connections = [];

io.on("connection", (socket) => {
  connections.push(socket);
  console.log("%s sockets are connected.", connections.length);

  socket.on("disconnect", () => {
    connections.splice(connections.indexOf(socket), 1);
  });

  socket.on("NodeJS Server Port", (data) => {
    console.log(data);
    io.emit("iOS Client Port", { msg: data });
  });
});

console.log("Server is running...");
