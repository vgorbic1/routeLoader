<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {

  if ( !empty(trim($_POST["username"])) && !empty(trim($_POST["password"])) ){ 
    $username = htmlspecialchars($_POST["username"]);
    $password = $_POST['password'];
    $config = parse_ini_file("config.ini");

    try {     
      $db = new PDO("mysql:host={$config['host']};dbname={$config['db']};charset={$config['charset']}", $config['user'], $config['pass']);
      $db->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
      $query_select = "SELECT PASSWORD, ACTIVE, ROLE FROM USERS WHERE USERNAME = :username";
      $stmt_select = $db->prepare($query_select);
      $stmt_select->execute( array(":username"=> $username) );

      if ($row = $stmt_select->fetch() ) {
        $hashed_password = $row["PASSWORD"];
        $active = $row["ACTIVE"];

        if ($active) {

          if (password_verify($password, $hashed_password)) {
            session_start();
            $_SESSION["username"] = $username;
            $token = md5($_SERVER["REMOTE_ADDR"].$_SERVER["HTTP_USER_AGENT"]);
            $_SESSION["token"] = $token;

            $query_update = "UPDATE USERS SET LAST_LOGIN = NOW(), TOKEN = :token WHERE USERNAME = :username";
            $stmt_update = $db->prepare($query_update);
            $stmt_update->execute( array(":username"=> $username, ":token" => $token) );

            if ($stmt_update) {
              header("Location: index.php");

            } else {
              $error_message = "internal error";
              // add "cannot update database after login" to error log
            }
            
          } else {
            $error_message = "incorrect username or password";
          }

        } else {
          $error_message = "account is inactive or invalid";
        }

      } else {
        $error_message = "icorrect username or password";
      }

    } catch (PDOException $e) {
      $error_message = "internal error";
      // add $e to error log
		}

  } else {
    $error_message = "empty username or password ";
  }

}
$page_title = "Log in";
include("views/inc.header.php");
//echo password_hash("qwaszx12", PASSWORD_DEFAULT);
include("views/inc.login.php");
include("views/inc.footer.php");