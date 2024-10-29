const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const app = express();

// Подключение роутов
const indexRoutes = require('./routes/index');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');  
const bookRoutes = require('./routes/book'); 

// Настройка шаблонизатора EJS
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Роуты
app.use('/', indexRoutes);
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes); 
app.use('/books', bookRoutes);
// Запуск сервера
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});
