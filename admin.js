const express = require('express');
const router = express.Router();
const Book = require('../models/book'); // Путь к вашей модели книги

// Middleware для проверки авторизации
function ensureAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/auth/login');
}

// Админка: добавление новой книги
router.get('/', ensureAuthenticated, async (req, res) => {
    const books = await Book.getAllBooks();
    res.render('admin', { books });
});



router.post('/add', ensureAuthenticated, async (req, res) => {
    const { title, author, year, description, coverUrl } = req.body;
    await Book.addBook(title, author, year, description, coverUrl);
    res.redirect('/admin');
});

router.post('/delete/:id', ensureAuthenticated, async (req, res) => {
    await Book.deleteBook(req.params.id);
    res.redirect('/admin');
});

router.get('/edit/:id', async (req, res) => {
    const bookId = req.params.id;
    try {
        const book = await Book.findById(bookId);
        res.render('edit', { book });
    } catch (error) {
        console.error(error);
        res.redirect('/admin');
    }
});

// Маршрут для обработки данных формы редактирования
router.post('/edit/:id', async (req, res) => {
    const bookId = req.params.id;
    const { title, author, year, description } = req.body;

    try {
        // Обновляем данные книги
        await Book.update(bookId, { title, author, year, description });

        // Пытаемся найти новую обложку через API
        const query = `title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&limit=1`;
        const apiUrl = `https://openlibrary.org/search.json?${query}`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();

        let coverUrl = 'https://via.placeholder.com/200x300?text=No+Cover'; // По умолчанию

        if (data.docs.length > 0) {
            const book = data.docs[0];
            const coverId = book.cover_i;
            if (coverId) {
                coverUrl = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
            }
        }

        // Обновляем URL обложки в базе данных, если изменился
        await Book.update(bookId, { title, author, year, description, coverUrl });

        res.redirect('/admin');
    } catch (error) {
        console.error(error);
        res.redirect('/admin/edit/' + bookId);
    }
});


module.exports = router;
