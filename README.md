# CS3200-Assignment-5-Use-MongoDB

What each query does
Query1.js — Counts tweets that are not retweets and not replies.
Query2.js — Returns the top 10 users by number of followers.
Query3.js — Finds the user who posted the most tweets in the dataset.
Query4.js — Finds the top 10 users with the highest average retweets, only counting users who tweeted more than 3 times.
Query5.js — Splits the data into two cleaner collections:

users — one document per unique user
tweets_only — all tweets, with the user object replaced by a user_id reference

Overview
In this assignment you will be using Node to query and modify a Mongo Document Database. We will be creating a database

Loading the data (20pts)

Download the tweets generated during the 2020 ieeevis Conference  https://johnguerra.co/viz/influentials/ieeevis2020/ieeevis2020Tweets.dump.bz2Links to an external site..
Unzip the file. You can unzip this file using KekaLinks to an external site. or 7zipLinks to an external site.. After extraction you should have a .dump
Import the file using mongoimport
mongoimport -h localhost:27017 -d ieeevisTweets -c tweet --file ieeevis2020Tweets.dump
Create a folder, enter that folder and run npm init
Write node scripts for each one for each one of the following tasks. Name each file with the query number, e.g. Query1.js
