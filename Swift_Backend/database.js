const fs = require("fs");
var data = require("./data/mock_data.json");
exports.registerQuery = (query, user = "unknown") => registerQuery(query, user);
exports.retrieveQuery = (query) => retrieveQuery(query);
exports.cacheResponse = (query, response) => cacheResponse(query, response);
exports.autocomplete = (input, priority = "length", num = 20) =>
  autocomplete(input, priority, num);
exports.writeDataToJson = () => writeDataToJson();

const queryToData = {};

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
function registerQuery(query, user = "unknown") {
  if (query in queryToData) {
    queryToData[query].frequency += 1;
    queryToData[query].time_stamps.push(Date.now());
    queryToData[query].users.push(user);
  } else {
    var newData = {
      question: `${query}`,
      frequency: 1,
      time_stamps: [Date.now()],
      users: [`${user}`],
      response: null,
    };
    data.push(newData);
    queryToData[query] = newData;
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
 * @returns {object?} The query's data as specifiied above, or its specified property if provided.
 */
function retrieveQuery(query, property = undefined) {
  if (query in queryToData) {
    var data = queryToData[query];
    if (property != undefined && property in data) {
      return queryToData[query][property];
    }
    return queryToData[query];
  } else {
    console.log("Query not found.");
    return null;
  }
}

/**
 * Caches a ChatGPT response into the query.response field.
 * @param {string} query The query that was submitted.
 * @param {string} response The ChatGPT response for that query.
 */
function cacheResponse(query, response) {
  if (query in queryToData) {
    queryToData[query].response = response;
  } else {
    console.log("Query not found");
  }
}

/**
 * Stores the data object in RAM back into a locally hosted json file.
 * Should be called whenever the server terminates.
 */
function writeDataToJson() {
  fs.writeFileSync(
    "./data/mock_data.json",
    JSON.stringify(data, null, 4),
    function (err) {
      if (err) {
        console.log(err);
      }
    }
  );
}

/**
 * Autocompletes a user's input based on the data in the database and a weighing model.
 * Uses a mixture of length, frequency, and matched words to determine the best suggestions.
 * If no input is given, then will prioritize suggesting the most frequently asked questions.
 * Includes a likelihood property.
 * @param {string} input The user input to autocomplete.
 * @param {string} [priority = 'length' | 'frequency' | 'similarity'] The priority for the weighting function.
 * @param {number} [num = 20] The number of queries to return.
 * @returns {Object[]} A list of objects which contains a query and its relevant data. Attaches a likelihood property as well.
 */
function autocomplete(input, weights = [1/3, 1/3, 1/3], num = 20) {
  if (data == null) {
    return [];
  }
  input = input.toLowerCase();
  input = input.trimStart();
  var sanitizedInput = input.replaceAll(/[&/\\#,+()$~%.^'":*?<>{}]/g, "");
  var stopWordsRemoved = removeStopwords(sanitizedInput);
  try {
    var prefix = new RegExp(`^${sanitizedInput}`, "i");
    var pattern = new RegExp(`${sanitizedInput}`, "i");
    var anyWord = /^$/;
    if (stopWordsRemoved != "") {
      var anyWordString = "(?<= |-|_)" + stopWordsRemoved.replace(/ (?!\B)/gi, "(?= |-|_|s )|(?<= |-|_)")
      if (input.charAt(input.length - 1) == " ") {
        anyWordString = anyWordString.trimEnd() + "(?= |-|_|\\?|\\.|s |)"
      }
      var anyWord = new RegExp(anyWordString, "gi")
    }
  } catch (err) {
    console.log("Error forming regular expression on user input");
    console.log(err.message);
    return [];
  }
  input = input.trim()

  var likelihoodDict = {}
  var inputLength = countWords(input)
  for (i in data) {
    var matchedWords = data[i].query.match(anyWord);
    var numMatchedWords = 0;
    var uniqueMatches = {};
    if (matchedWords != null) {
      matchedWords.forEach(match => {
        if (!uniqueMatches[match]) {
          uniqueMatches[match] = true;
          numMatchedWords++;
        }
      });
    }
    var likelihood = calculateLikelihood(data[i], inputLength, weights, numMatchedWords);
    likelihoodDict[data[i].query] = likelihood;
  }

  var prefixMatches = data.filter((d) => d.query.search(prefix) >= 0);
  var prefixSuggestions = prefixMatches.sort((a, b) =>
    customSort(a, b, likelihoodDict)
  );
  if (prefixSuggestions.length >= num) {
    return mergeSuggestions(likelihoodDict, prefixSuggestions);
  }

  var patternMatches = data.filter((d) => d.query.search(pattern) >= 0);
  var patternSuggestions = patternMatches.sort((a, b) =>
    customSort(a, b, likelihoodDict)
  );
  patternSuggestions = patternSuggestions.filter(
    (item) => !prefixSuggestions.includes(item)
  );
  if (prefixSuggestions.length + patternSuggestions.length >= num) {
    return mergeSuggestions(
      likelihoodDict,
      prefixSuggestions,
      patternSuggestions
    );
  }

  var wordMatches = data.filter((d) => d.query.search(anyWord) >= 0);
  var similaritySuggestions = wordMatches.sort((a, b) =>
    customSort(a, b, likelihoodDict)
  );
  similaritySuggestions = similaritySuggestions.filter(
    (item) =>
      !prefixSuggestions.includes(item) && !patternSuggestions.includes(item)
  );
  return mergeSuggestions(
    likelihoodDict,
    prefixSuggestions,
    patternSuggestions,
    similaritySuggestions,
    num
  );
}

// HELPER METHODS + EXAMPLE DRIVER CODE

function removeStopwords(str) {
  var res = [];
  var words = str.split(" ");
  for (i = 0; i < words.length; i++) {
    var wordClean = words[i].split(".").join("");
    if (!stopwords.includes(wordClean.toLowerCase())) {
      res.push(wordClean);
    }
  }
  return res.join(" ");
}

function countWords(str) {
  if (!str) return 0;
  return str.trim().split(/\s+/).length;
}

function calculateLikelihood(suggestion, inputLength, weights = [1/3, 1/3, 1/3], matches) {
  var lengthScore = Math.min(0, inputLength - countWords(suggestion.query));
  var frequencyScore = Math.pow(suggestion.frequency - 1, 0.66);
  var similarityScore = (matches - 1) * 6;
  return weights[0] * lengthScore + weights[1] * frequencyScore + weights[2] * similarityScore
}

function customSort(a, b, likelihoodDict) {
  return likelihoodDict[b.query] - likelihoodDict[a.query];
}

function mergeSuggestions(
  likelihoodDict,
  prefix,
  pattern = undefined,
  anyWord = undefined,
  num = 20
) {
  prefix = prefix.slice(0, num);
  if (pattern) {
    prefix = prefix.concat(pattern.slice(0, num - prefix.length));
  }

  if (anyWord) {
    prefix = prefix.concat(anyWord.slice(0, num - prefix.length));
  }
  attachLikelihoods(prefix, likelihoodDict);
  return prefix;
}

function attachLikelihoods(suggestionSlice, likelihoodDict) {
  for (i in suggestionSlice) {
    suggestionSlice[i].likelihood =
      likelihoodDict[suggestionSlice[i].query];
  }
}

/**
 * Initializes the databse with random frequencies.
 * Longer words have a higher chance to get higher frequencies to level the playing field.
 */
function randomizeData() {
  for (i in data) {
    data[i].frequency =
      1 +
      Math.floor(Math.random() * 3) +
      8 * Math.floor(Math.random() * (1 + 0.001 * countWords(data[i].query))) +
      5 * Math.floor(Math.random() * (1 + 0.01 * countWords(data[i].query))) +
      3 * Math.floor(Math.random() * (1 + 0.02 * countWords(data[i].query)));
  }
}

const stopwords = [
  "i",
  "me",
  "my",
  "myself",
  "we",
  "our",
  "ours",
  "ourselves",
  "you",
  "your",
  "yours",
  "yourself",
  "yourselves",
  "he",
  "him",
  "his",
  "himself",
  "she",
  "her",
  "hers",
  "herself",
  "it",
  "its",
  "itself",
  "they",
  "them",
  "their",
  "theirs",
  "themselves",
  "what",
  "which",
  "who",
  "whom",
  "this",
  "that",
  "these",
  "those",
  "am",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "having",
  "do",
  "does",
  "did",
  "doing",
  "a",
  "an",
  "the",
  "and",
  "but",
  "if",
  "or",
  "because",
  "as",
  "until",
  "while",
  "of",
  "at",
  "by",
  "for",
  "with",
  "about",
  "against",
  "between",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "to",
  "from",
  "up",
  "down",
  "in",
  "out",
  "on",
  "off",
  "over",
  "under",
  "again",
  "further",
  "then",
  "once",
  "here",
  "there",
  "when",
  "where",
  "why",
  "how",
  "all",
  "any",
  "both",
  "each",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "s",
  "t",
  "can",
  "will",
  "just",
  "don",
  "should",
  "now",
];

// input = "cosine signal addition"
// console.log("Input: %s-", input)
// start = new Date()
// a = autocomplete(input)
// end = new Date()
// b = []
// for (i in a) {
//   b.push({
//     query: a[i].query,
//     likelihood: Math.round(a[i].likelihood * 1000) / 1000,
//   })
// }
// console.log("Time: %d ms", end - start)
// console.log("Output:")
// console.log(b)
// console.log(end - start)