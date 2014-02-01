<!DOCTYPE html>
<html lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="">
<meta name="author" content="">
<link rel="shortcut icon" href="favicon.png">
<title>Easelweb</title>
<link href="assets/bootstrap/css/bootstrap.min.css" rel="stylesheet">
<link href="assets/bootstrap/css/easelweb.css" rel="stylesheet">
<link href="/development/easelweb/assets/codemirror/css/codemirror.css" rel="stylesheet">
<link href="/development/easelweb/assets/etch/css/etch.css" rel="stylesheet">
<link href="/development/easelweb/assets/easelweb/css/easelweb.css" rel="stylesheet">
</head>
<body>
    <div  data-ew-widget="widget" class="">
        <div class="container narrow-container">
<?php include "includes/header.php"; ?><div class="row">
                <div class="col-md-12" data-ew-widget="html">
                    <p class="lead">Easelweb is a simple content management system that allows inline page editing using custom data attributes.</p>
                    <a href="#install">Install</a> - <a href="#configuration">Configuration</a> - <a href="#usage">Widgets</a> - <a href="#usage">Usage</a> - <a href="#faq">FAQ</a>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12" data-ew-widget="html">
                    <h3 id="install">Install</h3>
                    <p>Easelweb requires jquery to be included  on the page before reference the easelweb script. It also requires Bootstrap. The front-end is built using javascript
                        and will work in most modern browsers. For IE you need at least IE 9 or higher. </p>
<p><span style="line-height: 1.428571429;">The server component of easelweb requires at least php 5.2.x on the server.</span><span style="line-height: 1.428571429;"> </span><br></p>
                    <p>
                        <a href="/download/easelweb.zip">Download here</a>, and unzip to a folder in your website. 
                        It is recommended to unzip to the root and use <em>easelweb</em> as the folder name.
                    </p>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12" data-ew-widget="html">
                    <h3 id="configuration">Configuration</h3>
                    <p>Edit the <strong>config.php</strong> file in the root of the easelweb folder.</p>
                    <p>The first thing you should change is the username and password from the default.</p>
                    <p>The second thing to do is to configure which files you will manage with easelweb. 
                        The <em>sandbox</em> section of the config does this. 
                        By default easelweb will assume your site is one directory up from where easelweb installed
                        and just copy the index.html file.  
                        You'll need to explicitly specify the directories and files you want easelweb to manage.
                    </p>
                    <h4 id="script">Script Tag</h4>
                    <p>
                        Add a reference to the easelweb init script on every page you want easelweb to be active on.
                        This should be done during the design of the site and before you login to easelweb for the first time.
                        <br><br><span>ex:</span> <code>&lt;script src="/easelweb/assets/easelweb/js/init.js"&gt;&lt;/script&gt;</code>
                    </p>
                    <p>
                        After adding the script tag to the pages you want to edit, you will need to setup the widgets.
                    </p>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12" data-ew-widget="html">
                    <h3 id="widgets">Setup Widgets</h3>
                    <p>
                        Easelweb uses custom data attributes attached to html tags to activate the sections of the html as editable widgets.
                        They are as follows:
                    </p>
                    <ol>
<li>data-ew-uri</li>
                        <li>data-ew-widget</li>
<li>data-ew-init</li>
                    </ol>
<h4>data-ew-uri</h4>
                    <p><code> &lt;div data-ew-uri="index.php"&gt;</code></p>
                    <p>
                        This attribute defines an easelweb management region, every page needs at least one of these attributes on an html tag to function properly. 
                        Add the <strong>data-ew-uri</strong> attribute to a tag to signify it as a region for easelweb to manage. You should can add this to any tag within 
                        the body tag. It the most simple incarnation, you would wrap the entire page content in a dive with this tag.
                    </p>
                    <p> 
                        The value of the attribute should be a relative uri to the page you are editing. 
                        When you click save in easelewb it will take the html of the tag this attribute is attached to and update the corresponding
                        file on the server.
                    </p>
                    <p>
                        You can put as many of these attributes as you want on the page, to define multiple management regions. This way you can have files
                        included from different areas of the site but do inline editing on the final page. Easelweb will figure out based on this uri
                        value which file to upate on the server and which piece of html to replace.
                    </p>
                    <p>
                        When you want to include more than one of these tags pointing to the same page, add a fragment identifier to make them unique.
                    </p>
                    <p><code> &lt;div data-ew-uri="index.php#sidebar"&gt;</code></p>
                    <h4>data-ew-widget</h4>
                    <p><code>&lt;div data-ew-widget="widget|html|image"&gt;</code></p>
                    <p>
                        This attributes tuns an html tag into an easelweb widget. In the easelweb editing interface it gives you the ability
                        to edit and view the html source and provides a simple form to edit the attributes on the tag. 
                        You may nest the attribute as much as you want and it can even be on the same tag as the <b>data-ew-uri</b> attribute.</p>
<p><b>widget</b></p>
<p>This is the default widget type and every other widget has at least the functionality of this base widget. This widget allows you to view and edit the source of the widget as well as provide a simple form for editing the attributes of the widget tag.</p>
<p><b>html</b></p>
<p>This widget gives you everything of the default widget plus the ability to do simple inline rich text editing. When you click on this widget a floating toolbar appears that allows you to apply various formatting to the text and insert links.</p>
<p><b>image</b></p>
<p>This widget gives you everything of the default widget plus the ability to upload images. Most likely you will use this widget on <b>img </b>tags but it is not required.<br></p>
  <h4>data-ew-init</h4>
  <p><code> &lt;div data-ew-init="myInitFunction"&gt;</code></p>
  <p>Attach this attribute to a widget to run a javascript function when the widget is created in the easelweb interface. Since easelweb is constantly movng and removing nodes in the DOM you might need to do some re-initialization of event listeners or third party controls when easelweb updates the widget.</p>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12" data-ew-widget="html">
                    <h3 id="usage">Usage</h3>
                    <p>
                        Once you've added script tags and setup the widgets for your site. 
                        Login to easelweb by pointing your browser to the folder where you unzipped it to your site.</p>
                    <p>The first time you login, easelweb will refresh its sandbox with the files from your site. 
                        The files it copies are the ones specified in the <em>sandbox</em> configuration section.
                    </p>
                    <p>
                        You will now be taken to a copy of your site in the sandbox which you can be editted by clicking the easelweb icon
                        to toggle the toolbar. You can toggle the toolbar on and off to see what your site will look like after editing. 
                        Click <b>Save</b> to send your changes to the server and <b>Publish</b> to push to your live site.</p>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12" data-ew-widget="html">
                    <h3 id="faq">FAQ</h3>
                    <h4>Why Easelweb?</h4>
                    <p>Easelweb is designed out of the frustration of working with large complex content managment systems (Wordpress, Joomla, Drupal, etc...) for creating small custom websites that only need a fraction of the features those systems provide. </p>
                    <p>For smaller sites, that are mainly static html the complexity of setup and working within those systems is not worth the hassle.</p>
                    <h4>How does it work?</h4>
                    <p>
                        Easelweb is based on <a href="http://getbootstrap.com/">Bootstrap</a>. 
                        Take any Boostrap design and add a few custom data attributes to the tags on your page to enable the easelweb editing interface.
                    </p>
                    <p>The concept behind easelweb is that there are certain sections of the page the need inline editing and others that don't. Attach the data attributes to the areas that need editing to allow for simple inline editing.</p>
                </div>
            </div>
        </div>
        <div id="footer">
            <div class="container  narrow-container" data-ew-widget="html">
                <p class="text-muted">easelweb © 2013</p>
            </div>
        </div>
    </div>
    <!-- Load scripts -->
    <script src="assets/jquery/js/jquery.js"></script><script src="assets/bootstrap/js/bootstrap.min.js"></script><script data-main="/development/easelweb/assets/main.js" src="/development/easelweb/assets/require/require.js"></script>
</body>
</html>
