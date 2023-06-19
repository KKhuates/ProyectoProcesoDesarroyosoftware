const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
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
  const rutUsuario = req.body.rut_inicio;
  const password = req.body.password_inicio;

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
        console.log("usuario no encontrado -->",results);
        console.log("usuario de la tabla",rutUsuario);
        return res.status(404).send('Usuario no encontrado'); // Enviar un mensaje de error
      }

      const user = results[0];
      console.log("resultado?",results[0]);
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          console.log("error?", err);
          return res.status(500).json(err);
        }

        if (result) {
          console.log("tipo de usuario", user.id_tipo_usuario);
          // Contraseña correcta, redireccionar a la página de inicio del usuario
          switch (user.id_tipo_usuario) {
            case 1: // 1 correspondiente a estudiantes
              return res.redirect('/Inicio_estudiante');
            case 2: // 2 correspondiente a administradores
              return res.redirect('/Inicio_admin');
            case 3: // 3 correspondiente al comité
              return res.redirect('/Inicio_comite');
            default:
              return res.redirect('/inicio'); // agregar página de usuario sin rol
          }
        } else {
          console.log("contraseña password ->", password);
          console.log("contraseña user.password ->", user.password);
          // Contraseña incorrecta
          console.log("Contraseña incorrecta");
          return res.redirect('/');
        }
      });
    });
  });
};




const registrarUsuario = function(req, res) {
  const { nombre, correo, rut_reg, dv_rut, password_reg } = req.body;

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

      // Aquí obtenemos el id_tipo_usuario para 'normal'
      conn.query('SELECT id_tipo_usuario FROM tipo_usuario WHERE tipo = ?', ['normal'], (err, results) => {
        if (err) {
          console.error('Error al obtener el id_tipo_usuario:', err);
          return res.status(500).send('Error al obtener el id_tipo_usuario: ' + err.message);
        }

        // Verificamos que obtuvimos al menos un resultado
        if (results.length > 0) {
          const id_tipo_usuario = results[0].id_tipo_usuario;

          // Crear el objeto de datos del usuario
          const usuario = {
            nombre: nombre,
            correo_electronico: correo,
            rut: rut_reg,
            rut_id: dv_rut,
            password: hashedPassword,
            id_tipo_usuario: id_tipo_usuario // Aquí insertamos el id_tipo_usuario en el objeto usuario
          };

          conn.query('INSERT INTO usuario SET ?', usuario, (err, result) => {
            if (err) {
              console.error('Error al registrar el usuario:', err);
              return res.status(500).send('Error al registrar el usuario: ' + err.message);
            }

            // Redireccionar a la página de inicio de sesión después del registro exitoso
            res.redirect('/inicio');
          });
        } else {
          console.error('No se encontró ningún tipo de usuario con el nombre "normal".');
          return res.status(500).send('No se encontró ningún tipo de usuario con el nombre "normal".');
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
      res.render('Inicio_comite', { consultorias: consultorias });
    });

    conn.release();
  });
};

const mostrarInicioAdmin = function(req, res) {
  pool.getConnection((err, conn) => {
    if (err) {
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

const mostrarFormularioSubirConsultoria = function(req, res) {
  res.render('subir_consultoria');
};

const subirConsultoria = function(req, res) {
  const file = req.file;
  const { titulo, descripcion } = req.body;

  if (!file) {
    return res.status(400).send('Debe cargar un archivo.');
  }

  pool.getConnection((err, conn) => {
    if (err) {
      return res.status(500).send('Error en la conexión a la base de datos');
    }

    const consultoria = {
      nombre_archivo: file.originalname,
      documento_archivo: fs.readFileSync(path.join(__dirname, '/../uploads/', file.filename)),
      fecha_subida_archivo: new Date(),
      id_usuario: req.session.userId
    };

    conn.query('INSERT INTO consultoria SET ?', consultoria, (err, result) => {
      if (err) {
        console.error('Error al subir la consultoría:', err);
        return res.status(500).send('Error al subir la consultoría: ' + err.message);
      }

      // Intentar borrar el archivo de la carpeta 'uploads'
      try {
        fs.unlinkSync(path.join(__dirname, '/../uploads/', file.filename));
      } catch (err) {
        console.error('Hubo un error al intentar eliminar el archivo:', err);
      }

      // Redireccionar a la página de inicio de sesión después del registro exitoso
      res.redirect('/Inicio_estudiante');
    });

    conn.release();
  });
};

const obtenerUsuariosConConsultorias = function(req, res) {
  pool.getConnection((err, conn) => {
    if (err) {
      return res.status(500).send('Error en la conexión a la base de datos');
    }

    const query = 'SELECT usuario.*, consultoria.* FROM usuario LEFT JOIN consultoria ON usuario.id_usuario = consultoria.id_usuario';
    conn.query(query, (err, results) => {
      if (err) {
        return res.status(500).send('Error al obtener los usuarios y consultorías: ' + err.message);
      }

      // Renderizar la vista 'admin' con los datos obtenidos
      res.render('admin', { usuariosConsultorias: results });
    });

    conn.release();
  });
};

const mostrarAdmin = function(req, res) {
  pool.getConnection((err, conn) => {
    if (err) {
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
        res.render('admin', { usuarios: usuarios, consultorias: consultorias });
      });
    });

    conn.release();
  });
};

// Código para eliminar un usuario y todas sus consultorias asociadas
const eliminarUsuario = function(req, res) {
  const id_usuario = req.params.id;

  pool.getConnection((err, conn) => {
    if (err) {
      return res.status(500).send('Error en la conexión a la base de datos');
    }

    conn.query('DELETE FROM consultoria WHERE id_usuario = ?', [id_usuario], (err, result) => {
      if (err) {
        return res.status(500).send('Error al eliminar las consultorias del usuario: ' + err.message);
      }

      conn.query('DELETE FROM usuario WHERE id_usuario = ?', [id_usuario], (err, result) => {
        if (err) {
          return res.status(500).send('Error al eliminar el usuario: ' + err.message);
        }

        // Redirigir al usuario a la página del admin después de la eliminación
        res.redirect('/admin');
      });
    });

    conn.release();
  });
};

const mostrarInicioEstudiante = function(req, res) {
  pool.getConnection((err, conn) => {
    if (err) {
      return res.status(500).send('Error en la conexión a la base de datos');
    }

    conn.query('SELECT * FROM usuario WHERE id_usuario = ?', [req.session.userId], (err, usuario) => {
      if (err) {
        return res.status(500).send('Error al obtener los datos del usuario: ' + err.message);
      }

      conn.query('SELECT * FROM consultoria WHERE id_usuario = ?', [req.session.userId], (err, consultorias) => {
        if (err) {
          return res.status(500).send('Error al obtener las consultorías: ' + err.message);
        }

        // Renderizar la vista con los datos obtenidos
        res.render('Inicio_estudiante', { usuario: usuario, consultorias: consultorias });
      });
    });

    conn.release();
  });
};

const obtenerConsultoria = function(req, res) {
  const id_consultoria = req.params.id;

  pool.getConnection((err, conn) => {
    if (err) {
      return res.status(500).send('Error en la conexión a la base de datos');
    }

    conn.query('SELECT * FROM consultoria WHERE id_consultoria = ?', [id_consultoria], (err, consultoria) => {
      if (err) {
        return res.status(500).send('Error al obtener la consultoría: ' + err.message);
      }

      // Renderizar la vista con los datos obtenidos
      res.render('consultoria', { consultoria: consultoria[0] });
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
      res.redirect('/Inicio_comite');
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
  mostrarFormularioSubirConsultoria,
  subirConsultoria,
  obtenerUsuariosConConsultorias,
  eliminarUsuario,
  mostrarAdmin,
  obtenerConsultoria,
  eliminarConsultoria,
  upload
};
