
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `admindoc` (
  `id_admindoc` int(11) NOT NULL,
  `comentario` varchar(30) DEFAULT NULL,
  `id_aceptorecha` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `consultoria` (
  `id_consultoria` int(11) NOT NULL,
  `nombre_archivo` varchar(30) DEFAULT NULL,
  `documento_archivo` longblob DEFAULT NULL,
  `fecha_subida_archivo` date DEFAULT NULL,
  `id_admindoc` int(11) DEFAULT NULL,
  `id_evaluador` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `evaluador` (
  `id_evaluador` int(11) NOT NULL,
  `nombre` varchar(30) DEFAULT NULL,
  `correo_evaluador` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `solicitudroa` (
  `id_aceptorecha` int(11) NOT NULL,
  `id_consultoria` int(11) DEFAULT NULL,
  `id_evaluador` int(11) DEFAULT NULL,
  `aprobado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `tipos` (
  `id_tipo` int(11) NOT NULL,
  `admin` int(11) DEFAULT NULL,
  `usuario` int(11) DEFAULT NULL,
  `evaluador` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tipo_usuario` (
  `id_tipo_usuario` int(11) NOT NULL,
  `id_tipo` int(11) DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL,
  `password` char(60) DEFAULT NULL,
  `correo_electronico` varchar(40) DEFAULT NULL,
  `id_consultoria` int(11) DEFAULT NULL,
  `id_tipo_usuario` int(11) DEFAULT NULL,
  `nombre` varchar(30) DEFAULT NULL,
  `rut` int(11) DEFAULT NULL,
  `rut_id` varchar(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `admindoc`
  ADD PRIMARY KEY (`id_admindoc`),
  ADD KEY `id_aceptorecha` (`id_aceptorecha`);


ALTER TABLE `consultoria`
  ADD PRIMARY KEY (`id_consultoria`),
  ADD KEY `id_admindoc` (`id_admindoc`),
  ADD KEY `id_evaluador` (`id_evaluador`);

ALTER TABLE `evaluador`
  ADD PRIMARY KEY (`id_evaluador`);

ALTER TABLE `solicitudroa`
  ADD PRIMARY KEY (`id_aceptorecha`),
  ADD KEY `id_consultoria` (`id_consultoria`),
  ADD KEY `id_evaluador` (`id_evaluador`);

ALTER TABLE `tipos`
  ADD PRIMARY KEY (`id_tipo`);

ALTER TABLE `tipo_usuario`
  ADD PRIMARY KEY (`id_tipo_usuario`),
  ADD KEY `id_tipo` (`id_tipo`);

ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD KEY `id_consultoria` (`id_consultoria`),
  ADD KEY `id_tipo_usuario` (`id_tipo_usuario`);

ALTER TABLE `admindoc`
  MODIFY `id_admindoc` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `consultoria`
  MODIFY `id_consultoria` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `evaluador`
  MODIFY `id_evaluador` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `solicitudroa`
  MODIFY `id_aceptorecha` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `tipos`
  MODIFY `id_tipo` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `tipo_usuario`
  MODIFY `id_tipo_usuario` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

ALTER TABLE `admindoc`
  ADD CONSTRAINT `admindoc_ibfk_1` FOREIGN KEY (`id_aceptorecha`) REFERENCES `solicitudroa` (`id_aceptorecha`);

ALTER TABLE `consultoria`
  ADD CONSTRAINT `consultoria_ibfk_1` FOREIGN KEY (`id_admindoc`) REFERENCES `admindoc` (`id_admindoc`),
  ADD CONSTRAINT `consultoria_ibfk_2` FOREIGN KEY (`id_evaluador`) REFERENCES `evaluador` (`id_evaluador`);

ALTER TABLE `solicitudroa`
  ADD CONSTRAINT `solicitudroa_ibfk_1` FOREIGN KEY (`id_consultoria`) REFERENCES `consultoria` (`id_consultoria`),
  ADD CONSTRAINT `solicitudroa_ibfk_2` FOREIGN KEY (`id_evaluador`) REFERENCES `evaluador` (`id_evaluador`);

ALTER TABLE `tipo_usuario`
  ADD CONSTRAINT `tipo_usuario_ibfk_1` FOREIGN KEY (`id_tipo`) REFERENCES `tipos` (`id_tipo`);

ALTER TABLE `usuario`
  ADD CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`id_consultoria`) REFERENCES `consultoria` (`id_consultoria`),
  ADD CONSTRAINT `usuario_ibfk_2` FOREIGN KEY (`id_tipo_usuario`) REFERENCES `tipo_usuario` (`id_tipo_usuario`);
COMMIT;
