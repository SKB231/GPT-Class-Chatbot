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

async function deleteUserQueries(user) {
    userQueries = await queries.where('user', '==', user).get() 
    const batchSize = userQueries.size;
    if (batchSize === 0) {
      // when there are no documents left, we are done
      resolve();
      return;
    }
    const batch = db.batch();
    userQueries.docs.forEach((doc) => { // executes only after above line of code
      batch.delete(doc.ref);
    });
    await batch.commit();
}

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

async function test() {
  await delay(1000);
  console.log(a);
}

test();