<?php
header('Content-Type: application/json');
$dir = dirname(__FILE__) . '/uploads/';

$response = [
    'exists' => file_exists($dir),
    'is_dir' => is_dir($dir),
    'is_writable' => is_writable($dir),
    'permissions' => substr(sprintf('%o', fileperms($dir)), -4),
    'contents' => file_exists($dir) ? scandir($dir) : [],
    'full_path' => $dir,
    'document_root' => $_SERVER['DOCUMENT_ROOT']
];

echo json_encode($response, JSON_PRETTY_PRINT);
