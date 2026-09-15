<?php
require_once __DIR__ . '/config.php';

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
    die("Erro de conexão: " . $conn->connect_error);
}

// Garante acentuação correta entre o ambiente local (XAMPP) e a hospedagem.
$conn->set_charset("utf8mb4");
?>
