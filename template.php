<?php
session_start();

if ( isset($_SESSION["username"]) && isset($_SESSION["token"]) ) {
  
  $error_message = "";

  $config = parse_ini_file("config.ini");
  try {

    $db = new PDO("mysql:host={$config['host']};dbname={$config['db']};charset={$config['charset']}", $config['user'], $config['pass']);
    $db->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
    $query_select = "SELECT `DB_NAME`, `DB_TITLE` FROM `DATABASES`";
    $databases = $db->query($query_select)->fetchAll();

  } catch (PDOException $e){
    $error_message = "internal error {$e}";
    // add $e to error log
  }

  $page_title = "create template";
  $signed = $_SESSION["username"];

  include("views/inc.header.php");

  if ($error_message != "") {
    include("views/inc.error.php");
  } else {
    include("views/inc.template.php");
  }
  
  include("views/inc.footer.php");

} else {
  header("Location: login.php");
}