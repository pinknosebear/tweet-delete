const fs = require("fs");

function prepareCurlTemplate(path) {
    let raw = fs.readFileSync(path, "utf8");

    // 1. Remove line continuations "\" completely
    raw = raw.replace(/\\\n/g, " ");

    // 2. Collapse newlines → single line
    raw = raw.replace(/\n/g, " ");

    // 3. Normalize spacing
    raw = raw.replace(/\s+/g, " ").trim();

    // 4. Replace tweet_id dynamically (auto, no manual step needed)
    const dataRegex = /--data-raw\s+'([^']+)'/;

    const match = raw.match(dataRegex);
    if (!match) {
        throw new Error("Could not find --data-raw JSON payload in curl");
    }

    let json;
    try {
        json = JSON.parse(match[1]);
    } catch (e) {
        throw new Error("Invalid JSON inside --data-raw");
    }

    if (!json.variables || !json.variables.tweet_id) {
        throw new Error("tweet_id not found in payload");
    }

    json.variables.tweet_id = "%TWEET_ID%";

    const newData = `--data-raw '${JSON.stringify(json)}'`;

    // 5. Replace original payload with templated one
    raw = raw.replace(dataRegex, newData);

    return raw;
}

module.exports = { prepareCurlTemplate };