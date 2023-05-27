const bcrypt = require('bcrypt');
const mysql = require('mysql');
const controller = {};

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bd_solicitud'
});

controller.mostrarMenuPrincipal = (req, res) => {
  res.render('menuprincipal');
};

controller.paginaError = (req, res) => {
  res.render('paginaerror');
};

controller.mostrarInicio = (req, res) => {
  res.render('inicio');
};

controller.mostrarFormularioLogin = (req, res) => {
  res.render('login');
};

controller.mostrarFormularioRegistro = (req, res) => {
  res.render('registros');
};

controller.iniciarSesion = (req, res) => {
  const rut = req.body.rut;
  const password = req.body.password;

  pool.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json(err);
    }

    conn.query('SELECT * FROM usuario WHERE rut = ?', [rut], (err, results) => {
      if (err) {
        return res.status(500).json(err);
      }
      console.log('result',results);

      if (results.length === 0) {
        // Usuario no encontrado
        return res.redirect('/');
      }

      const user = results[0];

      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }

        if (result) {
          // Contraseña correcta, redireccionar a la página de inicio del usuario
          return res.redirect('/menuprincipal');
        } else {
          // Contraseña incorrecta
          return res.redirect('/');
        }
      });
    });

    conn.release();
  });
};

controller.registrarUsuario = (req, res) => {
  const { nombre, correo, rut_reg, dv_rut, password_reg } = req.body;

  // Generar el hash de la contraseña
  bcrypt.hash(password_reg, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Error al encriptar la contraseña:', err);
      return res.status(500).send('Error al encriptar la contraseña');
    }
    console.log('rut',rut_reg)
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
            res.redirect('/menuprincipal');
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


module.exports = controller;
