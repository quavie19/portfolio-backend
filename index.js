const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./db');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

//middleware
app.use(cors());
app.use(express.json()); //req.body

// firebase.js
const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require('./firebase-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'portfolio-d9319.firebasestorage.app',
});

//ROUTES

//post a blog post

//app.post('/new', ...): Defines a POST route at /new.
//upload.single('cover'): Middleware from multer that parses a single file upload from a form field named "cover".
// async (req, res) => { ... }: Asynchronous function that handles the request.
app.post('/new', upload.single('cover'), async (req, res) => {
  try {
    const { title, description, content } = req.body;
    const file = req.file;
    let imageUrl = null;
    // req.body: Gets form fields (title, description, content).
    // req.file: The uploaded image file parsed by multer.
    // imageUrl: Will store the URL of the uploaded image, if present.
    if (file) {
      //Checks if an image file was actually uploaded.
      const blob = bucket.file(Date.now() + '-' + file.originalname);
      // Creates a unique filename (timestamp + original name).
      // bucket.file(...): Prepares a Firebase Storage file reference.
      const blobStream = blob.createWriteStream({
        metadata: { contentType: file.mimetype },
      });
      // Prepares to upload the image as a stream.
      // Sets the MIME type (e.g., image/png).
      blobStream.end(file.buffer);
      //Sends the image's binary data to Firebase.
      await new Promise((resolve, reject) => {
        blobStream.on('finish', resolve);
        blobStream.on('error', reject);
      });
      //Waits for the upload to finish or fail.
      //This ensures we don’t continue until the image is fully uploaded.
      await blob.makePublic();
      //Makes the uploaded file publicly viewable.
      imageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    }
    // Constructs a public URL for the uploaded image.
    const newPost = await pool.query(
      'INSERT INTO posts (title, description, content, cover_photo) VALUES($1, $2, $3, $4) RETURNING *',
      [title, description, content, imageUrl]
    );

    res.status(201).json(newPost.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error creating blog post');
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
    console.error(err.message);
  }
});

//post contact
app.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newContact = await pool.query(
      'INSERT INTO contact_me (name, email, message) VALUES($1, $2, $3) RETURNING *',
      [name, email, message]
    );
    res.status(201).json(newContact.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

const bucket = admin.storage().bucket();

app.listen(8000, () => {
  console.log('server has started on port 8000');
});
