<?php
header('Content-Type: application/json');

$upload_dir = __DIR__ . '/uploads';
$web_path = 'https://archivos.gestionesculturales.org/upload/uploads/';

$files = [];
if (is_dir($upload_dir)) {
    $items = scandir($upload_dir);
    foreach ($items as $item) {
        if ($item != "." && $item != "..") {
            $full_path = $upload_dir . '/' . $item;
            $files[] = [
                'name' => $item,
                'size' => filesize($full_path),
                'modified' => date("Y-m-d H:i:s", filemtime($full_path)),
                'url' => $web_path . $item,
                'permissions' => substr(sprintf('%o', fileperms($full_path)), -4)
            ];
        }
    }
}

echo json_encode([
    'status' => 'success',
    'files' => $files,
    'debug' => [
        'directory' => $upload_dir,
        'exists' => is_dir($upload_dir),
        'writable' => is_writable($upload_dir),
        'free_space' => disk_free_space($upload_dir),
        'permissions' => substr(sprintf('%o', fileperms($upload_dir)), -4)
    ]
], JSON_PRETTY_PRINT);
