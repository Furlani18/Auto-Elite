<?php
header('Content-Type: application/json');
require 'conexao.php';
require_once 'auth.php';
exigirAdmin();

$dados = json_decode(file_get_contents("php://input"));

if (isset($dados->carroId) && isset($dados->url)) {
    $carroId = (int) $dados->carroId;
    $url = $dados->url;

    $stmt = $conn->prepare("INSERT INTO carro_imagens (CARRO_ID, URL) VALUES (?, ?)");
    $stmt->bind_param("is", $carroId, $url);

    if ($stmt->execute()) {
        echo json_encode(["sucesso" => true, "id" => $stmt->insert_id, "url" => $url]);
    } else {
        echo json_encode(["sucesso" => false, "mensagem" => "Erro ao salvar: " . $stmt->error]);
    }
} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Dados incompletos."]);
}

$conn->close();
