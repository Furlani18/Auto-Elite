<?php
header('Content-Type: application/json');
require 'conexao.php';
require_once 'auth.php';
exigirAdmin();

$dados = json_decode(file_get_contents("php://input"));

if (isset($dados->id) && isset($dados->status)) {
    $id = (int) $dados->id;
    $status = $dados->status;

    $stmt = $conn->prepare("UPDATE avaliacao SET status = ? WHERE id = ?");
    $stmt->bind_param("si", $status, $id);

    if ($stmt->execute()) {
        echo json_encode(["sucesso" => true, "mensagem" => "Status atualizado!"]);
    } else {
        echo json_encode(["sucesso" => false, "mensagem" => "Erro ao atualizar: " . $stmt->error]);
    }
} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Dados incompletos."]);
}
$conn->close();
?>
