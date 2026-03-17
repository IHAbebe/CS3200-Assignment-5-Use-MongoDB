// Query3.js
// Who posted the most tweets in this dataset?
//
// We group all tweets by the author's screen_name
// and count how many tweets each person has.
// Then we sort to find the one with the highest count.

const { MongoClient } = require("mongodb");

const URI  = "mongodb://localhost:27017";
const DB   = "ieeevisTweets";
const COLL = "tweet";

async function main() {
  const client = new MongoClient(URI);
  await client.connect();

  const collection = client.db(DB).collection(COLL);

  const results = await collection.aggregate([
    // Count how many tweets each user posted
    {
      $group: {
        _id:         "$user.screen_name",
        tweet_count: { $sum: 1 }
      }
    },
    // Put the highest count first
    { $sort: { tweet_count: -1 } },
    // We only need the #1 result
    { $limit: 1 },
    {
      $project: {
        _id:         0,
        screen_name: "$_id",
        tweet_count: 1
      }
    }
  ]).toArray();

  const winner = results[0];
  console.log(`Most tweets: @${winner.screen_name} with ${winner.tweet_count} tweets`);

  await client.close();
}

main();
