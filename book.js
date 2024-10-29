const express = require('express');
const router = express.Router();
const Book = require('../models/book');

// Функция для получения ID книги по ISBN
async function getBookIdByISBN(isbn) {
    try {
        const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
        console.log("Fetching book data from:", url); // Логируем запрос
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(url);
        const data = await response.json();
        console.log("Fetched data:", data); // Логируем данные
        const key = `ISBN:${isbn}`;
        if (data[key]) {
            const book = data[key];
            return {
                url: book.url || book.info_url || null,
                title: book.title || "No title available",
                author: book.authors ? book.authors.map(a => a.name).join(", ") : "No author available",
                description: book.description || "No description available",
                coverUrl: book.cover ? book.cover.large || book.cover.medium || "No cover available" : "No cover available"
            };
        }
        return null;
    } catch (error) {
        console.error("Error fetching book data:", error);
        return null;
    }
}




// Функция для получения данных книги по ID
async function getBookData(bookId) {
    try {
        const url = `https://openlibrary.org${bookId}.json`;
        console.log("Fetching book data from:", url); // Логируем запрос
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(url);
        const data = await response.json();
        console.log("Fetched book data:", data); // Логируем данные
        return data;
    } catch (error) {
        console.error("Error fetching book data:", error);
        return {};
    }
}


// Маршрут для получения книги по ISBN
router.get('/book/:isbn', async (req, res) => {
    console.log("Entered /book/:isbn route");

    const isbn = req.params.isbn;
    console.log("Requested ISBN:", isbn);

    const bookData = await getBookIdByISBN(isbn);
    console.log("Book data:", bookData);

    if (bookData && bookData.url) {
        res.render('book', { book: bookData });
    } else {
        console.error("Book not found for ISBN:", isbn);
        res.status(404).send('Book not found');
    }
});


router.get('/:id', async (req, res) => {
    const bookId = req.params.id;
    try {
        const book = await Book.findById(bookId);
        if (book) {
            res.render('book', { book });
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
});

module.exports = router;
