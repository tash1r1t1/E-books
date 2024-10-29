const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Регистрация
router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        console.log(`Attempting to register user with email: ${email}`);
        
        // Проверка существующего пользователя
        const existingUser = await User.findByUsername(email);
        if (existingUser) {
            console.log('User already exists');
            return res.status(400).send('User already exists');
        }

        // Регистрация нового пользователя
        const userId = await User.register(email, password);
        console.log(`User registered with ID: ${userId}`);

        res.redirect('/auth/login');
    } catch (error) {
        console.error('Error registering user:', error.message);
        res.status(500).send('Error registering user: ' + error.message);
    }
});
// Логин
router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        console.log(`Attempting to login with email: ${email}`);
        
        // Поиск пользователя по email
        const user = await User.findByUsername(email);
        if (!user) {
            console.log('Invalid email');
            return res.status(401).send('Invalid email or password');
        }

        // Проверка пароля
        const validPassword = await User.validatePassword(user, password);
        if (!validPassword) {
            console.log('Invalid password');
            return res.status(401).send('Invalid email or password');
        }

        // Успешный вход
        req.session.userId = user.id; // Пример сохранения пользователя в сессии
        console.log('Login successful');
        res.redirect('/');
    } catch (error) {
        console.error('Error logging in:', error.message);
        res.status(500).send('Error logging in: ' + error.message);
    }
});

// Логаут
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
