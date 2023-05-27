SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `correo_electronico` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `id_tipo_usuario` int(11),
  `rut` int(11) DEFAULT NULL,
  `rut_id` varchar(1) DEFAULT NULL,
  PRIMARY KEY (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tipo_usuario` (
  `id_tipo_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `tipo` varchar(255) NOT NULL,
  `admin` int(11) DEFAULT NULL,
  `usuario` int(11) DEFAULT NULL,
  `evaluador` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_tipo_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  INSERT INTO tipo_usuario (tipo) VALUES (1);
  INSERT INTO tipo_usuario (tipo) VALUES (2);
  INSERT INTO tipo_usuario (tipo) VALUES (3);

CREATE TABLE `evaluador` (
  `id_evaluador` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) NOT NULL,
  `correo_evaluador` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id_evaluador`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `consultoria` (
  `id_consultoria` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_archivo` varchar(255) NOT NULL,
  `documento_archivo` longblob NOT NULL,
  `fecha_subida_archivo` datetime NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_evaluador` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_consultoria`),
  FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`),
  FOREIGN KEY (`id_evaluador`) REFERENCES `evaluador` (`id_evaluador`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `estado_consultoria` (
  `id_estado_consultoria` int(11) NOT NULL AUTO_INCREMENT,
  `estado` varchar(255) NOT NULL,
  `id_consultoria` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `fecha` datetime NOT NULL,
  PRIMARY KEY (`id_estado_consultoria`),
  FOREIGN KEY (`id_consultoria`) REFERENCES `consultoria` (`id_consultoria`),
  FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `usuario`
  ADD CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`id_tipo_usuario`) REFERENCES `tipo_usuario` (`id_tipo_usuario`);

COMMIT;
