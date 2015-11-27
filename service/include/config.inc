<?php
// URL до сервера geo2tag. Как правило, это имя хоста, например, localhost
// Данный сервер используется серверной частью GeTS и может быть развернут на одной машине.
define('GEO2TAG_SERVER_URL', 'geo2tag.cs.prv');

// URL сервиса GeTS (адрес доступа через интернет к директории /service), как правило, это [HOST_NAME]/service
// URL должен быть доступен используемым приложениям, например, веб интерфейсу
define('GETS_SERVER_URL', 'oss.fruct.org/projects/gets/service');

// URL сервиса скриптов GeTS (адрес доступа через интернет к файлу /scripts/geo2tag.php), как правило это localhost/scripts/geo2tag.php
// Cервис скриптов GeTS реализует недостающий функционал Geo2tag и должен иметь доступ к БД geo2tag.
define('GETS_SCRIPTS_URL', 'geo2tag.cs.prv/gets/geo2tag.php');

// URL до скрипта /service/files/postFile.php
// URL должен быть доступен приложениям, непример, веб интерфейсу
define('UPLOAD_URL', 'http://oss.fruct.org/projects/gets/service/files/postFile.php');

// login пользователя-владельца ресурса. Используется для идентификации ресурса и организации публичного пространства
define('GEO2TAG_USER', 'gets2');

// пароль пользователя-владельца ресурса.
define('GEO2TAG_PASSWORD', 'getsPWD');

// почтовый адрес пользователя-владельца ресурса.
define('GEO2TAG_EMAIL', 'manager@cs.karelia.ru');

// строка подключения к БД geo2tag. Используется для прямого подключения к БД geo2tag.
// Как правило, необходимо указать правильное имя хоста, например, localhost
define('GEO2TAG_DB_STRING', 'host=geo2tag.cs.prv dbname=geo2tag user=geo2tag');

// настройка прав пользователей по-умолчанию.
// значение  true - все пользователи по умолчанию имеют права доверенных пользователей
// значение false - все пользователи по умолчанию обычные
define('ALL_USERS_TRUSTED', false);

// имя сервиса в Google Apps
define('GOOGLE_APP_NAME', 'GeTS-Service');
define('GOOGLE_CLIENT_ID', '710658254828-tntn2h772v22ilii1qgsvlfgrijrbg6e.apps.googleusercontent.com');
define('GOOGLE_SECRET_ID', 'y8fwnTyiEs-gsrCTLtfFyjXn');

// ID категории по умолчанию
define('DEFAULT_CATEGORY_ID', 21);
?>
