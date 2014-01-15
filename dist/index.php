<?php
require "lib/phpQuery/phpQuery.php";
require "lib/epiphany/Epi.php";
require "lib/easelweb/Easelweb.php";
require "lib/upload/UploadHandler.php";

//---------------------------------------------------------------
// Init Epiphany
//---------------------------------------------------------------
Epi::setPath('base', dirname(__FILE__)."/lib/epiphany");
Epi::init('route', 'api','session', 'template', 'config');
EpiSession::employ(EpiSession::PHP);

//---------------------------------------------------------------
// Load applicaton configuration
//---------------------------------------------------------------
$config = require 'config.php';

// Store application config in Epiphany, so that
// route functions can access config info later
getConfig()->set('easelweb', $config);

//---------------------------------------------------------------
// Define routes
//---------------------------------------------------------------
getRoute()->get('/', array('Easelweb', 'home'));
getRoute()->post('/login/', array('Easelweb', 'login'));
getRoute()->get('/logout/', array('Easelweb', 'logout'));
getApi()->post('/upload/', array('Easelweb', 'upload'), EpiApi::external);
getApi()->post('/refresh/',  array('Easelweb', 'refresh'), EpiApi::external);
getApi()->post('/refresh/(\d)',  array('Easelweb', 'refresh'), EpiApi::external);
getApi()->post('/publish/', array('Easelweb', 'publish'), EpiApi::external);
getApi()->post('/save/', array('Easelweb', 'save'), EpiApi::external);
getApi()->get('/read/(.*)', array('Easelweb', 'read'), EpiApi::external);
getRoute()->get('.*', array('Easelweb', 'errorpage'));
getRoute()->run();