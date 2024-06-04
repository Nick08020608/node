// Importamos la dependencia sqlite
const sqlite3 = require("sqlite3");

// Establecemos la conexion con la base de datos
const db = new sqlite3.Database("src/db/biblioteca.db", (err) => {
    // Condiciones para errores
    if (err) {
        console.error("Error connecting to database:", err.message);
        return;
    }
    console.log("Connection to database established successfully.");
});

// Creamos las tablas
db.run(
  `CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_usuario TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    correo_electronico TEXT UNIQUE NOT NULL,
    contraseña TEXT NOT NULL
  )`,
  (err) => {
    if (err) {
      console.error("Error creating usuarios table:", err.message);
    } else {
      console.log("usuarios table created successfully.");
    }
  }
);

db.run(
  `CREATE TABLE IF NOT EXISTS libros (
    id_libro INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    autor TEXT NOT NULL,
    fecha_publicacion DATE NOT NULL,
    genero TEXT NOT NULL
  )`,
  (err) => {
    if (err) {
      console.error("Error creating libros table:", err.message);
    } else {
      console.log("libros table created successfully.");
    }
  }
);

db.run(
  `CREATE TABLE IF NOT EXISTS prestamos (
    id_prestamo INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    id_libro INTEGER NOT NULL,
    fecha_prestamo DATE NOT NULL,
    fecha_devolucion DATE NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_libro) REFERENCES libros(id_libro)
  )`,
  (err) => {
    if (err) {
      console.error("Error creating prestamos table:", err.message);
    } else {
      console.log("prestamos table created successfully.");
    }
  }
);

db.run(
  `CREATE TABLE IF NOT EXISTS renovaciones (
    id_renovacion INTEGER PRIMARY KEY AUTOINCREMENT,
    id_prestamo INTEGER NOT NULL,
    fecha_renovacion DATE NOT NULL,
    FOREIGN KEY (id_prestamo) REFERENCES prestamos(id_prestamo)
  )`,
  (err) => {
    if (err) {
      console.error("Error creating renovaciones table:", err.message);
    } else {
      console.log("renovaciones table created successfully.");
    }
  }
);

// Cerramos la conexion con la base de datos
db.close((err) => {
  if (err) {
    console.error("Error closing database connection:", err.message);
  } else {
    console.log("Database connection closed successfully.");
  }
});
