<?php
header('Content-Type: application/json');
require 'conexao.php';
require_once 'auth.php';
exigirAdmin();

$dados = json_decode(file_get_contents("php://input"));

$obrigatorios = ['marca', 'nome', 'tipo', 'ano', 'combustivel', 'cambio', 'km', 'preco', 'imagem'];
foreach ($obrigatorios as $campo) {
    if (!isset($dados->$campo) || $dados->$campo === '') {
        echo json_encode(["sucesso" => false, "mensagem" => "Campo obrigatório ausente: $campo."]);
        exit;
    }
}

$marca           = $dados->marca;
$nome            = $dados->nome;
$tipo            = $dados->tipo;
$ano             = (int) $dados->ano;
$cor             = $dados->cor ?? '';
$combustivel     = $dados->combustivel;
$cambio          = $dados->cambio;
$potencia        = $dados->potencia ?? '';
$km              = (int) $dados->km;
$preco           = (float) $dados->preco;
$status          = $dados->status ?? '';
$destaque        = !empty($dados->destaque) ? 1 : 0;
$imagem          = $dados->imagem;
$descricao       = $dados->descricao ?? '';
$caracteristicas = $dados->caracteristicas ?? '';

$sql = "INSERT INTO carros (
            marca, nome, tipo, ano, cor, combustivel, cambio,
            potencia, km, preco, status, destaque, imagem, descricao, caracteristicas
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param(
    "sssissssidsisss",
    $marca, $nome, $tipo, $ano, $cor, $combustivel, $cambio,
    $potencia, $km, $preco, $status, $destaque, $imagem, $descricao, $caracteristicas
);

if ($stmt->execute()) {
    echo json_encode(["sucesso" => true, "mensagem" => "Veículo salvo no banco de dados!"]);
} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Erro do MySQL: " . $stmt->error]);
}

$conn->close();
