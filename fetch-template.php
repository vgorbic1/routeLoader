<?php 
if (isset($_GET["db"])) {
  $db_name = filter_var($_GET["db"], FILTER_SANITIZE_STRING);
  try {
    $config = parse_ini_file("config.ini");   
    $db = new PDO("mysql:host={$config['host']};dbname={$config['db']};charset={$config['charset']}", $config['user'], $config['pass']);
    $db->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
    $query_select = "SELECT * FROM TEMPLATES WHERE NAME = :dbname";
    $stmt = $db->prepare($query_select);
    $stmt->bindParam(":dbname", $db_name);
    $stmt->execute();
    $template = $stmt->fetch();
    echo $template["content"];
  } catch (PDOException $e) {
    $error_message = "{internal error}";
    echo $error_message;
  } 
}
?>