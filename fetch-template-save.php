<?php
if (isset($_POST["name"], $_POST["signed"], $_POST["db"], $_POST["template"])) {
  $template_name = htmlspecialchars($_POST["name"]); 
  $created_by = htmlspecialchars($_POST["signed"]);
  $database_name = htmlspecialchars($_POST["db"]);
  $json_template = $_POST["template"];
  
  $config = parse_ini_file("config.ini");
  try {     
    $db = new PDO("mysql:host={$config['host']};dbname={$config['db']};charset={$config['charset']}", $config['user'], $config['pass']);
    $db->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);

    $query = "DELETE FROM TEMPLATES WHERE NAME = :name";
    $stmt = $db->prepare($query);
    $stmt->execute( array(":name" => $template_name) );
    $stmt->rowCount();
    $stmt = null;

    $query = "INSERT INTO TEMPLATES (NAME, CREATED_BY, CREATED_ON, CONTENT, `DATABASE`) 
              VALUES (:name, :createdby, NOW(), :content, :db)";
    $stmt = $db->prepare($query);
    $stmt->execute( array(":name" => $template_name, ":createdby" => $created_by, ":content" => $json_template, ":db" => $database_name) );

    if ($stmt->rowCount() > 0) {
      echo "{\"success\": \"Success! Template saved.\"}";
    } else {
      echo "{\"error\": \"unable to save template\"}";
    } 

  } catch (PDOException $e){
    echo "{\"error\": \"internal error {$e}\"}";
    // add $e to error log
  }

} else {
  echo "{\"error\": \"unable to save template (init)\"}";
}