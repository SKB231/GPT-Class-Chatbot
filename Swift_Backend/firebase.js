const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const serviceAccount = require('./service-key.json');
const fs = require('fs')

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

function cacheAnswer(id, answer) {
    
}

function cacheContext(id, compact_context) {
    
}

function incrementFrequency(query) {
    try {
        query_to_data[query]['frequency'] += 1;
    } catch (err) {
        console.log()
    }
}

var data = require('./mock_data.json')

var query_to_data = {}

for (i in data) {
    query_to_data[data[i]['question']] = data[i];
}

exports.autocomplete = (input, sort='length', num=20) => {
    if (data == null) {
        return []
    }

    try {
        var prefix = new RegExp(`^${escape(input)}`, 'i')
        var pattern = new RegExp(`${escape(input)}`, 'i')
    } catch {
        console.log("Error forming regular expression on user input")
        return []
    }

    var prefix_matches = data.filter(d => d.question.search(prefix) >= 0)
    top_suggestions = prefix_matches.sort((a, b) => custom_sort(a, b, sort))
    if (top_suggestions.length >= num) {
        return top_suggestions.splice(0, num)
    }
    var pattern_matches = data.filter(d => d.question.search(pattern) >= 0)
    top_suggestions_2 = pattern_matches.sort((a, b) => custom_sort(a, b, sort))
    top_suggestions = top_suggestions.concat(top_suggestions_2)
    top_suggestions = top_suggestions.filter((item, idx) => top_suggestions.indexOf(item) == idx)
    return top_suggestions.splice(0, num)
}

function countWords(str) {
    return str.trim().split(/\s+/).length;
}

function custom_sort(a, b, sort='length') {
    if (sort == 'length') {
        weight = (countWords(a["question"]) - countWords(b["question"]))
        if (weight == 0) {
            weight = (b["frequency"] - a["frequency"]) / 100
        }
        return weight
    } else {
        weight = (b["frequency"] - a["frequency"])
        if (weight == 0) {
            weight = (a["question"].length - b["question"].length) / 100
        }
        return weight
    }
}

function storeJson() {
    if (!data) return
    fs.writeFileSync("mock_data.json", JSON.stringify(data, null, 4), function(err) {
        if (err) {
            console.log(err);
        }
    });
}

process.on('exit', storeJson);