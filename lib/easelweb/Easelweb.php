<?php 
class Easelweb {

    /**
     * Copy what is in the sandbox back to the main area.
     */
    public static function publish() 
    {
        // Get config
        $config = getConfig()->get('easelweb');

        // Load session
        $session = EpiSession::getInstance(EpiSession::PHP);

        // Only allow authorized
        if($session->get($config['authvar']) !== true) {
           getRoute()->redirect($config['home_url']); 
        }

        // Do we have a sandbox area to copy from
        if (empty($config['sandbox']['sandbox_path'])) {
            return array('error' => 'Sandbox not defined. Please check config.');
        }

        // Get source, destination
        $dest = $config['sandbox']['mirror_path'];
        $src_sandbox = $config['sandbox']['sandbox_path'];

        // Copy from sandbox back to main area
        $published = self::recurseCopy($src_sandbox, $dest);

        // Create new backup version of published sandbox
        $backup = self::recurseCopy($src_sandbox, $config['versions_path'].time());

        // Ensure only last 5 version are kept
        self::trimVersions();

        // Return list of files that were copied
        return array('published' => $published);
    }

    /**
     * Make sure we only ever keep the last 5 versions of the site
     */
    private static function trimVersions() 
    {   
        // Get config
        $config = getConfig()->get('easelweb');

        // Read folders in version directory 
        $all_files = scandir($config['versions_path']);

        // Were there any files in the directory
        if (is_array($all_files) && !empty($all_files)) {
            $files = array_diff($all_files, array('.', '..'));

            // Sort array
            rsort($files, SORT_NUMERIC);

            // Delete the oldest folders if we have more than 5
            if (count($files) > 5) {
                $to_delete = array_slice($files, 5);
                foreach ($to_delete as $value) {
                    self::deleteDir($config['versions_path'].$value);   
                }
            }
        }
    }

    /**
     * Process easelweb read command. Read a resource from the server and return it.
     */
    public static function read($resource) 
    {
        // Get config
        $config = getConfig()->get('easelweb');

        // Store sandbox path on file system
        $sandbox_path = $config['sandbox']['sandbox_path'];

        // Load session
        $session = EpiSession::getInstance(EpiSession::PHP);

        // Only allow authorized
        if($session->get($config['authvar']) !== true) {
           getRoute()->redirect($config['home_url']); 
        }

        // Read resource from file
        $data = file_get_contents($sandbox_path.'/'.$resource);

        // Return data
        return array("data" => $data);
    }

    /**
     * Process easelweb save command
     */
    public static function save() 
    {
        // Get config
        $config = getConfig()->get('easelweb');

        // Store sandbox path on file system
        $sandbox_path = $config['sandbox']['sandbox_path'];

        // Load session
        $session = EpiSession::getInstance(EpiSession::PHP);

        // Only allow authorized
        if($session->get($config['authvar']) !== true) {
           getRoute()->redirect($config['home_url']); 
        }

        // Get payload
        $json = file_get_contents('php://input');
        $payload = json_decode($json, true);
        
        // Make sure we hav updates and a sandbox
        if (isset($payload['updates']) && !empty($payload['updates']) && is_dir($sandbox_path)) {

            // The files we updated
            $updated = array();

            // Iterate through the updates
            foreach ($payload['updates'] as $uri => $region) {

                // Parse the uri
                $uri_parts = parse_url($uri);

                // Make sure file exists
                if (is_file($sandbox_path.'/'.$uri_parts['path'])) {
                    // Load in the resource we are going to modify
                    // which for now is an html file
                    $doc = phpQuery::newDocumentFileHTML($sandbox_path.'/'.$uri_parts['path'], $charset = 'utf-8');

                    // Update region content
                    if (isset($region['content'])) {
                        // TODO:Remove subregions from content
                        pq('[data-ew-uri="'.$uri_parts['path'].$uri_parts['fragment'].'"]')->replaceWith($region['content']);   
                    }

                    // Write resource back to sandbox place
                    //file_put_contents($sandbox_path.'/'.$uri, $doc->html());

                    // Track the uri updated
                    array_push($updated, $sandbox_path.'/'.$uri_parts['path'].$uri_parts['fragment']);
                }
            }

            // Need to return json
            return array("updated" => $updated);

        } else {
            // Need to return json
            return array("updated" => $updated);
        }
    }

    /**
     * Refresh the staging area by copying from the specified folder.
     * @param string $version The version to refresh, pass nothing to do a refresh from mirror path
     */
    public static function refresh($version = null) 
    {
        // Get config
        $config = getConfig()->get('easelweb');

        // Load session
        $session = EpiSession::getInstance(EpiSession::PHP);

        // Only allow authorized
        if($session->get($config['authvar']) !== true) {
           getRoute()->redirect($config['home_url']); 
        }

        // Do we have a sandbox area defined in the config
        if (empty($config['sandbox']['sandbox_path'])) {
            return array('error' => 'Sandbox not defined. Please check config.');
        }

        // Ensure sandbox directory is created
        if (!is_dir($config['sandbox']['sandbox_path'])) {
            $status = @mkdir($config['sandbox']['sandbox_path'], 0755, true);
            if ($status === false) {
                throw new Exception('Failed to create sandbox directory. "'.$config['sandbox']['sandbox_path'].'"');
            }  
        }

        // Refresh sandbox with an older version
        if (isset($version) && is_numeric($version)) {
            // Get source version to copy
            $src = $config['versions_path'].$payload['version'];

            // Set destination as sandbox
            $dest = $config['sandbox']['sandbox_path'];

            // Copy previous version to sandbox 
            $copied = self::recurseCopy($src, $dest);

        } else {
        // Refresh sandbox with live site 
            // Get source, destination
            $src = $config['sandbox']['mirror_path'];
            $dest = $config['sandbox']['sandbox_path'];
            $filter = $config['sandbox']['filter'];

            // Copy directory
            $copied = self::recurseCopy($src, $dest, $filter, $config['sandbox']['mirror_path']);

            // Create backup version of destination
            $backup = self::recurseCopy($dest, $config['versions_path'].time());

            // Ensure only last 5 version are kept
            self::trimVersions();
        }

        // Return list of files that were copied
        return array('copied' => $copied);
    }

    /**
     * Recursively delete a folder
     * @param string $dirPath Directory to delete
     */
    private static function deleteDir($dirPath) 
    {
        if (! is_dir($dirPath)) {
            throw new InvalidArgumentException("$dirPath must be a directory");
        }
        if (substr($dirPath, strlen($dirPath) - 1, 1) != '/') {
            $dirPath .= '/';
        }
        $files = glob($dirPath . '*', GLOB_MARK);
        foreach ($files as $file) {
            if (is_dir($file)) {
                self::deleteDir($file);
            } else {
                unlink($file);
            }
        }
        rmdir($dirPath);
    }

    /**
     * Checks if path1 is a descendant of path2
     * @param string $path1 The source path
     * @param string $path2 The path to check if it is descendant
     */
    private static function isDescendantPath($path1, $path2) 
    {
        $check1 = strlen(str_replace($path1, '', $path2));
        $check2 = strlen($path2);

        if ($check1 < $check2 && ($check1 !== 0)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Checks if one path is an anscestor of another
     * @param string $path1 The source path
     * @param string $path2 The path to check as ancestor
     */
    private static function isAncestorPath($path1, $path2) 
    {   
        $check1 = strlen(str_replace($path2, '', $path1));
        $check2 = strlen($path1);

        if ($check1 < $check2 && ($check1 !== 0)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Recursively copy a folder
     * @param string $src Source path
     * @param string $dst Destination path
     * @param array $filter Directories/files to filter
     * @param array $root The root directory the the $filter files and directories are relative to
     */
    private static function recurseCopy($src, $dst, $filter = NULL, $root = NULL) 
    {   
        // Store created
        $created = array();

        // Normalize source and destination by removing trailing slashes
        // we add these back later when needed
        $src = rtrim($src, '/');
        $dst = rtrim($dst, '/');

        // Get handle
        $dir = opendir($src);

        // Is source a valid directory
        if ($dir !== false) {
            // Ensure destination directory is created
            if (!is_dir($dst)) {
                $status = @mkdir($dst, 0755, true);
                if ($status === false) {
                    throw new Exception('Failed to create sandbox directory. "'.$config['sandbox']['sandbox_path'].'"');
                }  
            }
        }

        // Interate through directories and files
        while(false !== ( $file = readdir($dir)) ) {
            if (( $file != '.' ) && ( $file != '..' )) { 
                // Do we have a filter set
                if (isset($filter) && is_array($filter) && isset($root)) {
                    // Check filters to see if we need to process this file or director
                    $docopy = false;
                    foreach ($filter as $value) {
                        // Do not allow empty filter values because that will lead to 
                        // a recursive loop
                        if (!empty($value)) {
                            if (self::isDescendantPath($src.'/'.$file, $root.$value) || self::isAncestorPath($src.'/'.$file, $root.$value) || ($src.'/'.$file === $root.$value)) {
                                $docopy = true;
                            }
                        } 
                    }

                    // Do we need to process the file or directory?
                    if ($docopy === true) {
                        // Do the copy
                        if ( is_dir($src . '/' . $file) ) {
                            // Copy directory with filters set
                            $created = array_merge($created, self::recurseCopy($src.'/'.$file, $dst.'/'.$file, $filter, $root)); 
                        } 
                        else {
                            // Do copy and track copied file
                            copy($src . '/' . $file,$dst . '/' . $file);
                            array_push($created, $dst . '/' . $file);
                        }
                    }

                } else {
                // Don't check filters
                    if ( is_dir($src.'/'.$file) ) {
                        // Copy directory without filters set
                        $created = array_merge($created, self::recurseCopy($src . '/' . $file,$dst . '/' . $file)); 
                    } 
                    else {
                        // Do copy and track copied file
                        copy($src . '/' . $file,$dst . '/' . $file);
                        array_push($created, $dst . '/' . $file);
                    } 
                } 
            }
        }
        
        // Close handle
        closedir($dir); 

        // return tracked copied files
        return $created;
    } 

    /**
     * Show the easelweb homepage
     */
    public static function home()
    {
        // Get config
        $config = getConfig()->get('easelweb');

        // Load session
        $session = EpiSession::getInstance(EpiSession::PHP);

        // Are we authenticated?
        if ($session->get($config['authvar']) === true) {
            // Bounce to easleweb sandbox
            getRoute()->redirect($config['sandbox']['sandbox_url']); 
        } else {
            // Show login page template
            $template = new EpiTemplate();
            $params['home_url'] = $config['home_url'];
            $params['login_url'] = $config['login_url'];
            $params['site_name'] = $config['site_name'];
            $params['error'] = $session->get('login_error');
            $template->display($config['template_dir'].'/login.php', $params); 
        }
    }

    /**
     * Authenticate user
     */
    public static function login() 
    {
        // Get config
        $config = getConfig()->get('easelweb');

        // Load session
        $session = EpiSession::getInstance(EpiSession::PHP);

        // Check login info
        if (($_POST['username'] === $config['username'] ) && ($_POST['password'] === $config['password'] )) {
            $session->set($config['authvar'], true);

            // clear error
            $session->set('login_error', '');

            // Have we created sandbox yet?
            if (!is_dir($config['sandbox']['sandbox_path'])) {
                // Refresh the sandbox, with the live site since this is our first login
                $status = self::refresh();
            }

            // Was there are problem creating sandbox?
            if (isset($status['error'])) {
                $session->set('login_error', $status['error']);
            } else {
                // Create easelweb activation cookie only accessible
                // in the easelweb folder. Expires when browser is closed
                setcookie("easelweb", 1, 0, $config['home_url']);
                
                // Bounce to the main sandbox
                getRoute()->redirect($config['sandbox']['sandbox_url']); 
            }
        } else {
            // Set error message and redirect to login
            $session->set('login_error', 'Incorrect username or password.');
            getRoute()->redirect($config['home_url']);
        }
    }

    /**
     * Logout user
     */
    public static function logout() 
    {
        // Get config
        $config = getConfig()->get('easelweb');

        // Load session
        $session = EpiSession::getInstance(EpiSession::PHP);

        // Unautenticate user
        $session->set($config['authvar'], false);

        // Expire login cookie
        setcookie("easelweb", 0, time() - 3600, "/");

        // BOunce back to home
        getRoute()->redirect($config['home_url']); 
    }

    public static function upload() 
    {
        // Get config
        $config = getConfig()->get('easelweb');

        // Load session
        $session = EpiSession::getInstance(EpiSession::PHP);

        // Only allow authorized
        if($session->get($config['authvar']) !== true) {
           getRoute()->redirect($config['home_url']); 
        }

        // Init uploader
        $upload_handler = new UploadHandler($config['upload']);
    }

    /**
     * Generic error page
     */
    public static function errorpage() 
    {
        // Get config
        $config = getConfig()->get('easelweb');

        // Load session
        $session = EpiSession::getInstance(EpiSession::PHP);

        // Show login page template
        $template = new EpiTemplate();
        $params['home_url'] = $config['home_url'];
        $params['login_url'] = $config['login_url'];
        $params['site_name'] = $config['site_name'];
        $template->display($config['template_dir'].'/error.php', $params);
    }
}
