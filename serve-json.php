<?php
$filename = 'data.json';
$maxAge = 3600; // Cache the file for 1 hour

header('Content-Type: application/json');
header('Cache-Control: max-age=' . $maxAge);

readfile($filename);
?>
