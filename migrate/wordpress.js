const mysql = require("mysql2");
const dotenv = require("dotenv").config();
const { unserialize } = require("php-serialize");

const con = mysql.createConnection(process.env.MYSQL_URI);

const getAttachments = async (post) => {
  const query = "SELECT guid FROM wp_posts WHERE id IN (?)";
  const [rows] = await con
    .promise()
    .query(query, [unserialize(post.attachments)]);

  return rows.map((row) => new URL(row.guid).pathname);
};

const getPosts = async (limit) => {
  const query = `
    SELECT id, post_date, post_title, post_name, post_type,
    MAX(CASE WHEN meta_key='text' THEN meta_value END) AS post_text,
    MAX(CASE WHEN meta_key='bilder' THEN meta_value END) AS attachments
    FROM wp_posts JOIN wp_postmeta ON post_id=id
    WHERE post_type IN ('einsaetze', 'uebungen', 'taetigkeiten') 
    AND post_status='publish' GROUP BY id ORDER BY post_date
    ${limit ? `LIMIT ${limit}` : ""}`;

  const [rows] = await con.promise().query(query);

  return await Promise.all(
    rows.map(async (row) => ({
      date: row.post_date,
      title: row.post_title,
      content: row.post_text,
      category: row.post_type,
      attachments: row.attachments && (await getAttachments(row)),
      source: "wordpress",
    }))
  ).then(con.end());
};

module.exports = {
  posts: getPosts,
};
