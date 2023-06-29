const bcrypt = require('bcrypt');
const pool = require('./database');
const { render } = require('ejs');
const expressLayouts = require('express-ejs-layouts');

exports.registro_get = async (req, res) => {
  res.render('registros', { layout: 'layout' });
};

exports.registro_post = async (req, res) => {
  try {
    const { nombre, correo, rut, dv, password, tipo_usuario } = req.body;

    let hashedPassword = await bcrypt.hash(password, 10);

    // Inserción del usuario
    const newUser = await pool.query(
      'INSERT INTO usuario (nombre, correo_electronico, password, rut, rut_id) VALUES (?, ?, ?, ?, ?)',
      [nombre, correo, hashedPassword, rut, dv]
    );

    // Obtener el ID del usuario insertado
    const userId = newUser.insertId;

    // Inserción del tipo de usuario
    await pool.query('INSERT INTO tipo_usuario (tipo) VALUES (?)', [tipo_usuario]);

    // Obtener el ID del tipo de usuario insertado
    const tipoUsuarioId = newUser.insertId;

    // Asociar el tipo de usuario con el usuario creado
    await pool.query('UPDATE usuario SET id_tipo_usuario = ? WHERE id_usuario = ?', [tipoUsuarioId, userId]);

    res.render('login', { layout: 'layout' });
  } catch (error) {
    res.status(400).send(error.message);
  }
};


exports.login_get = function (req, res) {
  res.render('login', { layout: 'layout' });
};

exports.login_post = function (req, res) {
  const { rut, password } = req.body;

  pool.query('SELECT * FROM usuario WHERE rut = ?', [rut], async function (err, result) {
    if (err) {
      res.render('paginaerror', { error: 'Ha ocurrido un error en el inicio de sesión.' });
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
            res.render('paginaerror', { error: 'Ha ocurrido un error en el inicio de sesión.' });
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
                res.redirect('/pagina_admin'); // Corregir la ruta a la página de administrador
                break;
              case 'Comite':
                res.redirect('/inicio_comite');
                break;
              default:
                res.render('paginaerror', { error: 'Tipo de usuario no válido.' });
                break;
            }
          } else {
            res.render('paginaerror', { error: 'No se encontró el tipo de usuario.' });
          }
        });
      } else {
        res.render('paginaerror', { error: 'La contraseña no coincide.' });
      }
    } else {
      res.render('paginaerror', { error: 'No se encontró el usuario.' });
    }
  });
};



exports.borrar_usuario = function(req, res) {
  const idUsuario = req.params.id;

  pool.query('DELETE FROM usuario WHERE id_usuario = ?', [idUsuario], function(err, result) {
    if (err) {
      res.render('paginaerror', { error: 'Ha ocurrido un error al borrar el usuario.' });
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
      res.render('paginaerror', { error: 'Ha ocurrido un error al obtener los datos del usuario.' });
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
        res.render('paginaerror', { error: 'Ha ocurrido un error al editar el usuario.' });
        return;
      }

      // Redirigir al usuario a la página de inicio correspondiente después de la edición
      res.redirect('/inicio_admin');
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.inicio_admin_get = function (req, res) {
  pool.query('SELECT * FROM usuario', function (err, result) {
    if (err) {
      res.render('paginaerror', { error: 'Ha ocurrido un error.' });
      return;
    }

    // Renderizar la vista inicio_admin y proporcionar los datos de los usuarios
    res.render('inicio_admin', { users: result, layout: 'layout' });
  });
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
