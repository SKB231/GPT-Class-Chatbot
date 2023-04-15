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

stopwords = ['i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves','he','him','his','himself','she','her','hers','herself','it','its','itself','they','them','their','theirs','themselves','what','which','who','whom','this','that','these','those','am','is','are','was','were','be','been','being','have','has','had','having','do','does','did','doing','a','an','the','and','but','if','or','because','as','until','while','of','at','by','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','s','t','can','will','just','don','should','now']

exports.autocomplete = (input, sort='length', num=20) => {
    if (data == null) {
        return []
    }

    try {
        var prefix = new RegExp(`^${input}`, 'i')
        var pattern = new RegExp(`${input}`, 'i')
    } catch (err) {
        console.log("Error forming regular expression on user input")
        console.log(err.message)
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
    if (top_suggestions.length >= num) {
        return top_suggestions.splice(0, num)
    }

    try {
        filtered_input = remove_stopwords(input)
        var words_string = filtered_input.replace(/ /gi,"|");
        var words = new RegExp(`${words_string}`, 'gi')
        var word_matches = data.filter(d => d.question.search(words) >= 0)
        var matches_dict = {}
        for (i in word_matches) {
            var matched_words = word_matches[i].question.match(words).length
            matches_dict[word_matches[i]] = matched_words
        }
        top_suggestions_3 = word_matches.sort((a, b) => word_sort(a, b, matches_dict, sort))
        top_suggestions = top_suggestions.concat(top_suggestions_3)
        top_suggestions = top_suggestions.filter((item, idx) => top_suggestions.indexOf(item) == idx)
    } catch (err) {
        console.log("Error forming word regular expression on user input")
        console.log(err.message)
    }

    return top_suggestions.splice(0, num)

}

function remove_stopwords(str) {
    res = []
    words = str.split(' ')
    for(i=0;i<words.length;i++) {
       word_clean = words[i].split(".").join("")
       if(!stopwords.includes(word_clean)) {
           res.push(word_clean)
       }
    }
    return(res.join(' '))
}

function countWords(str) {
    return str.trim().split(/\s+/).length;
}

function word_sort(a, b, matchs_dict, sort='length') {
    weight = matchs_dict[b] - matchs_dict[a];
    if (weight == 0) {
        weight = custom_sort(a, b, sort)
    }
    return weight;
}

function custom_sort(a, b, sort='length') {
    if (sort == 'length') {
        weight = Math.floor((countWords(a["question"]) - countWords(b["question"])) / 2)
        if (weight == 0) {
            weight = (b["frequency"] - a["frequency"])
        }
        return weight
    } else {
        weight = (b["frequency"] - a["frequency"])
        if (weight == 0) {
            weight = Math.floor((countWords(a["question"]) - countWords(b["question"])) / 2)
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