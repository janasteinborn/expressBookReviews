const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios'); // added this for task 10


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Check if username already exists
  if (users.some(user => user.username === username)) {
    return res.status(409).json({ message: "Username already exists. Please choose another." });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully." });
});

// Get the book list available in the shop
// TASK 10: Getting the list of books using async/await with Axios
public_users.get('/', async (req, res) => {
    try {
      const response = await axios.get('http://localhost:5000/');
      res.status(200).json(response.data);
    } catch (error) {
      res.status(500).json({ message: "Error fetching book list" });
    }
  });

// Get book details based on ISBN
// TASK 11: Getting book details based on ISBN using async/await with Axios
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    
    try {
      const response = await axios.get(`http://localhost:5000/bookdetails/${isbn}`);
      return res.status(200).json(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return res.status(404).json({ message: "Book not found for the provided ISBN" });
      } else {
        return res.status(500).json({ message: "Error retrieving book details" });
      }
    }
  });
  
// Get book details based on author
// TASK 12: Get book details based on author using async/await with Axios
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;
    
    try {
      const response = await axios.get(`http://localhost:5000/authordetails/${author}`);
      return res.status(200).json(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return res.status(404).json({ message: "No books found by the given author." });
      } else {
        return res.status(500).json({ message: "Error retrieving books by author." });
      }
    }
  });

// Get all books based on title
// TASK 13: Get all books based on title using async/await with Axios
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;
  
    try {
      const response = await axios.get(`http://localhost:5000/titledetails/${title}`);
      return res.status(200).json(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return res.status(404).json({ message: "No books found with the given title." });
      } else {
        return res.status(500).json({ message: "Error retrieving books by title." });
      }
    }
  });

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
  
    if (book) {
      return res.status(200).json(book.reviews);
    } else {
      return res.status(404).json({ message: "Book not found for the provided ISBN." });
    }
});

module.exports.general = public_users;
