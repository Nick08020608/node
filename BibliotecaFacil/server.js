const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

// Configuración del servidor
const app = express();
const PORT = 3000;
const SECRET_KEY = 'your_secret_key';

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Conexión a la base de datos SQLite
const db = new sqlite3.Database(':memory:');

// Crear tablas
db.serialize(() => {
    db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT UNIQUE, password TEXT)");
    db.run("CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, author TEXT, genre TEXT, available INTEGER)");
});

// Ruta de registro de usuarios
app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    const stmt = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
    stmt.run(name, email, hashedPassword, function(err) {
        if (err) {
            return res.status(400).send("Error al registrar usuario.");
        }
        res.status(201).send({ id: this.lastID });
    });
    stmt.finalize();
});

// Ruta de inicio de sesión
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
        if (err || !user) {
            return res.status(400).send("Usuario no encontrado.");
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).send("Contraseña incorrecta.");
        }

        const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: 86400 }); // 24 horas
        res.status(200).send({ auth: true, token });
    });
});

// Middleware de autenticación
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Ruta de búsqueda de libros
app.get('/books', (req, res) => {
    const { title, author, genre } = req.query;
    let query = "SELECT * FROM books WHERE available = 1";
    const params = [];

    if (title) {
        query += " AND title LIKE ?";
        params.push(`%${title}%`);
    }
    if (author) {
        query += " AND author LIKE ?";
        params.push(`%${author}%`);
    }
    if (genre) {
        query += " AND genre LIKE ?";
        params.push(`%${genre}%`);
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).send("Error al buscar libros.");
        }
        res.status(200).send(rows);
    });
});

// Inicializar la base de datos con algunos datos
db.serialize(() => {
    const insert = 'INSERT INTO books (title, author, genre, available) VALUES (?, ?, ?, ?)';
    db.run(insert, ['El Quijote', 'Miguel de Cervantes', 'Novela', 1]);
    db.run(insert, ['Cien Años de Soledad', 'Gabo', 'Novela', 2]);
    db.run(insert, ['Don Juan Tenorio', 'José Zorrilla', 'Drama', 3]);
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Prestamos de libros
app.post('/loans', (req, res) => {
    const { userId, bookId, loanDate, returnDate } = req.body;

    const stmt = db.prepare("INSERT INTO loans (userId, bookId, loanDate, returnDate) VALUES (?, ?, ?, ?)");
    stmt.run(userId, bookId, loanDate, returnDate, function(err) {
        if (err) {
            return res.status(400).send("Error al solicitar préstamo.");
        }

        db.run("UPDATE books SET available = 0 WHERE id = ?", [bookId], (err) => {
            if (err) {
                return res.status(500).send("Error al actualizar disponibilidad del libro.");
            }
            res.status(201).send({ id: this.lastID });
        });
    });
    stmt.finalize();
});

// Renovacion de prestamos
app.put('/loans/:id', (req, res) => {
    const { returnDate } = req.body;
    const loanId = req.params.id;

    const stmt = db.prepare("UPDATE loans SET returnDate = ? WHERE id = ?");
    stmt.run(returnDate, loanId, function(err) {
        if (err) {
            return res.status(400).send("Error al renovar préstamo.");
        }
        res.status(200).send("Préstamo renovado exitosamente.");
    });
    stmt.finalize();
});

// Devolucion de libros
app.delete('/loans/:id', (req, res) => {
    const loanId = req.params.id;

    db.get("SELECT bookId FROM loans WHERE id = ?", [loanId], (err, loan) => {
        if (err || !loan) {
            return res.status(400).send("Préstamo no encontrado.");
        }

        db.run("DELETE FROM loans WHERE id = ?", [loanId], (err) => {
            if (err) {
                return res.status(500).send("Error al devolver préstamo.");
            }

            db.run("UPDATE books SET available = 1 WHERE id = ?", [loan.bookId], (err) => {
                if (err) {
                    return res.status(500).send("Error al actualizar disponibilidad del libro.");
                }
                res.status(200).send("Libro devuelto exitosamente.");
                });
                });
                });
                });
                