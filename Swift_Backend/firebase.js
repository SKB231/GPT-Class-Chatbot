const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, arrayUnion, getDoc, Timestamp, FieldValue } = require('firebase-admin/firestore');
const serviceAccount = require('./service-key.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

async function checkExists(userId){
    const docRef = db.collection('allQueries').doc(userId);
    const doc = await docRef.get();
    if (!doc.exists) {
        //console.log('No such document!');
        await docRef.set({
            messages: []
        })
        return [];
    } else {
        //console.log('Document data:', doc.data().messages);//loads data correctly!
        const pastMessages = await doc.data().messages;
        return pastMessages;
    }
}

async function addMessage(userId, message){
    const docRef = db.collection('allQueries').doc(userId);
    await docRef.update({
        messages: FieldValue.arrayUnion(message)
    })
}

module.exports = {addMessage, checkExists};
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