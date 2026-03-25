require('dotenv').config();

const { parseTweets } = require('./parseArchive');
const { loadExclusions } = require('./parseExclusions');
const { buildDeleteRequest, executeRequest } = require('./deleteTweet');

const excludeSet = loadExclusions(process.env.EXCLUDE_FILE);

const CONFIG = {
    DELAY: 500,
    DRY_RUN: true,
    LIMIT: 1
};

async function main() {
    const tweets = parseTweets(process.env.ARCHIVE_PATH);
    const batch = tweets.slice(0, CONFIG.LIMIT);
 
    const skipStats = { retweet: 0, missingId: 0, excluded: 0};

    const auth = {
        QUERY_ID: process.env.QUERY_ID,
        BEARER_TOKEN: process.env.BEARER_TOKEN,
        CSRF_TOKEN: process.env.CSRF_TOKEN,
        COOKIE: process.env.COOKIE
    };

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

        const req = buildDeleteRequest(tweet.id, auth);
  

        if (!auth.BEARER_TOKEN || !auth.CSRF_TOKEN || !auth.COOKIE) {
            throw new Error("Missing auth headers");
        }
            
        if (CONFIG.DRY_RUN) {
            console.log("DRY RUN REQUEST:");
            console.log(JSON.stringify(req, null, 2));
        } else {
            const ok = await executeRequest(req);
            console.log(ok ? "✓" : "✗");
        }
        console.log("\nSKIP STATS:", skipStats);

        await new Promise(r => setTimeout(r, CONFIG.DELAY));
    }
}

main();