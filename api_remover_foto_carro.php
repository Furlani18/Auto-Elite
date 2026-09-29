<?php
header('Content-Type: application/json');
require 'conexao.php';
require_once 'auth.php';
exigirAdmin();

$dados = json_decode(file_get_contents("php://input"));

if (isset($dados->id)) {
    $id = (int) $dados->id;

    $stmt = $conn->prepare("DELETE FROM carro_imagens WHERE ID = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode(["sucesso" => true]);
    } else {
        echo json_encode(["sucesso" => false, "mensagem" => "Erro ao remover: " . $stmt->error]);
    }
} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Nenhum ID fornecido."]);
}

$conn->close();
