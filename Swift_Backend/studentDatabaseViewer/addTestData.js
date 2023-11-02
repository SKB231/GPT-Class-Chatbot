const { addStudentData } = require("../firebase");

function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

if (process.argv.length != 3) {
  console.log("Argument count expected when calling program");
  process.exit(1);
}

count = parseInt(process.argv[2]);

for (var i = 0; i < count; i += 1) {
  const googleId = generateRandomString(10);
  messages = [];
  topics = [];
  for (var j = 0; j < count; j += 1) {
    messages.push(generateRandomString(5));
    topics.push(generateRandomString(5));
  }
  addStudentData(googleId, messages, topics);
}
