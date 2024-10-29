// Імпортуємо bcryptjs для хешування паролів
const bcrypt = require('bcryptjs');

// Імпортуємо sqlite3 з можливістю використання розширених функцій
const sqlite3 = require('sqlite3').verbose();

// Ініціалізуємо базу даних SQLite, вказуючи шлях до файлу бази даних
const db = new sqlite3.Database('./db/database.sqlite');

// Виконуємо ініціалізацію бази даних
db.serialize(() => {
    // Створюємо таблицю users, якщо вона не існує
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,  // Унікальний ідентифікатор користувача
        username TEXT UNIQUE,                  // Ім'я користувача, яке повинно бути унікальним
        password TEXT                          // Зашифрований пароль
    )`);
});

// Клас User для роботи з користувачами у базі даних
class User {
    // Метод для реєстрації нового користувача
    static async register(username, password) {
        // Хешуємо пароль перед збереженням у базу даних
        const hashedPassword = await bcrypt.hash(password, 10);
        return new Promise((resolve, reject) => {
            // Виконуємо SQL-запит для вставки нового користувача в таблицю users
            db.run(
                'INSERT INTO users (username, password) VALUES (?, ?)',
                [username, hashedPassword],  // Вставляємо ім'я користувача та хеш пароля
                function (err) {
                    if (err) {
                        reject(err);  // Відхиляємо проміс у випадку помилки
                    }
                    resolve(this.lastID);  // Повертаємо ID нового користувача
                }
            );
        });
    }

    // Метод для пошуку користувача за його ім'ям
    static async findByUsername(username) {
        return new Promise((resolve, reject) => {
            // Виконуємо SQL-запит для отримання користувача за заданим ім'ям
            db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
                if (err) {
                    reject(err);  // Відхиляємо проміс у випадку помилки
                }
                resolve(row);  // Повертаємо знайдений запис (користувача)
            });
        });
    }

    // Метод для перевірки валідності пароля користувача
    static async validatePassword(user, password) {
        // Порівнюємо вказаний пароль з хешем пароля користувача з бази даних
        return bcrypt.compare(password, user.password);
    }
}

// Експортуємо клас User для використання в інших модулях
module.exports = User;
