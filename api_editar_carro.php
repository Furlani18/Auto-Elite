<?php
header('Content-Type: application/json');
require 'conexao.php';
require_once 'auth.php';
exigirAdmin();

$dados = json_decode(file_get_contents("php://input"));

$obrigatorios = ['id', 'marca', 'nome', 'tipo', 'ano', 'combustivel', 'cambio', 'km', 'preco', 'imagem'];
foreach ($obrigatorios as $campo) {
    if (!isset($dados->$campo) || $dados->$campo === '') {
        echo json_encode(["sucesso" => false, "mensagem" => "Campo obrigatório ausente: $campo."]);
        exit;
    }
}

$id              = (int) $dados->id;
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

$sql = "UPDATE carros SET
            marca = ?, nome = ?, tipo = ?, ano = ?, cor = ?, combustivel = ?, cambio = ?,
            potencia = ?, km = ?, preco = ?, status = ?, destaque = ?, imagem = ?,
            descricao = ?, caracteristicas = ?
        WHERE id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param(
    "sssissssidsisssi",
    $marca, $nome, $tipo, $ano, $cor, $combustivel, $cambio,
    $potencia, $km, $preco, $status, $destaque, $imagem, $descricao, $caracteristicas, $id
);

if ($stmt->execute()) {
    echo json_encode(["sucesso" => true, "mensagem" => "Veículo atualizado com sucesso!"]);
} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Erro ao atualizar: " . $stmt->error]);
}

$conn->close();
