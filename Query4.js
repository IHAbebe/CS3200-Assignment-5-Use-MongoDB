// Query4.js
// Who are the top 10 people with the highest AVERAGE retweets,
// among users who tweeted MORE THAN 3 times?
//
// Each tweet has a "retweet_count" field showing how many times it was retweeted.
// We calculate the average retweet_count per user,
// then filter out anyone who tweeted 3 times or fewer.

const { MongoClient } = require("mongodb");

const URI  = "mongodb://localhost:27017";
const DB   = "ieeevisTweets";
const COLL = "tweet";

async function main() {
  const client = new MongoClient(URI);
  await client.connect();

  const collection = client.db(DB).collection(COLL);

  const results = await collection.aggregate([
    // For each user, count their tweets and average their retweet_count
    {
      $group: {
        _id:               "$user.screen_name",
        tweet_count:       { $sum: 1 },
        avg_retweet_count: { $avg: "$retweet_count" }
      }
    },
    // Only keep users who tweeted more than 3 times
    {
      $match: { tweet_count: { $gt: 3 } }
    },
    // Sort by highest average retweets first
    { $sort: { avg_retweet_count: -1 } },
    // Top 10 only
    { $limit: 10 },
    {
      $project: {
        _id:               0,
        screen_name:       "$_id",
        tweet_count:       1,
        avg_retweet_count: { $round: ["$avg_retweet_count", 2] }
      }
    }
  ]).toArray();

  console.log("Top 10 users by average retweets (more than 3 tweets):\n");
  results.forEach((r, i) => {
    console.log(`${i + 1}. @${r.screen_name} - avg retweets: ${r.avg_retweet_count} (${r.tweet_count} tweets)`);
  });

  await client.close();
}

main();
