

A Node.js CLI tool that bulk-deletes tweets from your X (Twitter) archive by calling X's internal GraphQL API. This branch adds real deletion on top of the dry-run scaffold in `main`.

---

## How it works

1. Parses your X archive file (`tweets.js`) into a list of tweets
2. Loads an optional exclusion list of tweet IDs/URLs to protect
3. Filters out retweets and excluded tweets
4. Builds a GraphQL `DeleteTweet` request using your browser session credentials
5. In **dry-run mode** (default): logs the request that *would* be sent
6. In **live mode**: fires the request and reports success/failure per tweet

---

## ⚠️ Before you run

- **This tool uses your browser session credentials** — treat them like a password. Never commit your `.env` file.
- Start with `DRY_RUN: true` (the default) and verify the output looks right before switching to live mode.
- The default `LIMIT` is `1` — deliberately conservative. Increase it only once you've confirmed it's working correctly.
- X may rate-limit or flag your account for bulk API activity. Use a reasonable `DELAY`.

---

## Prerequisites

- Node.js v18+
- Your X data archive ([request it here](https://twitter.com/settings/download_your_data))
- Browser session credentials from X (see [Getting credentials](#getting-credentials))

---

## Setup

```bash
git clone https://github.com/pinknosebear/tweet-delete.git
cd tweet-delete
git checkout feature/delete
npm install
```

Copy the example env file:

```bash
cp .env.example .env
```

---

## Getting credentials

You'll need to extract these from your browser while logged into X.

1. Open [x.com](https://x.com) in your browser and log in
2. Open DevTools → **Network** tab
3. Delete any tweet manually to trigger a `DeleteTweet` request
4. Click on that request and find the following in the **Request Headers**:

| `.env` variable | Header to copy |
|---|---|
| `BEARER_TOKEN` | `authorization` |
| `CSRF_TOKEN` | `x-csrf-token` |
| `COOKIE` | `cookie` |
| `QUERY_ID` | The ID in the URL path: `.../graphql/<QUERY_ID>/DeleteTweet` |

These credentials are session-based and will expire when you log out.

---

## Environment variables

| Variable | Description |
|---|---|
| `BEARER_TOKEN` | X API bearer token from request headers |
| `CSRF_TOKEN` | CSRF token from request headers |
| `COOKIE` | Full cookie string from request headers |
| `QUERY_ID` | GraphQL query ID from the DeleteTweet endpoint URL |
| `ARCHIVE_PATH` | Path to your `tweets.js` file (default: `./data/tweets.js`) |
| `EXCLUDE_FILE` | Path to exclusion list (default: `./data/exclude.txt`) — optional |

---

## Usage

Place your `tweets.js` file at the path set in `ARCHIVE_PATH`, then run:

```bash
npm start
# or
bash scripts/run.sh
```

### Dry run (default)

With `DRY_RUN: true`, each tweet is logged alongside the request that *would* be sent — nothing is deleted:

```
Processing 1 tweets..

[1] this tweet would be deleted
DRY RUN REQUEST:
{
  "url": "https://x.com/i/api/graphql/.../DeleteTweet",
  ...
}

SKIP STATS: { retweet: 0, missingId: 0, excluded: 0 }
```

### Live deletion

When you're confident, open `src/main.js` and set:

```js
const CONFIG = {
    DELAY: 500,     // ms between deletions — don't set this too low
    DRY_RUN: false, // ← flip this
    LIMIT: 1        // increase once confirmed working
};
```

Re-run, and each deletion will log `✓` or `✗`.

---

## Exclusion list

Create a plain text file (one entry per line) with tweet IDs or full tweet URLs you want to keep:

```
1234567890
https://twitter.com/user/status/9876543210
```

Both formats are supported. Set its path in `EXCLUDE_FILE`.

---

## Project structure

```
tweet-delete/
├── src/
│   ├── main.js              # Entry point — orchestrates the run
│   ├── deleteTweet.js       # Builds and fires the X GraphQL delete request
│   ├── parseArchive.js      # Parses tweets.js into tweet objects
│   └── parseExclusions.js   # Loads and normalizes the exclusion list
├── scripts/
│   └── run.sh               # Convenience shell script
├── .env.example             # Environment variable template
└── package.json
```

---