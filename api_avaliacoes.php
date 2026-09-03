<?php
header('Content-Type: application/json');
require 'conexao.php';

$dados = json_decode(file_get_contents("php://input"));

if ($dados) {
    // Limpeza de segurança
    $nome      = $conn->real_escape_string($dados->nome);
    $telefone  = $conn->real_escape_string($dados->telefone);
    $email     = $conn->real_escape_string($dados->email);
    $mensagem  = $conn->real_escape_string($dados->mensagem);
    
    // Pega o ID do veículo, se existir (se não, grava como nulo/0)
    $veiculoId = isset($dados->veiculoId) ? (int)$dados->veiculoId : 0;
    
    // Todo novo contato entra com o status "novo"
    $status    = 'novo'; 
    $dataAtual = date('Y-m-d H:i:s'); // Salva a hora exata do contato

    // Monta o SQL para salvar na tabela 'avaliacao'
    $sql = "INSERT INTO avaliacao (nome, telefone, email, mensagem, veiculo_id, status, data_criacao) 
            VALUES ('$nome', '$telefone', '$email', '$mensagem', $veiculoId, '$status', '$dataAtual')";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["sucesso" => true, "mensagem" => "Mensagem enviada com sucesso!"]);
    } else {
        echo json_encode(["sucesso" => false, "mensagem" => "Erro no banco: " . $conn->error]);
    }
} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Nenhum dado recebido."]);
}

$conn->close();
?>