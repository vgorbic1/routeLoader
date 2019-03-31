<?php
session_start();

if ( isset($_SESSION["username"]) && isset($_SESSION["token"]) ) {
  
  $username = $_SESSION["username"];
  $token = $_SESSION["token"];
  $error_message = "";
  $config = parse_ini_file("config.ini");

  try { 

    $db = new PDO("mysql:host={$config['host']};dbname={$config['db']};charset={$config['charset']}", $config['user'], $config['pass']);
    $db->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
    $query_select = "SELECT FIRST_NAME, ROLE FROM USERS WHERE USERNAME = :username";
    $stmt_select = $db->prepare($query_select);
    $stmt_select->execute( array(":username"=> $username) );

    if ($row = $stmt_select->fetch() ) {
      $first_name = $row["FIRST_NAME"];
      $role = $row["ROLE"];

    } else {
      $error_message = "unable to retrieve user information";
    }

  } catch (PDOException $e){
    $error_message = "internal error";
    // add $e to error log
  }

  $page_title = "dashboard";

  include("views/inc.header.php");

  if ($error_message != "") {
    include("views/inc.error.php");
  } else {
    include("views/inc.index.php");
  }
  
  include("views/inc.footer.php");

} else {
  header("Location: login.php");
}