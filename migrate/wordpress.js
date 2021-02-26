const url = require("url");
const path = require("path");
const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const query = `
    SELECT id, post_date, post_title, post_name, post_type,
    MAX(CASE WHEN meta_key='text' THEN meta_value END) AS post_text,
    MAX(CASE WHEN meta_key='bilder' THEN meta_value END) AS attachments
    FROM wp_posts JOIN wp_postmeta ON post_id=id
    WHERE post_type IN ('einsaetze', 'uebungen', 'taetigkeiten') 
    AND post_status='publish'
    GROUP BY id
    LIMIT 5`;

const con = mysql.createConnection(process.env.MYSQL_URI);

const attachments = async (post) => {
  const pattern = /".*?"/g;
  const ids = post.attachments
    .match(pattern)
    .map((id) => parseInt(id.slice(1, -1)));

  const attachments = await con
    .promise()
    .query("SELECT guid FROM wp_posts WHERE id IN (?)", [ids]);

  const [rows] = attachments;
  const urls = [];

  rows.map((row) => {
    const url = new URL(row.guid);
    urls.push(url.pathname);
  });

  return urls;
};

const posts = async () => {
  const [rows] = await con.promise().query(query);
  const posts = await Promise.all(
    rows.map(async (row) => {
      const rows = await attachments(row);

      return {
        date: row.post_date,
        title: row.post_title,
        content: row.post_text,
        categories: row.post_type,
        attachments: row.attachments && rows,
        source: "wordpress",
      };
    })
  );

  return posts;
};

posts().then((posts) => {
  posts.map((post) => {
    console.log(posts);
  });

  con.end();
});
