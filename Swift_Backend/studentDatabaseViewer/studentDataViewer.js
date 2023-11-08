require("dotenv").config();
const http = require("http");
const { getAllStudents } = require("../firebase");

function startHttpServer() {
  // Create server object
  const server = http.createServer();
  server.on("request", async (request, response) => {
    // For every incoming request handle here using request and response
    const { method, url } = request;
    console.log("HTTP Request: ", method, url);
    const regexMatcher = /^(\/studentData)/g; // Matches anything that begins with "/studentData"  the forward slash is so that regex doesn't confuse it with the end of the variable
    console.log(url.match(regexMatcher));
    if (method == "GET" && url.match(regexMatcher)) {
      console.log("Reached here");
      // We assume that the request is already pointing to "GET /studentData"
      response.on("error", (err) => {
        console.log("Error when sending response ", err);
      });
      try {
        response.setHeader("Content-Type", "application/json");
        response.statusCode = 200;
        response.write(JSON.stringify(await getAllStudents()));
        response.end();
      } catch (error) {
        console.log(error);
        respone.end("Error occured when retriving firebase data.");
      }
    }
  });

  // Finally make the http server start listening to $PORT
  server.listen(process.env.PORT);
  return server;
}
exports.startHttpServer = startHttpServer;
