const bcrypt = require('bcrypt');
const pool = require('./database');
const { render } = require('ejs');
const expressLayouts = require('express-ejs-layouts');

// Función para manejar errores
function handleError(res, error) {
  console.error(error);
  res.render('paginaerror', { error: 'Ha ocurrido un error.' });
}

exports.registro_get = async (req, res) => {
  res.render('registros', { layout: 'layout' });
};

exports.registro_post = async (req, res) => {
  try {
    const { nombre, correo, rut, dv, password, tipo_usuario } = req.body;

    let hashedPassword = await bcrypt.hash(password, 10);

    // Inserción del usuario
    const newUser = await pool.query(
      'INSERT INTO usuario (nombre, correo_electronico, password, rut, rut_id, id_tipo_usuario) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, correo, hashedPassword, rut, dv, tipo_usuario]
    );

    res.render('login', { layout: 'layout' });
  } catch (error) {
    handleError(res, error);
  }
};


exports.login_get = function (req, res) {
  res.render('login', { layout: 'layout' });
};

exports.login_post = function (req, res) {
  const { rut, password } = req.body;

  pool.query('SELECT * FROM usuario WHERE rut = ?', [rut], async function (err, result) {
    if (err) {
      handleError(res, err);
      return;
    }

    if (result.length > 0) {
      const user = result[0];

      const match = await bcrypt.compare(password, user.password);
      if (match) {
        req.session.userId = user.id_usuario; // iniciando sesión

        // Obtener el tipo de usuario
        pool.query('SELECT tipo FROM tipo_usuario WHERE id_tipo_usuario = ?', [user.id_tipo_usuario], function (err, result) {
          if (err) {
            handleError(res, err);
            return;
          }

          if (result.length > 0) {
            const tipoUsuario = result[0].tipo;
            
            // Redirigir al usuario a su página de inicio correspondiente
            switch (tipoUsuario) {
              case 'Estudiante':
                res.redirect('/inicio_estudiante');
                break;
              case 'Administrador':
                res.redirect('/inicio_admin');
                break;
              case 'Comite':
                res.redirect('/inicio_comite');
                break;
              default:
                handleError(res, new Error('Tipo de usuario no válido.'));
                break;
            }
          } else {
            handleError(res, new Error('No se encontró el tipo de usuario.'));
          }
        });
      } else {
        handleError(res, new Error('La contraseña no coincide.'));
      }
    } else {
      handleError(res, new Error('No se encontró el usuario.'));
    }
  });
};

exports.borrar_usuario = function(req, res) {
  const idUsuario = req.params.id;

  pool.query('DELETE FROM usuario WHERE id_usuario = ?', [idUsuario], function(err, result) {
    if (err) {
      handleError(res, err);
      return;
    }

    // Redirigir al usuario a la página de inicio correspondiente después del borrado
    res.redirect('/inicio_admin');
  });
};

exports.editar_usuario_get = function(req, res) {
  const idUsuario = req.params.id;

  pool.query('SELECT * FROM usuario WHERE id_usuario = ?', [idUsuario], function(err, result) {
    if (err) {
      handleError(res, err);
      return;
    }

    if (result.length > 0) {
      const usuario = result[0];

      // Renderizar la vista editar_user y proporcionar los datos del usuario a editar
      res.render('editar_user', { usuario });
    } else {
      res.render('paginaerror', { error: 'No se encontró el usuario.' });
    }
  });
};

exports.editar_usuario_post = async function(req, res) {
  const idUsuario = req.params.id;
  const { nombre, correo, rut, dv, password } = req.body;

  try {
    let hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar los datos del usuario
    pool.query('UPDATE usuario SET nombre = ?, correo_electronico = ?, password = ?, rut = ?, rut_id = ? WHERE id_usuario = ?', [nombre, correo, hashedPassword, rut, dv, idUsuario], function(err, result) {
      if (err) {
        handleError(res, err);
        return;
      }

      // Redirigir al usuario a la página de inicio correspondiente después de la edición
      res.redirect('/inicio_admin');
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.inicio_admin_get = function (req, res) {
  pool.query('SELECT * FROM usuario', function (err, result) {
    if (err) {
      handleError(res, err);
      return;
    }

    // Renderizar la vista inicio_admin y proporcionar los datos de los usuarios
    res.render('inicio_admin', { users: result, layout: 'layout' });
  });
};

exports.inicio_estudiante_get = function(req, res) {
  const idUsuario = req.session.userId;

  pool.query('SELECT * FROM consultoria WHERE id_usuario = ?', [idUsuario], function(err, result) {
    if (err) {
      handleError(res, err);
      return;
    }

    // Renderizar la vista inicio_estudiante y proporcionar los datos de las consultorías
    res.render('inicio_estudiante', { consultorias: result, layout: 'layout' });
  });
};

exports.cargar_consultoria_get = function(req, res) {
  // Renderizar la vista cargar_consultoria
  res.render('cargar_consultoria', { layout: 'layout' });
};

exports.cargar_consultoria_post = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const archivo = req.file;

    if (!archivo) {
      throw new Error('No se subió ningún archivo.');
    }

    const documento_archivo = archivo.buffer;
    const fecha_subida_archivo = new Date();
    const id_usuario = req.session.userId;

    // Inserción de la consultoría
    await pool.query(
      'INSERT INTO consultoria (nombre_archivo, documento_archivo, fecha_subida_archivo, id_usuario, id_estado_consultoria) VALUES (?, ?, ?, ?, ?)',
      [nombre, documento_archivo, fecha_subida_archivo, id_usuario, 1] // 1 es el estado 'ANALISANDO'
    );

    res.redirect('/inicio_estudiante');
  } catch (error) {
    handleError(res, error);
  }
};

exports.actualizar_consultoria_get = async (req, res) => {
  try {
    const id_consultoria = req.params.id; // Obtener el ID de la consultoría de los parámetros de la ruta

    // Obtener los datos de la consultoría
    const consultoria = await pool.query('SELECT * FROM consultoria WHERE id_consultoria = ?', [id_consultoria]);

    if (consultoria.length > 0) {
      res.render('actualizar_consultoria', { consultoria: consultoria[0] }); // Renderizar la vista actualizar_consultoria y proporcionar los datos de la consultoría
    } else {
      handleError(res, new Error('No se encontró la consultoría.'));
    }
  } catch (error) {
    handleError(res, error);
  }
};

exports.actualizar_consultoria_post = async (req, res) => {
  try {
    const id_consultoria = req.params.id; // Obtener el ID de la consultoría de los parámetros de la ruta
    const { nombre, descripcion } = req.body;
    const archivo = req.file; // Obtener el archivo subido con multer

    // Actualizar los datos de la consultoría
    await pool.query('UPDATE consultoria SET nombre_archivo = ?, descripcion = ?, archivo = ? WHERE id_consultoria = ?', [nombre, descripcion, archivo.buffer, id_consultoria]); // Guardar el contenido del archivo en la base de datos

    res.redirect('/inicio_estudiante'); // Redirigir al estudiante a su página de inicio
  } catch (error) {
    handleError(res, error);
  }
};

function validarRut(rut, dv) {
  var total = 0;
  var factor = 2;

  for (var i = rut.length - 1; i >= 0; i--) {
    total += factor * rut.charAt(i);
    factor = factor === 7 ? 2 : factor + 1;
  }

  var dvCalculado = 11 - (total % 11);

  if (dvCalculado === 11) {
    dvCalculado = '0';
  } else if (dvCalculado === 10) {
    dvCalculado = 'K';
  } else {
    dvCalculado = String(dvCalculado);
  }

  return dv.toUpperCase() === dvCalculado;
}
