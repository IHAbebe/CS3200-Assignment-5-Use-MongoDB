// Query2.js
// Who are the top 10 users by number of followers?
//
// Each tweet has a "user" object inside it.
// That user object has a "followers_count" field.
// We group by screen_name and sort by followers to find the top 10.

const { MongoClient } = require("mongodb");

const URI  = "mongodb://localhost:27017";
const DB   = "ieeevisTweets";
const COLL = "tweet";

async function main() {
  const client = new MongoClient(URI);
  await client.connect();

  const collection = client.db(DB).collection(COLL);

  const results = await collection.aggregate([
    // Group by screen_name, keep the highest followers_count seen
    {
      $group: {
        _id:             "$user.screen_name",
        followers_count: { $max: "$user.followers_count" }
      }
    },
    // Sort by most followers first
    { $sort: { followers_count: -1 } },
    // Only keep the top 10
    { $limit: 10 },
    // Rename _id to screen_name for cleaner output
    {
      $project: {
        _id:             0,
        screen_name:     "$_id",
        followers_count: 1
      }
    }
  ]).toArray();

  console.log("Top 10 users by followers:\n");
  results.forEach((r, i) => {
    console.log(`${i + 1}. @${r.screen_name} - ${r.followers_count} followers`);
  });

  await client.close();
}

main();
