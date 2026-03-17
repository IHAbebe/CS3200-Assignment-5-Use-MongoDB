// Query5.js
// Split the user information out into its own collection.
//
// Right now every tweet document has the full user object embedded inside it.
// That means the same user's info is repeated across hundreds of tweets — wasteful.
//
// We will create two new collections:
//   "users"       — one document per unique user
//   "tweets_only" — all the tweets, but with the user object removed
//                   and replaced by just a "user_id" that points to the users collection

const { MongoClient } = require("mongodb");

const URI  = "mongodb://localhost:27017";
const DB   = "ieeevisTweets";
const COLL = "tweet";

async function main() {
  const client = new MongoClient(URI);
  await client.connect();

  const db = client.db(DB);

  // ── STEP 1: Create the "users" collection ──────────────────────────────────
  console.log("Step 1: Building the users collection...");

  // Drop first so the script can be re-run without errors
  await db.collection("users").drop().catch(() => {});

  await db.collection(COLL).aggregate([
    // Move the user object to the top level of each document
    { $replaceRoot: { newRoot: "$user" } },
    // Group by user id so we only keep one copy of each user
    {
      $group: {
        _id:             "$id",
        id:              { $first: "$id" },
        screen_name:     { $first: "$screen_name" },
        name:            { $first: "$name" },
        description:     { $first: "$description" },
        followers_count: { $first: "$followers_count" },
        friends_count:   { $first: "$friends_count" },
        statuses_count:  { $first: "$statuses_count" },
        created_at:      { $first: "$created_at" },
        location:        { $first: "$location" },
        verified:        { $first: "$verified" }
      }
    },
    // Write all results into a new collection called "users"
    { $out: "users" }
  ]).toArray();

  const userCount = await db.collection("users").countDocuments();
  console.log(`Done! Created ${userCount} unique users.\n`);

  // ── STEP 2: Create the "tweets_only" collection ────────────────────────────
  console.log("Step 2: Building the tweets_only collection...");

  await db.collection("tweets_only").drop().catch(() => {});

  await db.collection(COLL).aggregate([
    // Add a new field "user_id" that stores just the user's id number
    {
      $addFields: { user_id: "$user.id" }
    },
    // Remove the full embedded user object — we don't need it anymore
    {
      $unset: "user"
    },
    // Write all results into a new collection called "tweets_only"
    { $out: "tweets_only" }
  ]).toArray();

  const tweetCount = await db.collection("tweets_only").countDocuments();
  console.log(`Done! Created ${tweetCount} tweets in tweets_only.\n`);

  // ── STEP 3: Quick check — join a tweet back to its user ────────────────────
  console.log("Step 3: Testing the reference with a sample $lookup...");

  const sample = await db.collection("tweets_only").aggregate([
    { $limit: 1 },
    // $lookup is like a JOIN — match user_id in tweets to id in users
    {
      $lookup: {
        from:         "users",
        localField:   "user_id",
        foreignField: "id",
        as:           "user_info"
      }
    },
    { $unwind: "$user_info" },
    {
      $project: {
        _id:             0,
        tweet_text:      "$text",
        user_id:         1,
        screen_name:     "$user_info.screen_name",
        followers_count: "$user_info.followers_count"
      }
    }
  ]).toArray();

  console.log("Sample result:\n", JSON.stringify(sample[0], null, 2));
  console.log("\nAll done! Collections created: 'users' and 'tweets_only'.");

  await client.close();
}

main();
