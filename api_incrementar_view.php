<?php
header('Content-Type: application/json');
require 'conexao.php';

$dados = json_decode(file_get_contents("php://input"));

if (isset($dados->id)) {
    $id = (int) $dados->id;

    $stmt = $conn->prepare("UPDATE carros SET views = views + 1 WHERE id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode(["sucesso" => true]);
    } else {
        echo json_encode(["sucesso" => false, "mensagem" => "Erro ao registrar visualização: " . $stmt->error]);
    }
} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Nenhum ID fornecido."]);
}

$conn->close();
