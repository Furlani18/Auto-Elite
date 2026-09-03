<?php
header('Content-Type: application/json');
require 'conexao.php';

$dados = json_decode(file_get_contents("php://input"));

if (isset($dados->id)) {
    $id = (int) $dados->id;
    
    // Deleta o carro cujo ID seja igual ao recebido
    $sql = "DELETE FROM carros WHERE id = $id";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["sucesso" => true, "mensagem" => "Veículo excluído com sucesso!"]);
    } else {
        echo json_encode(["sucesso" => false, "mensagem" => "Erro ao excluir: " . $conn->error]);
    }
} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Nenhum ID fornecido."]);
}

$conn->close();
?>