<?php
header('Content-Type: application/json');
require 'conexao.php';

$dados = json_decode(file_get_contents("php://input"));

if (!isset($dados->token) || !isset($dados->novaSenha)) {
    echo json_encode(["sucesso" => false, "mensagem" => "Dados incompletos."]);
    exit;
}

$token = $dados->token;

$stmt = $conn->prepare("SELECT ID FROM clientes WHERE RESET_TOKEN = ? AND RESET_EXPIRA > NOW()");
$stmt->bind_param("s", $token);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows === 0) {
    echo json_encode(["sucesso" => false, "mensagem" => "Link inválido ou expirado. Solicite um novo."]);
    exit;
}

$usuario = $resultado->fetch_assoc();
$novaSenhaHash = password_hash($dados->novaSenha, PASSWORD_DEFAULT);

$upd = $conn->prepare("UPDATE clientes SET SENHA = ?, RESET_TOKEN = NULL, RESET_EXPIRA = NULL WHERE ID = ?");
$upd->bind_param("si", $novaSenhaHash, $usuario['ID']);

if ($upd->execute()) {
    echo json_encode(["sucesso" => true, "mensagem" => "Senha redefinida com sucesso! Faça login com a nova senha."]);
} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Erro ao redefinir: " . $upd->error]);
}

$conn->close();
