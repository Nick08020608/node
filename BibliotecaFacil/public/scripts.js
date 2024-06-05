document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('content');

    // Función para mostrar el formulario de inicio de sesión
    function showLoginForm() {
        content.innerHTML = `
            <h2>Iniciar Sesión</h2>
            <form id="loginForm">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required>
                <label for="password">Contraseña:</label>
                <input type="password" id="password" name="password" required>
                <button type="submit">Iniciar Sesión</button>
            </form>
            <p>¿No tienes una cuenta? <a href="#" id="showRegister">Regístrate aquí</a></p>
        `;

        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const res = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('token', data.token);
                alert('Inicio de sesión exitoso');
                showBookSearch();
            } else {
                alert('Error al iniciar sesión');
            }
        });

        document.getElementById('showRegister').addEventListener('click', (e) => {
            e.preventDefault();
            showRegisterForm();
        });
    }

    // Función para mostrar el formulario de registro de usuarios
    function showRegisterForm() {
        content.innerHTML = `
            <h2>Registro de Usuario</h2>
            <form id="registerForm">
                <label for="name">Nombre:</label>
                <input type="text" id="name" name="name" required>
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required>
                <label for="password">Contraseña:</label>
                <input type="password" id="password" name="password" required>
                <button type="submit">Registrarse</button>
            </form>
            <p>¿Ya tienes una cuenta? <a href="#" id="showLogin">Inicia sesión aquí</a></p>
        `;

        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const res = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });

            if (res.ok) {
                alert('Registro exitoso');
                showLoginForm();
            } else {
                alert('Error al registrarse');
            }
        });

        document.getElementById('showLogin').addEventListener('click', (e) => {
            e.preventDefault();
            showLoginForm();
        });
    }

    // Función para mostrar el formulario de búsqueda de libros
    function showBookSearch() {
        content.innerHTML = `
            <h2>Buscar Libros</h2>
            <form id="searchForm">
                <label for="title">Título:</label>
                <input type="text" id="title" name="title">
                <label for="author">Autor:</label>
                <input type="text" id="author" name="author">
                <label for="genre">Género:</label>
                <input type="text" id="genre" name="genre">
                <button type="submit">Buscar</button>
            </form>
            <div id="results"></div>
        `;

        document.getElementById('searchForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('title').value;
            const author = document.getElementById('author').value;
            const genre = document.getElementById('genre').value;

            const res = await fetch(`http://localhost:3000/books?title=${title}&author=${author}&genre=${genre}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (res.ok) {
                const books = await res.json();
                const results = document.getElementById('results');
                results.innerHTML = books.map(book => `
                    <div>
                        <h3>${book.title}</h3>
                        <p>Autor: ${book.author}</p>
                        <p>Género: ${book.genre}</p>
                        <p>Disponible: ${book.available ? 'Sí' : 'No'}</p>
                    </div>
                `).join('');
            } else {
                alert('Error al buscar libros');
            }
        });

        // Agregar funcionalidades de préstamo, renovación y devolución aquí
        // Prestamo de libros
        document.getElementById('searchForm').addEventListener('click', async (e) => {
            if (e.target && e.target.className == 'loan-btn') {
                const bookId = e.target.dataset.bookId;
                const loanDate = new Date().toISOString().split('T')[0];
                const returnDate = ''; // Establecer la fecha de devolución aquí, por ejemplo: '2024-06-30'
                const userId = ''; // Obtener el ID de usuario del token de autenticación

                const res = await fetch('http://localhost:3000/loans', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ userId, bookId, loanDate, returnDate })
                });

                if (res.ok) {
                    alert('Préstamo solicitado con éxito');
                } else {
                    alert('Error al solicitar préstamo');
                }
            }
        });

        // Renovación de préstamos
        document.getElementById('searchForm').addEventListener('click', async (e) => {
            if (e.target && e.target.className == 'renew-btn') {
                const loanId = e.target.dataset.loanId;
                const returnDate = ''; // Establecer la nueva fecha de devolución aquí

                const res = await fetch(`http://localhost:3000/loans/${loanId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ returnDate })
                });

                if (res.ok) {
                    alert('Préstamo renovado exitosamente');
                } else {
                    alert('Error al renovar préstamo');
                }
            }
        });

        // Devolución de libros
        document.getElementById('searchForm').addEventListener('click', async (e) => {
            if (e.target && e.target.className == 'return-btn') {
                const loanId = e.target.dataset.loanId;

                const res = await fetch(`http://localhost:3000/loans/${loanId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (res.ok) {
                    alert('Libro devuelto exitosamente');
                } else {
                    alert('Error al devolver libro');
                }
            }
        });
    }

    // Mostrar el formulario de inicio de sesión al cargar la página
    showLoginForm();
});

