// Query1.js
// How many tweets are NOT retweets or replies?
//
// - Retweets have a field called "retweeted_status" in the document
// - Replies have a value in "in_reply_to_status_id"
// - We want tweets where neither of those exist

const { MongoClient } = require("mongodb");

const URI  = "mongodb://localhost:27017";  // local MongoDB address
const DB   = "ieeevisTweets";             // our database
const COLL = "tweet";                     // our collection

async function main() {
  const client = new MongoClient(URI);
  await client.connect();

  const collection = client.db(DB).collection(COLL);

  // Count tweets that are not retweets AND not replies
  const count = await collection.countDocuments({
    retweeted_status:      { $exists: false },  // no retweet field
    in_reply_to_status_id: null                 // no reply id
  });

  console.log("Tweets that are not retweets or replies:", count);

  await client.close();
}

main();
