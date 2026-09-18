<?php
header('Content-Type: application/json');
require 'conexao.php';
require_once 'auth.php';
exigirAdmin();
require_once 'backup_helper.php';

try {
    executarBackup($conn);
    echo json_encode(["sucesso" => true, "mensagem" => "Backup enviado por e-mail."]);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode(["sucesso" => false, "mensagem" => "Erro ao enviar backup: " . $e->getMessage()]);
}

$conn->close();
