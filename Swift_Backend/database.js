const fs = require('fs')
var data = require('./data/mock_data.json');
const { match } = require('assert');
const { query } = require('express');
exports.registerQuery = (query, user='unknown') => registerQuery(query, user)
exports.retrieveQuery = (query) => retrieveQuery(query)
exports.cacheResponse = (query, response) => cacheResponse(query, response)
exports.autocomplete = (input, priority='length', num=20) => autocomplete(input, priority, num);
exports.writeDataToJson = () => writeDataToJson()

const queryToData = {}

for (i in data) {
    queryToData[data[i].query] = data[i];
}

/**
 * Registers a new query.
 * If the query already existed in the database, will update it appropriately.
 * Else, it will create a new query.
 * @param {string} query The query to register.
 * @param {string} [user='unknown'] The user who submitted the query.
 */
function registerQuery(query, user='unknown') {
    if (query in queryToData) {
        queryToData[query].frequency += 1
        queryToData[query].time_stamps.push(Date.now())
        queryToData[query].users.push(user)
    } else {
        var newData = {
            question: `${query}`,
            frequency: 1,
            time_stamps: [Date.now()],
            users: [`${user}`],
            response: null
        }
        data.push(newData)
        queryToData[query] = newData
    }
}

/**
 * Retrieves a query's data.
 * Data includes:
 * {string} query.query: The query asked.
 * {number} query.frequency : How many times the same query was asked.
 * {string[]} query.users: All users who submitted this query. Length of query.frequency.
 * {number[]} query.timestamps: Timestamps for each time this query was submitted. Length of query.frequency.
 * {string?} query.response: The cached ChatGPT response for a query, or null if one does not exist.
 * @param {string} query The query to retrieve the data for.
 * @param {string?} property Optionally return a specific property from the choices listed above.
 * @returns {object} The query's data as specifiied above, or its specified property if provided.
 */
function retrieveQuery(query, property=undefined) {
    if (query in queryToData) {
        var data = queryToData[query]
        if (property != undefined && property in data) {
            return queryToData[query][property]
        }
        return queryToData[query]
    } else {
        console.log("Query not found.")
        return null
    }

}

/**
 * Caches a ChatGPT response into the query.response field.
 * @param {string} query The query that was submitted.
 * @param {string} response The ChatGPT response for that query.
 */
function cacheResponse(query, response) {
    if (query in queryToData) {
        queryToData[query].response = response
    } else {
        console.log("Query not found")
    }
}

/**
 * Stores the data object in RAM back into a locally hosted json file.
 * Should be called whenever the server terminates.
 */
function writeDataToJson() {
    fs.writeFileSync("./data/mock_data.json", JSON.stringify(data, null, 4), function(err) {
        if (err) {
            console.log(err);
        }
    });
}

/**
 * Autocompletes a user's input based on the data in the database and a weighing model.
 * Uses a mixture of length, frequency, and matched words to determine the best suggestions.
 * If no input is given, then will prioritize suggesting the most frequently asked questions.
 * @param {string} input The user input to autocomplete.
 * @param {string} [priority = 'length' | 'frequency' | 'similarity'] The priority for the weighting function.
 * @param {number} [num = 20] The number of queries to return.
 * @returns {Object[]} A list of objects which contains a query and its relevant data.
 */
function autocomplete(input, priority='length', num=20) {
    if (data == null) {
        return []
    }

    var saniteizedInput = input.replaceAll(/[&/\\#,+()$~%.^'":*?<>{}]/g, "")
    var stopWordsRemoved = removeStopwords(saniteizedInput)
    try {
        var prefix = new RegExp(`^${saniteizedInput}`, 'i')
        var pattern = new RegExp(`${saniteizedInput}`, 'i')
        var similarity = new RegExp("(?<= |-|_)" + stopWordsRemoved.replace(/ /gi,"(?= |-|_)|(?<= |-|_)"), 'gi')
    } catch (err) {
        console.log("Error forming regular expression on user input")
        console.log(err.message)
        return []
    }

    var matchesDict = {}

    if (input == '') {
        priority = 'frequency'
    }

    if (stopWordsRemoved != '') {
        var wordMatches = data.filter(d => d.query.search(similarity) >= 0)
        for (i in wordMatches) {
            var matchedWords = wordMatches[i].query.match(similarity).length
            matchesDict[wordMatches[i].query] = matchedWords
        }
    }

    var prefixMatches = data.filter(d => d.query.search(prefix) >= 0)
    var topSuggestions = prefixMatches.sort((a, b) => customSort(a, b, priority, matchesDict))
    if (topSuggestions.length >= num) {
        return topSuggestions.splice(0, num)
    }

    var patternMatches = data.filter(d => d.query.search(pattern) >= 0)
    var patternSuggestions = patternMatches.sort((a, b) => customSort(a, b, priority, matchesDict))
    topSuggestions = topSuggestions.concat(patternSuggestions)
    topSuggestions = topSuggestions.filter((item, idx) => topSuggestions.indexOf(item) == idx)
    if (topSuggestions.length >= num) {
        return topSuggestions.splice(0, num)
    }

    var similaritySuggestions = wordMatches.sort((a, b) => customSort(a, b, priority, matchesDict))
    topSuggestions = topSuggestions.concat(similaritySuggestions)
    topSuggestions = topSuggestions.filter((item, idx) => topSuggestions.indexOf(item) == idx)

    return topSuggestions.splice(0, num)
}

stopwords = ['i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves','he','him','his','himself','she','her','hers','herself','it','its','itself','they','them','their','theirs','themselves','what','which','who','whom','this','that','these','those','am','is','are','was','were','be','been','being','have','has','had','having','do','does','did','doing','a','an','the','and','but','if','or','because','as','until','while','of','at','by','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','s','t','can','will','just','don','should','now']
function removeStopwords(str) {
    var res = []
    var words = str.split(' ')
    for(i=0;i<words.length;i++) {
       var wordClean = words[i].split(".").join("")
       if(!stopwords.includes(wordClean.toLowerCase())) {
           res.push(wordClean)
       }
    }
    return(res.join(' '))
}

function countWords(str) {
    return str.trim().split(/\s+/).length;
}

function customSort(a, b, priority='length', matchesDict = undefined) {
    var lengthWeight = countWords(a.query) - countWords(b.query)
    var frequencyWeight = b.frequency - a.frequency < 0 ? -Math.pow(Math.abs(b.frequency - a.frequency), 0.66) : Math.pow(b.frequency - a.frequency, 0.66)
    var similarityWeight = !matchesDict || !(b.query in matchesDict) || !(a.query in matchesDict) ? 0 : (matchesDict[b.query] - matchesDict[a.query]) * 3

    if (priority == 'frequency') {
        return lengthWeight * 0.25 + frequencyWeight * 0.5 + similarityWeight * 0.25
    } else if (priority == 'similarity') {
        return lengthWeight * 0.25 + frequencyWeight * 0.5 + similarityWeight * 0.25
    } else {
        return lengthWeight * 0.5 + frequencyWeight * 0.25 + similarityWeight * 0.25
    }
}

function randomizeData() {
    for (i in data) {
        data[i].frequency =  1 + Math.floor(Math.random() * 3) +
                             20 * Math.floor(Math.random() * (1 + 0.002*countWords(data[i].query))) +
                             10 * Math.floor(Math.random() * (1 + 0.01*countWords(data[i].query))) +
                             5 * Math.floor(Math.random() * (1 + 0.02*countWords(data[i].query)))

    }
}

console.log(retrieveQuery("what is the principle of superposition for lti systems?"))
console.log(retrieveQuery("what is the principle of superposition for lti systems?", "users"))
start = Date.now()
val = autocomplete('what are fir filt')
end = Date.now()
console.log(val)
console.log(end - start)