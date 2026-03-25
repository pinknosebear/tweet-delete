const fs = require('fs');

function parseTweets(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const pattern = 'window.YTD.tweets.part0 = ';
    const start = content.indexOf(pattern);

    let json = content.substring(start + pattern.length).replace(/;\s*$/, '');

    const data = JSON.parse(json);

    return data.map(item => ({
        id: item.tweet.id_str,
        created_at: item.tweet.created_at,
        full_text: item.tweet.full_text,
        isRetweet: item.tweet.full_text?.startsWith('RT @') ?? false
    }));
}

module.exports = { parseTweets };