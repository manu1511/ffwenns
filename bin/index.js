#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const dbConnect = require("../util/dbConnect");
const wp = require("../migrate/wordpress");
const Post = require("../models/post");

const AWS = require("aws-sdk");
const colors = require("colors");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

const upload = async (attachments, sid) => {
  return await Promise.all(
    attachments.map(async (attachment, i) => {
      const fileName = path.basename(attachment);
      const fileContent = fs.readFileSync(
        `${process.env.WP_ROOT}/${attachment}`
      );

      const res = await s3
        .upload({
          Bucket: process.env.AWS_S3_BUCKET,
          Body: fileContent,
          Key: `posts/wordpress/${sid}_${fileName}`,
          ACL: "public-read",
        })
        .promise()
        .then((data) => {
          const status = `[${i + 1}/${attachments.length}]`;
          const action = "Upload".yellow;

          console.log(`${status} ${action}: ${fileName}`);

          return data;
        });

      return res;
    })
  );
};

dbConnect().then(async (mongo) => {
  await wp.posts(5).then(async (posts) => {
    await Promise.all(
      posts.map(async ({ attachments, sid, ...post }, i) => {
        const postExists = await Post.findOne({ sid });

        if (postExists) return;

        const newPost = new Post({
          ...post,
          attachments: attachments && (await upload(attachments, sid)),
          sid,
        });

        await newPost.save().then(() => {
          const status = `[${i + 1}/${posts.length}]`;
          const action = "Save post".green;

          console.log(`${status} ${action}: ${post.title}`);
        });
      })
    );
  });

  await mongo.connection.close();
});
