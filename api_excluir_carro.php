<?php
header('Content-Type: application/json');
require 'conexao.php';
require_once 'auth.php';
exigirAdmin();

$dados = json_decode(file_get_contents("php://input"));

if (isset($dados->id)) {
    $id = (int) $dados->id;

    $stmt = $conn->prepare("DELETE FROM carros WHERE id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode(["sucesso" => true, "mensagem" => "Veículo excluído com sucesso!"]);
    } else {
        echo json_encode(["sucesso" => false, "mensagem" => "Erro ao excluir: " . $stmt->error]);
    }
} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Nenhum ID fornecido."]);
}

$conn->close();
?>
