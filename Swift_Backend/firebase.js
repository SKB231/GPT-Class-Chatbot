const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const serviceAccount = require('./service-key.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

function storeQuery(query) {
    let queries = db.collection('queries')
    queries.add(query)
}

storeQuery({
    query: "this query was made remotely",
    response: "firebase is cool",
    time: FieldValue.serverTimestamp(),
    user: "admin"
})
