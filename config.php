<?php 
//---------------------------------------------------------------
// Application configuration
//---------------------------------------------------------------
$easelweb_root_url = dirname($_SERVER['PHP_SELF']);
$easelweb_root_path = dirname(__FILE__);
return array(
    // Name of your site. Will appear in the title bar of the login page.
    'site_name' => 'Easelweb',
    
    // Authentication
    'authvar' => 'authorized',
    'username' => 'demo',
    'password' => 'demored123!werw',

    // URL paths
    'login_url' => $easelweb_root_url.'/login/',
    'home_url' => $easelweb_root_url,

    // Absolute path to easelweb folder on server
    'home_path' => $easelweb_root_path,

    // Folder where versions are stored
    'versions_path' => $easelweb_root_path.'/versions/',

    // Templates
    'template_dir' =>  $easelweb_root_path.'/lib/easelweb/tpl',

    // Sandbox 
    'sandbox' => array(
        // This is the root folder to look for files to refresh the easelweb sandbox from
        'mirror_path' => $easelweb_root_path.'/../',

        // The files/directories that are copied to the sandbox need to be explicitly specified.
        // Files and directories are relative to the 'mirror_path' setting.
        'filter' => array('index.php', 'assets', 'includes'),

        // Location of easelweb sandbox.
        'sandbox_path' => $easelweb_root_path.'/sandbox/',
        'sandbox_url' => $easelweb_root_url.'/sandbox/',
    ),

    // Uploader config
    // The uploader script is the blueimp jquery fileupload script for php
    // See its documentation for a full list of upload options.
    'upload' => array(
        // The folder to store uploaded images. This can be changes to anything you want.
        // To save space it is advised to leave this directory out of your sandbox filter configuration.
        // Just make sure you use absolute url paths to file in this directory when designing your site.
        'upload_dir' => $easelweb_root_path.'/../images/',

        // This directory is the url returned to the uploader control when you upload a file.
        // It needs to match the 'upload_dir' setting.
        'upload_url' => $easelweb_root_url.'/../images/',


        // Thumbnails are used when you upload a file to give a preview
        // adjust the dimensions here.
        "image_versions" => array(
            "thumbnail" => array(
                "max_width" => 150,
                "max_height" => 150
            )
        )
    )
);