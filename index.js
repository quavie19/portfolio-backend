const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./db');

//middleware
app.use(cors());
app.use(express.json()); //req.body

//ROUTES

//post a blog post

app.post('/new', async (req, res) => {
  try {
    const { title, description, content } = req.body;
    const newPost = await pool.query(
      'INSERT INTO posts (title, description, content) VALUES($1, $2, $3) RETURNING *',
      [title, description, content]
    );
    res.json(newPost.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

//get all posts
app.get('/posts', async (req, res) => {
  try {
    const allPosts = await pool.query('SELECT * FROM posts');
    res.json(allPosts.rows);
  } catch (err) {
    console.error(err.message);
  }
});

// get a post
app.get('/post/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const post = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);

    res.json(post.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

//update a post
app.put('/post/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, content } = req.body;
    const updatePost = await pool.query(
      'UPDATE posts SET title = $1, description = $2, content = $3 WHERE id = $4',
      [title, description, content, id]
    );

    res.json('post was updated!');
  } catch (err) {
    console.error(err.message);
  }
});

//delete a post
app.delete('/post/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletePost = await pool.query('DELETE FROM posts WHERE id = $1', [
      id,
    ]);
    res.json('Post was deleted!');
  } catch (err) {
    console.log(err.message);
  }
});

app.listen(8000, () => {
  console.log('server has started on port 8000');
});
