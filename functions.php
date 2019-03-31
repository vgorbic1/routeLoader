<?php

function create_delete_set($route_names) {
  $rows_to_delete = array();
  for ($i = 0; $i < count($route_names); $i++) {
    $rows_to_delete[] = array(
      "SESSION_NAME" => $route_names[$i],
      "CYCLE" => substr($route_names[$i], -4)
    );
  }
  return $rows_to_delete;
}

function create_insert_set($routes) {
  $rows_to_insert = array();
  for ($i = 0; $i < count($routes); $i++) {
    $assoc_row_sets = array();
    $keys = $routes[$i][0];
    foreach ($routes[$i] as $index => $row) {
      if ($index != 0) {
        $assoc_rows = array();
        foreach ($row as $ind => $record) {
          $assoc_rows[$keys[$ind]] = $record; 
        }
        $assoc_rows_sets[] = $assoc_rows;
      }
    }
    $rows_to_insert = $assoc_rows_sets;
  }
  return $rows_to_insert;
}

function pdo_multi_delete($tableName, $data, $pdoObject) {
  $toBind = array();
  $sql = "DELETE FROM `$tableName` WHERE ";
  foreach ($data as $arrayIndex => $row) {
    foreach ($row as $key => $element) {
      $toBind[":" . $key . $arrayIndex] = $element;
      $sql .= $key . " = :" . $key . $arrayIndex . " AND ";
    }
    $sql = substr_replace($sql, "", -5); // remove trailing AND
    $sql .= " OR ";
  }
  $sql = substr_replace($sql, "", -4); // remove trailing OR
  $pdoStatement = $pdoObject->prepare($sql);
  foreach($toBind as $param => $val){
      $pdoStatement->bindValue($param, $val);
  }
  return $pdoStatement->execute();
}

/**
 * A custom function that automatically constructs a multi insert statement.
 * 
 * @param string $tableName Name of the table we are inserting into.
 * @param array $data An "array of arrays" containing our row data.
 * @param PDO $pdoObject Our PDO object.
 * @return boolean TRUE on success. FALSE on failure.
 */
function pdo_multi_insert($tableName, $data, $pdoObject) {
    $rowsSQL = array();
    $toBind = array();
    $columnNames = array_keys($data[0]);
    foreach($data as $arrayIndex => $row){
        $params = array();
        foreach($row as $columnName => $columnValue){
            $param = ":" . $columnName . $arrayIndex;
            $params[] = $param;
            $toBind[$param] = $columnValue; 
        }
        $rowsSQL[] = "(" . implode(", ", $params) . ")";
    }
    $sql = "INSERT INTO `$tableName` (" . implode(", ", $columnNames) . ") VALUES " . implode(", ", $rowsSQL);
    $pdoStatement = $pdoObject->prepare($sql);
    foreach($toBind as $param => $val){
        $pdoStatement->bindValue($param, $val);
    }
    $pdoStatement->execute();
    return $pdoStatement->rowCount();
}

function simple_crypt( $string, $action = "e", $secret_key, $secret_iv) {
  $output = false;
  $encrypt_method = "AES-256-CBC";
  $key = hash("sha256", $secret_key );
  $iv = substr(hash("sha256", $secret_iv ), 0, 16);
  if ($action === "e") {
    $output = base64_encode( openssl_encrypt($string, $encrypt_method, $key, 0, $iv) );
  }
  else if ($action === "d") {
    $output = openssl_decrypt(base64_decode($string), $encrypt_method, $key, 0, $iv );
  }
  return $output;
}