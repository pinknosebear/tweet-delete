function buildDeleteRequest(tweetId, auth) {
    const QUERY_ID = auth.QUERY_ID;

    return {
        url: `https://x.com/i/api/graphql/${QUERY_ID}/DeleteTweet`,
        options: {
            method: 'POST',
            headers: {
                'authorization': auth.BEARER_TOKEN,
                'x-csrf-token': auth.CSRF_TOKEN,
                'cookie': auth.COOKIE,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                variables: { tweet_id: tweetId },
                queryId: QUERY_ID
            })
        }
    };
}

async function executeRequest(req) {
    const res = await fetch(req.url, req.options);
    const text = await res.text();

    console.log("STATUS:", res.status);
    console.log("BODY:", text);

    return res.ok;
}

module.exports = { buildDeleteRequest, executeRequest };