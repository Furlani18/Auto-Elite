<?php
header('Content-Type: application/json');
require 'conexao.php';

$dados = json_decode(file_get_contents("php://input"));

if ($dados) {
    $nome      = $dados->nome ?? '';
    $telefone  = $dados->telefone ?? '';
    $email     = $dados->email ?? '';
    $mensagem  = $dados->mensagem ?? '';

    // Pega o ID do veículo, se existir (se não, grava como nulo/0)
    $veiculoId = isset($dados->veiculoId) ? (int)$dados->veiculoId : 0;

    // Todo novo contato entra com o status "novo"
    $status    = 'novo';
    $dataAtual = date('Y-m-d H:i:s'); // Salva a hora exata do contato

    $sql = "INSERT INTO avaliacao (nome, telefone, email, mensagem, veiculo_id, status, data_criacao)
            VALUES (?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssiss", $nome, $telefone, $email, $mensagem, $veiculoId, $status, $dataAtual);

    if ($stmt->execute()) {
        echo json_encode(["sucesso" => true, "mensagem" => "Mensagem enviada com sucesso!"]);
    } else {
        echo json_encode(["sucesso" => false, "mensagem" => "Erro no banco: " . $stmt->error]);
    }
} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Nenhum dado recebido."]);
}

$conn->close();
?>
