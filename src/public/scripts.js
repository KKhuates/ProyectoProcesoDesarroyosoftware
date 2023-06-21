document.addEventListener('DOMContentLoaded', (event) => {
  var tabla = document.getElementById('tablaUsuarios');
  var btnUsuario = document.getElementById('crudUsuario');
  var btnConsulta = document.getElementById('crudConsulta');

  tabla.addEventListener('click', function(e) {
    var target = e.target;
    while (target != null && target.nodeName !== 'TR') {
      target = target.parentNode;
    }
  
    if (target != null) { // Si se encontró una fila
      target.classList.toggle('seleccionado');
  
      var filasSeleccionadas = tabla.getElementsByClassName('seleccionado');
      btnUsuario.disabled = filasSeleccionadas.length === 0;
      btnConsulta.disabled = filasSeleccionadas.length === 0;
    }
  });

  btnUsuario.addEventListener('click', function() {
    var filasSeleccionadas = tabla.getElementsByClassName('seleccionado');
    var rut = filasSeleccionadas[0].children[2].textContent; // asumimos que RUT está en la tercera columna

    fetch('/eliminarUsuario/' + rut, {
      method: 'POST',
    }).then(function(response) {
      if (response.ok) {
        console.log('Usuario eliminado exitosamente');
      } else {
        console.error('Error al eliminar el usuario');
      }
    });
  });

  btnConsulta.addEventListener('click', function() {
    // Aquí puedes manejar el clic en el botón CRUD Consulta
    var filasSeleccionadas = tabla.getElementsByClassName('seleccionado');
    // Puedes usar las filas seleccionadas para determinar qué consulta(s) deberías manejar
  });
});
