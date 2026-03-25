require("dotenv").config();
const fs = require("fs");
const { exec } = require("child_process");
const { runCurl } = require("./runCurl");

const { parseTweets } = require("./parseArchive");
const { loadExclusions } = require("./parseExclusions");
const { prepareCurlTemplate } = require("./parseCurlTemplate");

const excludeSet = loadExclusions("./data/exclude.txt");
const curlTemplate = prepareCurlTemplate("./data/rawCurl.txt");

const CONFIG = {
    DELAY: 5000,
    DRY_RUN: false,
    LIMIT: 2
};

async function main() {
    const tweets = parseTweets("./data/tweets.js");
    const batch = tweets.slice(0, CONFIG.LIMIT);
    const skipStats = { retweet: 0, missingId: 0, excluded: 0 };

    console.log(`Processing ${batch.length} tweets...\n`);

    for (let i = 0; i < batch.length; i++) {
        const tweet = batch[i];

        if (!tweet.id) {
            skipStats.missingId++;
            console.log("SKIP [missingId]");
            continue;
        }

        if (excludeSet.has(tweet.id)) {
            skipStats.excluded++;
            console.log(`SKIP [excluded]: ${tweet.id}`);
            continue;
        }

        if (tweet.isRetweet) {
            skipStats.retweet++;
            console.log(`SKIP [retweet]: ${tweet.id}`);
            continue;
        }

        console.log(`[${i + 1}] ${tweet.full_text}`);

        const command = curlTemplate.replace("%TWEET_ID%", tweet.id);

        if (CONFIG.DRY_RUN) {
            console.log("DRY RUN CURL:");
            console.log(command);
        } else {
            console.log("Executing curl...");
            const ok = await runCurl(command);
            console.log(ok ? "✓" : "✗");
            
        }

        console.log("\nSKIP STATS:", skipStats, "\n");
        await new Promise(r => setTimeout(r, CONFIG.DELAY));
    }
}

main();