const multer = require('multer');
const upload = multer({ dest: 'Uploads/' });
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
const { Console } = require('console');
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bd_solicitud'
});

const iniciarSesion = function(req, res) {
  const rutUsuario = req.body.rut;
  const password = req.body.password;

  pool.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json(err);
    }

    conn.query('SELECT * FROM usuario WHERE rut = ?', [rutUsuario], (err, results) => {
      conn.release();

      if (err) {
        return res.status(500).json(err);
      }

      if (results.length === 0) {
        // Usuario no encontrado
        return res.status(404).send('Usuario no encontrado'); // Enviar un mensaje de error
      }

      const user = results[0];
      
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          console.log("error?", err);
          return res.status(500).json(err);
        }

        if (result) {
          console.log("tipo de usuario", user.id_tipo_usuario);
          // Contraseña correcta, redireccionar a la página de inicio del usuario
          switch (user.id_tipo_usuario) {
            case 1: // 1 correspondiente a Estudiantes
              return res.redirect('/Inicio_Estudiante');
            case 2: // 2 correspondiente a Administradores
              console.log('hola -<');
              return res.redirect('/Inicio_admin');
            case 3: // 3 correspondiente al comité
              return res.redirect('/Inicio_Comite');
            default:
              
              return res.redirect('/inicio'); // agregar página de usuario sin rol
          }
        } else {
          
          // Contraseña incorrecta
          
          return res.redirect('/');
        }
      });
    });
  });
};

const registros_admin = (req, res) => {
  res.render('registros');
};

const registrarUsuario = function(req, res) {
  const { nombre, correo, rut_reg, dv_rut, password_reg, tipo_usuario } = req.body;

  // Generar el hash de la contraseña
  bcrypt.hash(password_reg, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Error al encriptar la contraseña:', err);
      return res.status(500).send('Error al encriptar la contraseña');
    }
    console.log('rut', rut_reg);
    console.log('Contraseña ingresada:', password_reg);
    console.log('Contraseña cifrada:', hashedPassword);

    pool.getConnection((err, conn) => {
      if (err) {
        return res.status(500).send('Error en la conexión a la base de datos');
      }

      // Verificar que el tipo de usuario sea válido
      const tipoUsuarioValido = ['Estudiante', 'Comite', 'Administrador'];
      if (!tipoUsuarioValido.includes(tipo_usuario)) {
        console.error('Tipo de usuario no válido:', tipo_usuario);
        return res.status(400).send('Tipo de usuario no válido');
      }

      // Obtener el id_tipo_usuario según el tipo seleccionado
      conn.query('SELECT id_tipo_usuario FROM tipo_usuario WHERE tipo = ?', [tipo_usuario], (err, results) => {
        if (err) {
          console.error('Error al obtener el id_tipo_usuario:', err);
          return res.status(500).send('Error al obtener el id_tipo_usuario: ' + err.message);
        }

        // Verificar que se encontró el id_tipo_usuario
        if (results.length > 0) {
          const id_tipo_usuario = results[0].id_tipo_usuario;

          // Crear el objeto de datos del usuario
          const usuario = {
            nombre: nombre,
            correo_electronico: correo,
            rut: rut_reg,
            rut_id: dv_rut,
            password: hashedPassword,
            id_tipo_usuario: id_tipo_usuario
          };
          console.log('tipo usuario-->', id_tipo_usuario);

          conn.query('INSERT INTO usuario SET ?', usuario, (err, result) => {
            if (err) {
              console.error('Error al registrar el usuario:', err);
              return res.status(500).send('Error al registrar el usuario: ' + err.message);
            }

            // Redireccionar a la página de inicio de sesión después del registro exitoso
            res.redirect('/login');
          });
        } else {
          console.error('No se encontró ningún tipo de usuario con el nombre:', tipo_usuario);
          return res.status(500).send('No se encontró ningún tipo de usuario con el nombre: ' + tipo_usuario);
        }
      });

      conn.release();
    });
  });
};


const mostrarInicio = (req, res) => {
  res.render('inicio');
};

const mostrarFormularioLogin = function(req, res) {
  res.render('login');
};

const mostrarInicioComite = function(req, res) {
  pool.getConnection((err, conn) => {
    if (err) {
      return res.status(500).send('Error en la conexión a la base de datos');
    }

    conn.query('SELECT * FROM consultoria', (err, consultorias) => {
      if (err) {
        return res.status(500).send('Error al obtener las consultorías: ' + err.message);
      }

      // Renderizar la vista con los datos obtenidos
      res.render('Inicio_Comite', { consultorias: consultorias });
    });

    conn.release();
  });
};

const mostrarInicioAdmin = function(req, res) {
  pool.getConnection((err, conn) => {
    if (err) {
      console.log('dentro del err');
      return res.status(500).send('Error en la conexión a la base de datos');
      
    }

    conn.query('SELECT * FROM usuario', (err, usuarios) => {
      if (err) {
        return res.status(500).send('Error al obtener los usuarios: ' + err.message);
      }

      conn.query('SELECT * FROM consultoria', (err, consultorias) => {
        if (err) {
          return res.status(500).send('Error al obtener las consultorías: ' + err.message);
        }

        // Renderizar la vista con los datos obtenidos
        res.render('Inicio_admin', { usuarios: usuarios, consultorias: consultorias });
      });
    });

    conn.release();
  });
};

const subirConsultoria = function(req, res) {
  const file = req.file;
  const nombreArchivo = req.body['file-name'];

  if (!file || !nombreArchivo) {
    return res.status(400).send('Debe ingresar el nombre del archivo y cargar un archivo válido.');
  }

  pool.getConnection((err, conn) => {
    if (err) {
      return res.status(500).send('Error en la conexión a la base de datos');
    }

    const consultoria = {
      nombre_archivo: nombreArchivo,
      documento_archivo: fs.readFileSync(file.path),
      fecha_subida_archivo: new Date(),
      id_usuario: req.session.usuarioId
    };

    conn.query('INSERT INTO consultoria SET ?', consultoria, (err, result) => {
      if (err) {
        console.error('Error al subir la consultoría:', err);
        return res.status(500).send('Error al subir la consultoría: ' + err.message);
      }

      // Intentar borrar el archivo temporal
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error('Hubo un error al intentar eliminar el archivo:', err);
      }

      // Redireccionar a la página de inicio del estudiante después de la subida exitosa
      res.redirect('/Inicio_Estudiante');
    });

    conn.release();
  });
};

const obtenerUsuariosConConsultorias = function (req, res) {
  pool.getConnection((err, conn) => {
    if (err) {
      return res.status(500).send('Error en la conexión a la base de datos');
    }

    const query = `
      SELECT usuario.*, consultoria.nombre_archivo, consultoria.fecha_subida_archivo, notas.nota
      FROM usuario
      LEFT JOIN consultoria ON usuario.id_usuario = consultoria.id_usuario
      LEFT JOIN notas ON consultoria.id_consultoria = notas.id_consultoria
    `;

    conn.query(query, (err, results) => {
      if (err) {
        return res.status(500).send('Error al obtener los usuarios y consultorías: ' + err.message);
      }

      const usuariosConsultorias = {};

      // Agrupar las consultorías por usuario
      results.forEach((row) => {
        const usuarioId = row.id_usuario;

        if (!usuariosConsultorias[usuarioId]) {
          usuariosConsultorias[usuarioId] = {
            usuario: {
              id: row.id_usuario,
              nombre: row.nombre,
              correo_electronico: row.correo_electronico,
              rut: row.rut,
            },
            consultorias: [],
          };
        }

        const consultoria = {
          id: row.id_consultoria,
          nombre_archivo: row.nombre_archivo,
          fecha_subida_archivo: row.fecha_subida_archivo,
          nota: row.nota,
        };

        usuariosConsultorias[usuarioId].consultorias.push(consultoria);
      });

      // Renderizar la vista 'Inicio_admin' con los datos obtenidos
      res.render('Inicio_admin', { usuariosConsultorias: Object.values(usuariosConsultorias) });
    });

    conn.release();
  });
};


// Código para eliminar un usuario y todas sus consultorias asociadas
const eliminarUsuario = function(req, res) {
  const id_usuario = req.body.id_usuario;

  pool.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json(err);
    }

    conn.query('DELETE FROM usuario WHERE id_usuario = ?', [id_usuario], (err, results) => {
      conn.release();

      if (err) {
        return res.status(500).json(err);
      }

      return res.status(200).json({ message: 'Usuario eliminado correctamente' });
    });
  });
};


const mostrarInicioEstudiante = function(req, res) {
  res.render('Inicio_Estudiante');
};

const obtenerConsultoria = function(req, res) {
  const id_consultoria = req.params.id;

  pool.getConnection((err, conn) => {
    if (err) {
      return res.status(500).send('Error en la conexión a la base de datos');
    }

    conn.query('SELECT * FROM consultoria WHERE id_consultoria = ?', [id_consultoria], (err, consultorias) => {
      if (err) {
        return res.status(500).send('Error al obtener la consultoría: ' + err.message);
      }

      // Renderizar la vista con los datos obtenidos
      res.render('consultoria', { consultoria: consultorias[0] });
    });

    conn.release();
  });
};

const eliminarConsultoria = function(req, res) {
  const id_consultoria = req.params.id;

  pool.getConnection((err, conn) => {
    if (err) {
      return res.status(500).send('Error en la conexión a la base de datos');
    }

    conn.query('DELETE FROM consultoria WHERE id_consultoria = ?', [id_consultoria], (err, result) => {
      if (err) {
        return res.status(500).send('Error al eliminar la consultoría: ' + err.message);
      }

      // Redirigir al usuario a la página del comité después de la eliminación
      res.redirect('/Inicio_Comite');
    });

    conn.release();
  });
};


module.exports = {
  iniciarSesion,
  registrarUsuario,
  mostrarInicio,
  mostrarFormularioLogin,
  mostrarInicioComite,
  mostrarInicioAdmin,
  mostrarInicioEstudiante,
  subirConsultoria,
  obtenerUsuariosConConsultorias,
  eliminarUsuario,
  obtenerConsultoria,
  eliminarConsultoria,
  registros_admin,
  upload
};
