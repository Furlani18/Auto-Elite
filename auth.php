<?php
// Protege endpoints administrativos: chame exigirAdmin() logo após abrir a conexão.
function exigirAdmin() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['role'] !== 'admin') {
        http_response_code(401);
        echo json_encode(["sucesso" => false, "mensagem" => "Não autorizado."]);
        exit;
    }
}
