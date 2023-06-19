SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `tipo_usuario` (
  `id_tipo_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `tipo` varchar(255) NOT NULL,
  PRIMARY KEY (`id_tipo_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `correo_electronico` varchar(255) NOT NULL,
  `apellido_usuario` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `id_tipo_usuario` int(11),
  `rut` int(11) DEFAULT NULL,
  `rut_id` varchar(1) DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`id_tipo_usuario`) REFERENCES `tipo_usuario` (`id_tipo_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `evaluador` (
  `id_evaluador` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) NOT NULL,
  `correo_evaluador` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id_evaluador`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `estado_consultoria` (
  `id_estado_consultoria` int(11) NOT NULL AUTO_INCREMENT,
  `estado` varchar(255) NOT NULL,
  PRIMARY KEY (`id_estado_consultoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `consultoria` (
  `id_consultoria` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_archivo` varchar(255) NOT NULL,
  `documento_archivo` longblob NOT NULL,
  `fecha_subida_archivo` datetime NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_evaluador` int(11) DEFAULT NULL,
  `id_estado_consultoria` int(11) NOT NULL,
  PRIMARY KEY (`id_consultoria`),
  FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`),
  FOREIGN KEY (`id_evaluador`) REFERENCES `evaluador` (`id_evaluador`),
  FOREIGN KEY (`id_estado_consultoria`) REFERENCES `estado_consultoria` (`id_estado_consultoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `archivoSolicitud` (
  `id_archivos` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `id_consultoria` int(11) NOT NULL,
  `archivo` longblob NOT NULL,
  `fecha_subida` datetime NOT NULL,
  PRIMARY KEY (`id_archivos`),
  FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`),
  FOREIGN KEY (`id_consultoria`) REFERENCES `consultoria` (`id_consultoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `notas` (
  `id_notas` int(11) NOT NULL AUTO_INCREMENT,
  `id_consultoria` int(11) NOT NULL,
  `nota` varchar(255) NOT NULL,
  PRIMARY KEY (`id_notas`),
  FOREIGN KEY (`id_consultoria`) REFERENCES `consultoria` (`id_consultoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
-- Agregar los nuevos tipos de roles
INSERT INTO tipo_usuario (tipo) VALUES ('Estudiante');
INSERT INTO tipo_usuario (tipo) VALUES ('Administrador');
INSERT INTO tipo_usuario (tipo) VALUES ('Comite');

INSERT INTO `usuario` (`id_usuario`, `nombre`, `correo_electronico`, `apellido_usuario`, `password`, `id_tipo_usuario`, `rut`, `rut_id`) VALUES (NULL, 'pepe', 'pep@123', 'larry', '123', '2', '1234', '1');

COMMIT;
