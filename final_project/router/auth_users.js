const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }
  
    if (!authenticatedUser(username, password)) {
      return res.status(401).json({ message: "Invalid username or password." });
    }
  
    const accessToken = jwt.sign(
      { username: username },
      "access",
      { expiresIn: '1h' }
    );
  
    req.session.authorization = { accessToken };
  
    return res.status(200).json({
      message: "User successfully logged in",
      accessToken: accessToken
    });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Initialize reviews object if it doesn't exist
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Add or update the user's review for this ISBN
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review successfully added/modified",
    book: books[isbn]
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
