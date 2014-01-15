<!DOCTYPE html>
<html>
    <head>
    <title><?php echo $site_name;?> - Easelweb</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="<?php echo $home_url;?>/assets/bootstrap/css/bootstrap.min.css" rel="stylesheet">
    <link href="<?php echo $home_url;?>/assets/bootstrap/css/bootstrap-theme.min.css" rel="stylesheet">
    <link href="<?php echo $home_url;?>/assets/easelweb/css/login.css" rel="stylesheet">
    </head>
    <body>
        <div class="container">
            <form class="form-signin" action="<?php echo $login_url;?>" method="post">
                <h2 class="form-signin-heading"> aselweb</h2>
                <input type="text" name="username" class="form-control" placeholder="username" required autofocus>
                <input type="password" name="password" class="form-control" placeholder="password" required>
                <?php if (!empty($error)):?>
                <div class="alert alert-danger"><?php echo $error;?></div>
                <?php endif;?>
                <button class="btn btn-lg btn-login btn-block" type="submit">Login</button>
            </form>
        </div>
        <script src="<?php echo $home_url;?>/assets/jquery/js/jquery.min.js"></script>
        <script src="<?php echo $home_url;?>/assets/bootstrap/js/bootstrap.min.js"></script>
    </body>
</html>
