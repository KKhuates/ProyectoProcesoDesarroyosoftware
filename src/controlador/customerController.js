const bcrypt = require('bcrypt');
const pool = require('./database'); // Asegúrate de que este es el archivo correcto para tu conexión a la base de datos
const { render } = require('ejs');

exports.registro_get = async (req,res) => {
  res.render('registros');
}
exports.registro_post = async (req, res) => {
    try {
        const { nombre, correo, rut, dv, password, tipo_usuario } = req.body;

        let hashedPassword = await bcrypt.hash(password, 10);

        // Inserción del usuario
        const newUser = await pool.query('INSERT INTO usuario (nombre, correo_electronico, password, rut, rut_id, id_tipo_usuario) VALUES (?, ?, ?, ?, ?, ?)', [nombre, correo, hashedPassword, rut, dv, tipo_usuario]);
        
        res.render('login')
    } catch (error) {
        res.status(400).send(error.message);
    }
};
exports.login_get = function(req, res) {
  res.render('login');
};

exports.login_post = function(req, res) {
  
  const { rut, password } = req.body;

  pool.query(`SELECT * FROM usuario WHERE rut = ?`, [rut], async function(err, result) {
      if (err) {
          res.render('paginaerror', { error: 'Ha ocurrido un error en el inicio de sesión.' });
          return;
      }
      
      if (result.length > 0) {
          const user = result[0];
          
          const match = await bcrypt.compare(password, user.password);
          if (match) {
              req.session.userId = user.id_usuario; // iniciando sesión

              // Redirigir al usuario a su página de inicio correspondiente
              switch(user.id_tipo_usuario) {
                  case 1:
                      res.redirect('/inicio_estudiante');
                      break;
                  case 2:
                      res.redirect('/inicio_admin');
                      break;
                  case 3:
                      res.redirect('/inicio_comite');
                      break;
              }
          } else {
              res.render('paginaerror', { error: 'La contraseña no coincide.' });
          }
      } else {
          res.render('paginaerror', { error: 'No se encontró el usuario.' });
      }
  });
};

exports.inicio_admin_get = function(req, res) {
  pool.query(`SELECT * FROM usuario`, function(err, result) {
    if (err) {
      res.render('paginaerror', { error: 'Ha ocurrido un error.' });
      return;
    }

    // Renderizar la vista inicio_admin y proporcionar los datos de los usuarios
    res.render('inicio_admin', { users: result });
  });
};

function validarRut(rut, dv) {
    var total = 0;
    var factor = 2;
  
    for (var i = rut.length - 1; i >= 0; i--) {
      total += factor * rut.charAt(i);
      factor = (factor === 7) ? 2 : factor + 1;
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
