<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', dirname(__FILE__) . '/error.log');

header("Access-Control-Allow-Origin: https://archivos.gestionesculturales.org"); // Replace with your frontend domain
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Max-Age: 86400");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

header('Content-Type: application/json');

// Initialize response array
$response = [
    'files' => [],
    'success' => false,
    'error' => null,
    'debug' => []
];

// Add server information to debug
$response['debug'][] = [
    'document_root' => $_SERVER['DOCUMENT_ROOT'],
    'script_filename' => $_SERVER['SCRIPT_FILENAME'],
    'current_dir' => dirname(__FILE__)
];

// Check if files were actually uploaded
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['error'] = 'Only POST method is allowed';
    echo json_encode($response);
    exit();
}

if (!isset($_FILES['files']) || empty($_FILES['files'])) {
    $response['error'] = 'No files were uploaded';
    echo json_encode($response);
    exit();
}

// Simple path handling
$target_dir = __DIR__ . '/uploads/';
if (!file_exists($target_dir)) {
    mkdir($target_dir, 0755, true);
}

// Verify directory is writable
if (!is_writable($target_dir)) {
    chmod($target_dir, 0755);
    if (!is_writable($target_dir)) {
        $response['error'] = 'Upload directory is not writable';
        $response['debug'][] = [
            'dir' => $target_dir,
            'permissions' => substr(sprintf('%o', fileperms($target_dir)), -4),
            'owner' => posix_getpwuid(fileowner($target_dir))
        ];
        echo json_encode($response);
        exit();
    }
}

// Verify upload configuration
$upload_max_filesize = ini_get('upload_max_filesize');
$post_max_size = ini_get('post_max_size');
$response['debug'][] = [
    'upload_max_filesize' => $upload_max_filesize,
    'post_max_size' => $post_max_size,
    'target_dir_writable' => is_writable($target_dir),
    'target_dir_perms' => substr(sprintf('%o', fileperms($target_dir)), -4)
];

// Validate files array structure
if (!isset($_FILES['files']['name']) || !is_array($_FILES['files']['name'])) {
    $response['error'] = 'Invalid file upload format';
    echo json_encode($response);
    exit();
}

foreach ($_FILES['files']['name'] as $key => $name) {
    $tmp_name = $_FILES['files']['tmp_name'][$key];
    $original_name = basename($name);
    $filename = time() . '-' . preg_replace("/[^a-zA-Z0-9.-]/", "_", $original_name);
    $target_file = $target_dir . $filename;

    try {
        if (move_uploaded_file($tmp_name, $target_file)) {
            chmod($target_file, 0644);
            clearstatcache(true, $target_file);

            $file_info = [
                'id' => $filename,
                'name' => $original_name,
                'type' => $_FILES['files']['type'][$key],
                'size' => $_FILES['files']['size'][$key],
                'url' => 'https://archivos.gestionesculturales.org/upload/uploads/' . $filename,
                'path' => $target_file,
                'exists' => file_exists($target_file),
                'permissions' => substr(sprintf('%o', fileperms($target_file)), -4)
            ];

            $response['files'][] = $file_info;
            $response['debug'][] = 'File uploaded successfully: ' . $target_file;
        } else {
            throw new Exception('Move failed');
        }
    } catch (Exception $e) {
        $response['debug'][] = [
            'error' => $e->getMessage(),
            'tmp_name' => $tmp_name,
            'target' => $target_file,
            'tmp_exists' => file_exists($tmp_name),
            'upload_error' => $_FILES['files']['error'][$key]
        ];
    }
}

$response['success'] = !empty($response['files']);
$response['debug']['final_check'] = [
    'dir_exists' => is_dir($target_dir),
    'dir_writable' => is_writable($target_dir),
    'dir_contents' => scandir($target_dir)
];

echo json_encode($response, JSON_PRETTY_PRINT);
?>
