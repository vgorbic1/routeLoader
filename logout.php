<?php
session_start(); 

foreach (array_keys($_SESSION) as $key) unset($_SESSION[$key]);

session_regenerate_id(true); 
session_destroy();

header("Location: login.php");
