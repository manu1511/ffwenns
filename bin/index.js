#!/usr/bin/env node

const connect = require("../util/dbConnect");
const wp = require("../migrate/wordpress");
const Post = require("../models/post");

connect().then((mongoose) => {
  wp.posts(5).then((posts) => {
    console.log(posts);
  });

  console.log(mongoose.connection.close());
});
