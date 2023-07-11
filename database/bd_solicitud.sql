-- Creación de la tabla tipo_usuario
CREATE TABLE tipo_usuario (
  id_tipo_usuario INT(11) NOT NULL AUTO_INCREMENT,
  tipo VARCHAR(255) NOT NULL,
  PRIMARY KEY (id_tipo_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insertar los tipos de usuarios
INSERT INTO tipo_usuario (tipo) VALUES ('Estudiante');
INSERT INTO tipo_usuario (tipo) VALUES ('Administrador');
INSERT INTO tipo_usuario (tipo) VALUES ('Comite');


-- Agregar tabla empresas
CREATE TABLE empresas (
  id_empresa INT (11) NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  direccion VARCHAR(255) not null,
  rubro varchar(255) not null, 
  PRIMARY key (id_empresa)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Creación de la tabla usuario
CREATE TABLE usuario (
  id_usuario INT(11) NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  correo_electronico VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  id_tipo_usuario INT(11),
  rut INT(11) DEFAULT NULL,
  rut_id VARCHAR(1) DEFAULT NULL,
  id_empresa INT (11) NOT NULL,
  PRIMARY KEY (id_usuario),
  FOREIGN KEY (id_tipo_usuario) REFERENCES tipo_usuario (id_tipo_usuario),
  FOREIGN KEY (id_empresa) REFERENCES empresas (id_empresa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Creación de la tabla estado_consultoria
CREATE TABLE estado_consultoria (
  id_estado_consultoria INT(11) NOT NULL AUTO_INCREMENT,
  estado VARCHAR(255) NOT NULL,
  PRIMARY KEY (id_estado_consultoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO estado_consultoria (estado) VALUES ('Analizando');
INSERT INTO estado_consultoria (estado) VALUES ('Rechazado');
INSERT INTO estado_consultoria (estado) VALUES ('Aceptado');

-- Creación de la tabla archivoSolicitud
CREATE TABLE archivoSolicitud (
  id_archivos INT(11) NOT NULL AUTO_INCREMENT,
  archivo LONGBLOB NOT NULL,
  fecha_subida DATETIME NOT NULL,
  PRIMARY KEY (id_archivos)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Creación de la tabla consultoria
CREATE TABLE consultoria (
  id_consultoria INT(11) NOT NULL AUTO_INCREMENT,
  nombre_archivo VARCHAR(255) NOT NULL,
  descripcion_archivo VARCHAR(255) NOT NULL,
  fecha_subida_archivo DATETIME NOT NULL,
  id_usuario INT(11) NOT NULL,
  id_archivos INT(11) NOT NULL,
  nota VARCHAR(255) NOT NULL,
  id_estado_consultoria INT(11) NOT NULL,
  PRIMARY KEY (id_consultoria),
  FOREIGN KEY (id_estado_consultoria) REFERENCES estado_consultoria(id_estado_consultoria),
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
  FOREIGN KEY (id_archivos) REFERENCES archivoSolicitud(id_archivos)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La consulta SELECT para contar consultorías por estado
SELECT estado_consultoria.estado, COUNT(consultoria.id_consultoria) AS count 
FROM consultoria 
INNER JOIN estado_consultoria ON consultoria.id_estado_consultoria = estado_consultoria.id_estado_consultoria 
GROUP BY estado_consultoria.estado;
