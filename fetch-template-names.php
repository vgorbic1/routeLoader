<?php
try {
  $config = parse_ini_file("config.ini");   
  $db = new PDO("mysql:host={$config['host']};dbname={$config['db']};charset={$config['charset']}", $config['user'], $config['pass']);
  $db->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
  $query = "SELECT NAME FROM TEMPLATES";
  $stmt = $db->prepare($query);
  $stmt->execute();
  $template_names = implode(",", $stmt->fetchAll(PDO::FETCH_COLUMN));
  echo $template_names;
} catch (PDOException $e) {
  $error_message = "error";
  echo $error_message;
} 