<?php
header('Content-Type: application/json');
require 'conexao.php';

$dados = json_decode(file_get_contents("php://input"));

if (isset($dados->id) && isset($dados->status)) {
    $id = (int) $dados->id;
    $status = $conn->real_escape_string($dados->status);

    $sql = "UPDATE avaliacao SET status = '$status' WHERE id = $id";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["sucesso" => true, "mensagem" => "Status atualizado!"]);
    } else {
        echo json_encode(["sucesso" => false, "mensagem" => "Erro ao atualizar: " . $conn->error]);
    }
} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Dados incompletos."]);
}
$conn->close();
?>