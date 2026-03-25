require('dotenv').config();

const { parseTweets } = require('./parseArchive');
const { loadExclusions } = require('./parseExclusions');

const excludeSet = loadExclusions(process.env.EXCLUDE_FILE);

const CONFIG = {
    DELAY: 20,
    DRY_RUN: true,
    LIMIT: 50
};

async function main() {
    const tweets = parseTweets(process.env.ARCHIVE_PATH);

    const batch = tweets.slice(0, CONFIG.LIMIT);
    const skipStats = { retweet: 0, missingId: 0};

    console.log(`Processing ${batch.length} tweets..\n`);

    for (let i=0; i < batch.length; i++) {
        const tweet = batch[i];

        if (!tweet.id) {
            skipStats.missingId++;
            console.log(`SKIP [missingId]`);
            continue;
        }

        if (excludeSet.has(tweet.id)) {
            skipStats.excluded = (skipStats.excluded || 0) + 1;
            console.log(`SKIP [excluded]: ${tweet.id} ${tweet.full_text}`);
            continue;
        }

        if (tweet.isRetweet) {
            skipStats.retweet++;
            console.log(`SKIP [retweet]: ${tweet.id}`);
            continue;
        }

        console.log(`[${i + 1}] ${tweet.full_text}`);

    }

}

main();