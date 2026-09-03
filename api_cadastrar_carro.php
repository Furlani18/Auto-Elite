<?php
// Define que a comunicação será via JSON
header('Content-Type: application/json');

// Conecta ao banco de dados
require 'conexao.php';

// Recebe os dados do formulário JavaScript
$dados = json_decode(file_get_contents("php://input"));

if ($dados) {
    // 1. Tratamento de segurança e conversão de tipos
    $marca           = $conn->real_escape_string($dados->marca);
    $nome            = $conn->real_escape_string($dados->nome);
    $tipo            = $conn->real_escape_string($dados->tipo);
    $ano             = (int) $dados->ano;
    $cor             = $conn->real_escape_string($dados->cor);
    $combustivel     = $conn->real_escape_string($dados->combustivel);
    $cambio          = $conn->real_escape_string($dados->cambio);
    $potencia        = $conn->real_escape_string($dados->potencia);
    $km              = (int) $dados->km;
    $preco           = (float) $dados->preco;
    $status          = $conn->real_escape_string($dados->status);
    $destaque        = $dados->destaque ? 1 : 0; // Converte booleano (true/false) para 1 ou 0
    $imagem          = $conn->real_escape_string($dados->imagem);
    $descricao       = $conn->real_escape_string($dados->descricao);
    $caracteristicas = $conn->real_escape_string($dados->caracteristicas);

    // 2. Monta o comando SQL de inserção
    $sql = "INSERT INTO carros (
                marca, nome, tipo, ano, cor, combustivel, cambio, 
                potencia, km, preco, status, destaque, imagem, descricao, caracteristicas
            ) VALUES (
                '$marca', '$nome', '$tipo', $ano, '$cor', '$combustivel', '$cambio', 
                '$potencia', $km, $preco, '$status', $destaque, '$imagem', '$descricao', '$caracteristicas'
            )";

    // 3. Executa e responde ao JavaScript
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["sucesso" => true, "mensagem" => "Veículo salvo no banco de dados!"]);
    } else {
        echo json_encode(["sucesso" => false, "mensagem" => "Erro do MySQL: " . $conn->error]);
    }
} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Nenhum dado foi recebido pelo servidor."]);
}

$conn->close();
?>