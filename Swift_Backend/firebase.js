const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const serviceAccount = require('./service-key.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
let queries = db.collection('queries')

function storeQuery(query) {
  queries.add(query)
}

function storeQuery(user, query, response) {
    queries.add({
      query: query,
      response: response,
      time: FieldValue.serverTimestamp(),
      user: user
  })
}

async function getUserQueries(user) {
    userQueries = await queries.where('user', '==', user).get()
    return userQueries
}

storeQuery("admin", "this query was made remotely", "firebase is cool")

a = getQueries("admin")
console.log(a) // A promise