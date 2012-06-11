CREATE TABLE IF NOT EXISTS `mh_projects` (
  `pid` int(11) NOT NULL AUTO_INCREMENT,
  `uid` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `tag` varchar(30) COLLATE utf8_unicode_ci NOT NULL,
  `date` int(11) NOT NULL,
  `params` text COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`pid`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=163 ;

CREATE TABLE IF NOT EXISTS `mh_users` (
  `uid` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`uid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;