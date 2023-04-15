const fs = require('fs')
var data = require('./data/mock_data.json');
const { match } = require('assert');
const { query } = require('express');
exports.registerQuery = (query, user='unknown') => registerQuery(query, user)
exports.retrieveQuery = (query) => retrieveQuery(query)
exports.cacheResponse = (query, response) => cacheResponse(query, response)
exports.autocomplete = (input, priority='length', num=20) => autocomplete(input, priority, num);
exports.writeDataToJson = () => writeDataToJson()

var query_to_data = {}

for (i in data) {
    query_to_data[data[i].query] = data[i];
}

/**
 * Registers a new query.
 * If the query already existed in the database, will update it appropriately.
 * Else, it will create a new query.
 * @param {string} query The query to register.
 * @param {string} [user='unknown'] The user who submitted the query.
 */
function registerQuery(query, user='unknown') {
    if (query in query_to_data) {
        query_to_data[query].frequency += 1
        query_to_data[query].time_stamps.push(Date.now())
        query_to_data[query].users.push(user)
    } else {
        newData = {
            question: `${query}`,
            frequency: 1,
            time_stamps: [Date.now()],
            users: [`${user}`],
            response: null
        }
        data.push(newData)
        query_to_data[query] = newData
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
    if (query in query_to_data) {
        var data = query_to_data[query]
        if (property != undefined && property in data) {
            return query_to_data[query][property]
        }
        return query_to_data[query]
    } else {
        console.log("Query not found.")
    }

}

/**
 * Caches a ChatGPT response into the query.response field.
 * @param {string} query The query that was submitted.
 * @param {string} response The ChatGPT response for that query.
 */
function cacheResponse(query, response) {
    if (query in query_to_data) {
        query_to_data[query].response = response
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
 * @param {string} [priority = 'length' | 'frequency' | 'word'] The priority for the weighting function.
 * @param {number} [num = 20] The number of queries to return.
 * @returns {Object[]} A list of objects which contains a query and its relevant data.
 */
function autocomplete(input, priority='length', num=20) {
    if (data == null) {
        return []
    }

    var sanitized_input = input.replaceAll(/[&/\\#,+()$~%.^'":*?<>{}]/g, "")
    var stop_words_removed = remove_stopwords(sanitized_input)
    try {
        var prefix = new RegExp(`^${sanitized_input}`, 'i')
        var pattern = new RegExp(`${sanitized_input}`, 'i')
        var words = new RegExp("(?<= |-|_)" + stop_words_removed.replace(/ /gi,"(?= |-|_)|(?<= |-|_)"), 'gi')
    } catch (err) {
        console.log("Error forming regular expression on user input")
        console.log(err.message)
        return []
    }

    var matches_dict = {}

    if (input == '') {
        priority = 'frequency'
    }

    if (stop_words_removed != '') {
        var word_matches = data.filter(d => d.query.search(words) >= 0)
        for (i in word_matches) {
            var matched_words = word_matches[i].query.match(words).length
            matches_dict[word_matches[i].query] = matched_words
        }
    }

    var prefix_matches = data.filter(d => d.query.search(prefix) >= 0)
    top_suggestions = prefix_matches.sort((a, b) => custom_sort(a, b, priority, matches_dict))
    if (top_suggestions.length >= num) {
        return top_suggestions.splice(0, num)
    }

    var pattern_matches = data.filter(d => d.query.search(pattern) >= 0)
    top_suggestions_2 = pattern_matches.sort((a, b) => custom_sort(a, b, priority, matches_dict))
    top_suggestions = top_suggestions.concat(top_suggestions_2)
    top_suggestions = top_suggestions.filter((item, idx) => top_suggestions.indexOf(item) == idx)
    if (top_suggestions.length >= num) {
        return top_suggestions.splice(0, num)
    }

    top_suggestions_3 = word_matches.sort((a, b) => custom_sort(a, b, priority, matches_dict))
    top_suggestions = top_suggestions.concat(top_suggestions_3)
    top_suggestions = top_suggestions.filter((item, idx) => top_suggestions.indexOf(item) == idx)

    return top_suggestions.splice(0, num)
}

stopwords = ['i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves','he','him','his','himself','she','her','hers','herself','it','its','itself','they','them','their','theirs','themselves','what','which','who','whom','this','that','these','those','am','is','are','was','were','be','been','being','have','has','had','having','do','does','did','doing','a','an','the','and','but','if','or','because','as','until','while','of','at','by','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','s','t','can','will','just','don','should','now']
function remove_stopwords(str) {
    res = []
    words = str.split(' ')
    for(i=0;i<words.length;i++) {
       word_clean = words[i].split(".").join("")
       if(!stopwords.includes(word_clean.toLowerCase())) {
           res.push(word_clean)
       }
    }
    return(res.join(' '))
}

function countWords(str) {
    return str.trim().split(/\s+/).length;
}

function custom_sort(a, b, priority='length', matches_dict = undefined) {
    lengthWeight = countWords(a.query) - countWords(b.query)
    frequencyWeight = b.frequency - a.frequency < 0 ? -Math.pow(Math.abs(b.frequency - a.frequency), 0.66) : Math.pow(b.frequency - a.frequency, 0.66)
    wordWeight = !matches_dict || !(b.query in matches_dict) || !(a.query in matches_dict) ? 0 : (matches_dict[b.query] - matches_dict[a.query]) * 3

    if (priority == 'frequency') {
        return lengthWeight * 0.25 + frequencyWeight * 0.5 + wordWeight * 0.25
    } else if (priority == 'word') {
        return lengthWeight * 0.25 + frequencyWeight * 0.5 + wordWeight * 0.25
    } else {
        return lengthWeight * 0.5 + frequencyWeight * 0.25 + wordWeight * 0.25
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

start = Date.now()
val = autocomplete('what are fir filt')
end = Date.now()
console.log(val)
console.log(end - start)