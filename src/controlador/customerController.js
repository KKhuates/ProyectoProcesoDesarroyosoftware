const bcrypt = require('bcrypt');
const pool = require('./database');
const db = require('./database');

// Función para manejar errores
function handleError(res, error) {
  console.error(error);
  res.render('paginaerror', { error: 'Ha ocurrido un error.' });
}


exports.registro_admin_get = async (req, res) => {
  res.render('registrar_admin', { layout: 'layout' });
};

exports.registro_admin_post = (req, res) => {
  const { nombre, correo_electronico, rut, rut_id, password, id_tipo_usuario, nombre_empresa, direccion, rubro } = req.body;
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return handleError(res, err);
    }

    pool.query(
      'INSERT INTO empresas (nombre, direccion, rubro) VALUES (?, ?, ?)',
      [nombre_empresa, direccion, rubro],
      (err, newCompany) => {
        if (err) {
          return handleError(res, err);
        }
    
        const idempresa = newCompany.insertId;
        console.log("id_empresa-->", idempresa);
    
        pool.query(
          'INSERT INTO usuario (nombre, correo_electronico, password, rut, rut_id, id_tipo_usuario, id_empresa) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [nombre, correo_electronico, hashedPassword, rut, rut_id, id_tipo_usuario, idempresa],
          (err, newUser) => {
            if (err) {
              return handleError(res, err);
            }
            console.log("newUser-->", newUser);
            res.render('login');
          }
        );
      }
    );
    
  });
};

exports.login_get =function(req,res){
  res.render('login', {layout:'layout'});
}

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
        pool.query('SELECT tipo FROM tipo_usuario WHERE id_tipo_usuario = ?', [user.id_tipo_usuario], function (err, result) {
          if (err) {
            handleError(res, err);
            return;
          }
          if (result.length > 0) {
            const tipoUsuario = result[0].tipo;
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
  const { nombre, correo,id_tipo_usuario} = req.body;

  try {

    // Actualizar los datos del usuario
    pool.query('UPDATE usuario SET nombre = ?, correo_electronico = ?, id_tipo_usuario = ? WHERE id_usuario = ?', [nombre, correo, id_tipo_usuario, idUsuario], function(err, result) {
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

exports.inicio_comite_get = function(req, res, next) {
  // Realiza la consulta SQL para obtener todas las consultorías y sus estados
  pool.query('SELECT consultoria.*, estado_consultoria.estado FROM consultoria LEFT JOIN estado_consultoria ON consultoria.id_estado_consultoria = estado_consultoria.id_estado_consultoria', (err, rows) => {
    if (err) {
      console.log("Error en la primera consulta SQL:", err);
      return;
    }
    
    console.log("Resultados de la primera consulta SQL:", rows);

    // Inicializa las variables que se utilizarán para los datos del gráfico
    let labels = '';
    let data = '';
    let message = {};

    // Realiza la consulta SQL para obtener el recuento de consultorías por estado
    pool.query('SELECT estado_consultoria.estado, COUNT(consultoria.id_consultoria) AS count FROM consultoria INNER JOIN estado_consultoria ON consultoria.id_estado_consultoria = estado_consultoria.id_estado_consultoria GROUP BY estado_consultoria.estado', function(err, chartResult) {
      if (err) {
        console.log("Error en la segunda consulta SQL:", err);
        return;
      }

      console.log("Resultados de la segunda consulta SQL:", chartResult);

      // Define todos los estados posibles
      const allStates = ['Analizando', 'Rechazado', 'Aceptado'];

      // Crea un objeto con todos los estados y sus recuentos
      const stateCounts = {};
      allStates.forEach(state => { stateCounts[state] = 0; });
      chartResult.forEach(row => { stateCounts[row.estado] = row.count; });

      // Convierte los recuentos de estados en las cadenas labels y data
      labels = JSON.stringify(allStates);  // Convierte el array a una cadena JSON
      data = JSON.stringify(allStates.map(state => stateCounts[state]));  // Convierte el array a una cadena JSON

      console.log("Labels:", labels);
      console.log("Data:", data);

      // Establece el mensaje de éxito o error dependiendo de si se encontraron consultorías
      if (chartResult.length === 0) {
        message.error = 'No se ha subido ninguna consultoria';
      } else {
        message.success = 'Existen consultorías';
      }

      // Renderea la vista 'inicio_comite', pasando las consultorías y los datos del gráfico
      res.render('inicio_comite', { consultorias: rows, labels: labels, data: data, message: message });
    });
  });
};

exports.inicio_admin_get = function (req, res) {
  let sqlQuery = 'SELECT * FROM usuario';
  let rut = req.query.rut;

  // Si se proporcionó un RUT, modificar la consulta SQL para filtrar por ese RUT
  if (rut) {
    sqlQuery += ' WHERE rut = ?';
  }

  pool.query(sqlQuery, [rut], function (err, result) {
    if (err) {
      handleError(res, err);
      return;
    }

    let labels = '';
    let data = '';
    let message = {};

    pool.query('SELECT estado_consultoria.estado, COUNT(consultoria.id_consultoria) AS count FROM consultoria INNER JOIN estado_consultoria ON consultoria.id_estado_consultoria = estado_consultoria.id_estado_consultoria GROUP BY estado_consultoria.estado', function(err, chartResult) {
      if (err) {
        handleError(res, err);
        return;
      }

      const allStates = ['Analizando', 'Rechazado', 'Aceptado'];
      const stateCounts = {};
      allStates.forEach(state => { stateCounts[state] = 0; });
      chartResult.forEach(row => { stateCounts[row.estado] = row.count; });

      // Convierte los recuentos de estados en las cadenas labels y data
      labels = JSON.stringify(allStates);  // Convierte el array a una cadena JSON
      data = JSON.stringify(allStates.map(state => stateCounts[state]));  // Convierte el array a una cadena JSON

      if (chartResult.length === 0) {
        message.error = 'No se ha subido ninguna consultoria';
      } else {
        message.success = 'Existen consultorías';
      }

      // Renderizar la vista inicio_admin y proporcionar los datos de los usuarios
      res.render('inicio_admin', { users: result, labels: labels, data: data, message: message, layout: 'layout' });
    });
  });
};

exports.inicio_estudiante_get = function(req, res) {
  const idUsuario = req.session.userId;

  pool.query('SELECT consultoria.*, estado_consultoria.estado AS estado FROM consultoria INNER JOIN estado_consultoria ON consultoria.id_estado_consultoria = estado_consultoria.id_estado_consultoria WHERE consultoria.id_usuario = ?', [idUsuario], function(err, result) {
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

exports.cargar_consultoria_post = (req, res) => {
  const { nombre, descripcion } = req.body;

  // Verifica si req.file existe y contiene un archivo
  if (!req.file) {
    req.flash('error', 'No se cargó ningún archivo');
    return res.redirect('/paginaerror');
  }

  const archivo = req.file;
  const documento_archivo = archivo.buffer || archivo.path;
  if (!documento_archivo) {
    req.flash('error', 'El archivo está vacío');
    return res.redirect('/paginaerror');
  }
  const fecha_subida_archivo = new Date();
  const id_usuario = req.session.userId;
  // Inserta el archivo en la tabla archivoSolicitud
  pool.query(
    'INSERT INTO archivoSolicitud (archivo, fecha_subida) VALUES (?, ?)',
    [documento_archivo, fecha_subida_archivo],
    (err, newFile) => {
      if (err) {
        console.log(err);
        req.flash('error', 'Error al cargar el archivo');
        return res.redirect('/paginaerror');
      }
  
      const idarchivos = newFile.insertId;
      console.log("id_archivo-->", idarchivos);
  
      // Inserta la consultoría
      pool.query(
        'INSERT INTO consultoria (nombre_archivo, descripcion_archivo, fecha_subida_archivo, id_usuario, id_archivos, id_estado_consultoria) VALUES (?, ?, ?, ?, ?, ?)',
        [nombre, descripcion, fecha_subida_archivo, id_usuario, idarchivos, 1], // 1 es el estado 'ANALISANDO'
        (err, newConsultoria) => {
          if (err) {
            console.log(err);
            req.flash('error', 'Error al cargar el archivo');
            return res.redirect('/paginaerror');
          }
          
          const idconsultoria = newConsultoria.insertId;
          console.log ("id_archivo, id_consultoria-->",idarchivos, idconsultoria);
  
          req.flash('success', 'Archivo cargado correctamente');
          res.redirect('/inicio_estudiante');
        }
      );
    }
  );
};

exports.actualizar_consultoria_post = (req, res) => {
  let id = req.params.id;
  let newFileName = req.file.filename; // Obtén el nombre del archivo subido

  // Actualiza la consultoría en la base de datos
  // Reemplaza esta consulta SQL de acuerdo a tu esquema de base de datos
  let sql = `UPDATE consultoria SET nombre_archivo = '${newFileName}' WHERE id_consultoria = ${id}`;

  db.query(sql, (err, result) => {
    if (err) throw err;
    res.redirect('/inicio_estudiante');
  });
};

exports.actualizar_consultoria_get = (req, res) => {
  let id = req.params.id;
  
  // Busca la consultoría con el ID proporcionado en la base de datos
  // Reemplaza esta consulta SQL de acuerdo a tu esquema de base de datos
  let sql = `SELECT * FROM consultoria WHERE id_consultoria = ${id}`;

  db.query(sql, (err, result) => {
    if (err) throw err;
    
    // Renderiza la vista actualizar_consultoria.ejs con los detalles de la consultoría
    res.render('actualizar_consultoria', { consultoria: result[0] });
  });
};

//Función para visualizar las consultorías
exports.ver_consultorias_get = async (req, res) => {
  try {
    const consultorias = await pool.query('SELECT consultoria.nombre_archivo, consultoria.descripcion_archivo, consultoria.fecha_subida_archivo, archivoSolicitud.archivo FROM consultoria AS consultoria INNER JOIN archivoSolicitud AS a ON consultoria.id_archivos = archivoSolicitud.id_archivos');

    // Imprime las consultorías obtenidas de la base de datos
    console.log('consultorias:', consultorias);

    if (Array.isArray(consultorias) && consultorias.length) {
      res.render('consultorias', { consultorias: consultorias, layout: 'layout' });
    } else {
      res.status(500).send("No se encontraron datos de consultorías");
    }
  } catch (error) {
    handleError(res, error);
  }
};

//Función para evaluar las consultorías
exports.evaluar_consultoria_post = async (req, res) => {
  try {
    const { id_consultoria, nota } = req.body;

    // Imprime el id de la consultoría y la nota
    console.log(`id_consultoria: ${id_consultoria}, nota: ${nota}`);

    let id_estado_consultoria;
    if (nota >= 40) {
      id_estado_consultoria = 3;
    } else if (nota == 0) {
      id_estado_consultoria = 1;
    } else {
      id_estado_consultoria = 2;
    }

    // Imprime el id del estado
    console.log(`id_estado_consultoria: ${id_estado_consultoria}`);

    await pool.query('UPDATE consultoria SET nota = ?, id_estado_consultoria = ? WHERE id_consultoria = ?', [nota, id_estado_consultoria, id_consultoria]);

    // Imprime un mensaje si la actualización tuvo éxito
    console.log('La consultoría fue actualizada con éxito');

    res.redirect('/inicio_comite');
  } catch (error) {
    handleError(res, error);
  }
};




exports.logout = function (req,res) {
  req.session.destroy(function(err) {
    if (err) {
      handleError(res, err);
      return;
    }

    res.redirect('/login');
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
