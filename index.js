const express = require('express');
const router = express.Router();
const Book = require('../models/book');

// Главная страница с выводом списка книг
router.get('/', async (req, res) => {
    const books = await Book.getAllBooks();
    // Передаем информацию о пользователе вместе с книгами
    res.render('index', { books, userId: req.session.userId });
});

module.exports = router;
