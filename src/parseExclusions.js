const fs = require('fs');

// url domain/user/status/id?query_params -> extract only id 

function extractTweetId(input) {
    // match /status/<id> and return only id
    const match = input.match(/status\/(\d+)/);
    if (match) return match[1];

    // if exluded data is just the ids
    if (/^\d+$/.test(input)) return input;

    return null;
}

function loadExclusions(filePath) {
    if (!fs.existsSync(filePath)) return new Set;

    const lines = fs.readFileSync(filePath, 'utf-8').split('\n').map(l => l.trim())

    const ids = lines.map(extractTweetId).filter(Boolean);

    return new Set(ids);
}

module.exports = { loadExclusions }