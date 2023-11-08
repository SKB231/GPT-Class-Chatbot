const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, arrayUnion, getDoc, Timestamp, FieldValue } = require('firebase-admin/firestore');
const serviceAccount = require('./service-key.json');

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();
let queries = db.collection("queries");
let studentData = db.collection("student");

function storeQuery(query) {
  queries.add(query);
}

function storeQuery(user, query, response) {
  queries.add({
    query: query,
    response: response,
    time: FieldValue.serverTimestamp(),
    user: user,
  });
}

async function getUserQueries(user) {
  userQueries = await queries.where("user", "==", user).get();
  return userQueries;
}

async function getStudentData(studentID) {
  studentDataResponse = await studentData
    .where("googleID", "==", studentID)
    .get();
  return studentData;
}

async function getAllStudents() {
  const response = await studentData.get();
  const returnObject = [];
  response.docs.forEach((studentInfo) => {
    returnObject.push(studentInfo.data());
  });
  return returnObject;
}

async function addStudentData(googleID, messages, topics) {
  await studentData.doc(googleID).set({ googleID, messages, topics });
}

async function addMessage(userId, message){
  const docRef = db.collection('allQueries').doc(userId);
  await docRef.update({
      messages: FieldValue.arrayUnion(message)
  })
}

async function createMessages(userId){
  const docRef = db.collection('allQueries').doc(userId);
  await docRef.set({
      messages: []
  })
}

module.exports = {addMessage, createMessages};

exports.addStudentData = addStudentData;
exports.getStudentData = getStudentData;
exports.getAllStudents = getAllStudents;
