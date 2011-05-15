-- phpMyAdmin SQL Dump
-- version 3.2.4
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: May 12, 2011 at 10:42 PM
-- Server version: 5.1.41
-- PHP Version: 5.3.1

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `matris_hesaplari`
--

-- --------------------------------------------------------

--
-- Table structure for table `mh_projects`
--

CREATE TABLE IF NOT EXISTS `mh_projects` (
  `pid` int(11) NOT NULL AUTO_INCREMENT,
  `uid` bigint(11) NOT NULL,
  `tag` varchar(30) COLLATE utf8_unicode_ci NOT NULL,
  `date` int(11) NOT NULL,
  `type` varchar(10) COLLATE utf8_unicode_ci NOT NULL,
  `num_points` int(4) NOT NULL,
  `id` text COLLATE utf8_unicode_ci NOT NULL,
  `f_deltah` text COLLATE utf8_unicode_ci NOT NULL,
  `b_deltah` text COLLATE utf8_unicode_ci NOT NULL,
  `f_l` text COLLATE utf8_unicode_ci NOT NULL,
  `b_l` text COLLATE utf8_unicode_ci NOT NULL,
  `H` text COLLATE utf8_unicode_ci NOT NULL,
  `wl` int(11) NOT NULL,
  `max_dhi` int(11) NOT NULL,
  PRIMARY KEY (`pid`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=156 ;

--
-- Dumping data for table `mh_projects`
--


-- --------------------------------------------------------

--
-- Table structure for table `mh_users`
--

CREATE TABLE IF NOT EXISTS `mh_users` (
  `uid` bigint(11) NOT NULL,
  `oauth_token` varchar(40) COLLATE utf8_unicode_ci NOT NULL,
  `oauth_token_secret` varchar(40) COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(30) COLLATE utf8_unicode_ci NOT NULL,
  `surname` varchar(30) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`uid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
