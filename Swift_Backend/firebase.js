const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, arrayUnion, getDoc, Timestamp, FieldValue } = require('firebase-admin/firestore');
const serviceAccount = require('./service-key.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();
let queries = db.collection('queries')


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
// async function deleteUserQueries(user) {
//     userQueries = await queries.where('user', '==', user).get() 
//     const batchSize = userQueries.size;
//     if (batchSize === 0) {
//       // when there are no documents left, we are done
//       resolve();
//       return;
//     }
//     const batch = db.batch();
//     userQueries.docs.forEach((doc) => { // executes only after above line of code
//       batch.delete(doc.ref);
//     });
//     await batch.commit();
// }