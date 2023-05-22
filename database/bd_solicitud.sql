-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 29-04-2023 a las 03:16:36
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.2.4


SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `bd_solicitud`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `admindoc`
--

CREATE TABLE `admindoc` (
  `id_admindoc` int(11) NOT NULL,
  `comentario` varchar(30) DEFAULT NULL,
  `id_aceptorecha` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `consultoria`
--

CREATE TABLE `consultoria` (
  `id_consultoria` int(11) NOT NULL,
  `nombre_archivo` varchar(30) DEFAULT NULL,
  `documento_archivo` longblob DEFAULT NULL,
  `fecha_subida_archivo` date DEFAULT NULL,
  `id_admindoc` int(11) DEFAULT NULL,
  `id_evaluador` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `evaluador`
--

CREATE TABLE `evaluador` (
  `id_evaluador` int(11) NOT NULL,
  `nombre` varchar(30) DEFAULT NULL,
  `correo_evaluador` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `solicitudroa`
--

CREATE TABLE `solicitudroa` (
  `id_aceptorecha` int(11) NOT NULL,
  `id_consultoria` int(11) DEFAULT NULL,
  `id_evaluador` int(11) DEFAULT NULL,
  `aprobado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipos`
--

CREATE TABLE `tipos` (
  `id_tipo` int(11) NOT NULL,
  `admin` int(11) DEFAULT NULL,
  `usuario` int(11) DEFAULT NULL,
  `evaluador` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_usuario`
--

CREATE TABLE `tipo_usuario` (
  `id_tipo_usuario` int(11) NOT NULL,
  `id_tipo` int(11) DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

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

--
-- Volcado de datos para la tabla `usuario`
--
--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `admindoc`
--
ALTER TABLE `admindoc`
  ADD PRIMARY KEY (`id_admindoc`),
  ADD KEY `id_aceptorecha` (`id_aceptorecha`);

--
-- Indices de la tabla `consultoria`
--
ALTER TABLE `consultoria`
  ADD PRIMARY KEY (`id_consultoria`),
  ADD KEY `id_admindoc` (`id_admindoc`),
  ADD KEY `id_evaluador` (`id_evaluador`);

--
-- Indices de la tabla `evaluador`
--
ALTER TABLE `evaluador`
  ADD PRIMARY KEY (`id_evaluador`);

--
-- Indices de la tabla `solicitudroa`
--
ALTER TABLE `solicitudroa`
  ADD PRIMARY KEY (`id_aceptorecha`),
  ADD KEY `id_consultoria` (`id_consultoria`),
  ADD KEY `id_evaluador` (`id_evaluador`);

--
-- Indices de la tabla `tipos`
--
ALTER TABLE `tipos`
  ADD PRIMARY KEY (`id_tipo`);

--
-- Indices de la tabla `tipo_usuario`
--
ALTER TABLE `tipo_usuario`
  ADD PRIMARY KEY (`id_tipo_usuario`),
  ADD KEY `id_tipo` (`id_tipo`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD KEY `id_consultoria` (`id_consultoria`),
  ADD KEY `id_tipo_usuario` (`id_tipo_usuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `admindoc`
--
ALTER TABLE `admindoc`
  MODIFY `id_admindoc` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `consultoria`
--
ALTER TABLE `consultoria`
  MODIFY `id_consultoria` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `evaluador`
--
ALTER TABLE `evaluador`
  MODIFY `id_evaluador` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `solicitudroa`
--
ALTER TABLE `solicitudroa`
  MODIFY `id_aceptorecha` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tipos`
--
ALTER TABLE `tipos`
  MODIFY `id_tipo` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tipo_usuario`
--
ALTER TABLE `tipo_usuario`
  MODIFY `id_tipo_usuario` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `admindoc`
--
ALTER TABLE `admindoc`
  ADD CONSTRAINT `admindoc_ibfk_1` FOREIGN KEY (`id_aceptorecha`) REFERENCES `solicitudroa` (`id_aceptorecha`);

--
-- Filtros para la tabla `consultoria`
--
ALTER TABLE `consultoria`
  ADD CONSTRAINT `consultoria_ibfk_1` FOREIGN KEY (`id_admindoc`) REFERENCES `admindoc` (`id_admindoc`),
  ADD CONSTRAINT `consultoria_ibfk_2` FOREIGN KEY (`id_evaluador`) REFERENCES `evaluador` (`id_evaluador`);

--
-- Filtros para la tabla `solicitudroa`
--
ALTER TABLE `solicitudroa`
  ADD CONSTRAINT `solicitudroa_ibfk_1` FOREIGN KEY (`id_consultoria`) REFERENCES `consultoria` (`id_consultoria`),
  ADD CONSTRAINT `solicitudroa_ibfk_2` FOREIGN KEY (`id_evaluador`) REFERENCES `evaluador` (`id_evaluador`);

--
-- Filtros para la tabla `tipo_usuario`
--
ALTER TABLE `tipo_usuario`
  ADD CONSTRAINT `tipo_usuario_ibfk_1` FOREIGN KEY (`id_tipo`) REFERENCES `tipos` (`id_tipo`);

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`id_consultoria`) REFERENCES `consultoria` (`id_consultoria`),
  ADD CONSTRAINT `usuario_ibfk_2` FOREIGN KEY (`id_tipo_usuario`) REFERENCES `tipo_usuario` (`id_tipo_usuario`);
COMMIT;
