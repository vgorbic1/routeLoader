<?php 
//$_GET["db"] = "testdb";
if (isset($_GET["db"])) {
  $db_name = filter_var($_GET["db"], FILTER_SANITIZE_STRING);
  $error_message = "";
  try {
    $config = parse_ini_file("config.ini");   
    $db = new PDO("mysql:host={$config['host']};dbname={$config['db']};charset={$config['charset']}", $config['user'], $config['pass']);
    $db->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
    $query = "SELECT * FROM `DATABASES` WHERE `DB_NAME` = :dbname";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":dbname", $db_name);
    $stmt->execute();
    $database = $stmt->fetch();

    include("functions.php");
    $db_host = $database["db_host"];
    $db_charset = $database["db_charset"];
    $db_user = simple_crypt($database["db_user"], "d", $config["salt"], $config["pepper"]);
    $db_pass = simple_crypt($database["db_pass"], "d", $config["salt"], $config["pepper"]);
    $db_table = $database["tbl_routes"];

    $db = $stmt = null;
  } catch (PDOException $e) {
    $error_message = "{internal error {$e}}";
    echo $error_message;
  }

  if ($error_message == "") {
    try { 
      $db = new PDO("mysql:host={$db_host};dbname={$db_name};charset={$db_charset}", $db_user, $db_pass);
      $db->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
      $query = "DESC $db_table";
      $stmt = $db->prepare($query);
      $stmt->execute();
      $column_titles = $stmt->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode($column_titles);
    } catch (PDOException $e) {
      $error_message = "{internal error {$e}}";
      echo $error_message;
    }
  }
}
?>