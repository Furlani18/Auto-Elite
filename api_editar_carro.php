<?php
header('Content-Type: application/json');
require 'conexao.php';

// Recebe o JSON enviado pelo JavaScript
$dados = json_decode(file_get_contents("php://input"));

// Verifica se pelo menos o ID e os campos principais chegaram
if (isset($dados->id) && isset($dados->marca) && isset($dados->nome)) {
    $id = (int) $dados->id;
    
    // Escapando as strings para evitar falhas de segurança (SQL Injection)
    $marca = $conn->real_escape_string($dados->marca);
    $nome = $conn->real_escape_string($dados->nome);
    $tipo = $conn->real_escape_string($dados->tipo);
    $ano = (int) $dados->ano;
    $cor = $conn->real_escape_string($dados->cor);
    $combustivel = $conn->real_escape_string($dados->combustivel);
    $cambio = $conn->real_escape_string($dados->cambio);
    $potencia = $conn->real_escape_string($dados->potencia);
    $km = (int) $dados->km;
    $preco = (float) $dados->preco;
    $status = $conn->real_escape_string($dados->status);
    $destaque = $dados->destaque ? 1 : 0; // Converte booleano para 1 ou 0 do MySQL
    $imagem = $conn->real_escape_string($dados->imagem);
    $descricao = $conn->real_escape_string($dados->descricao);
    $caracteristicas = $conn->real_escape_string($dados->caracteristicas);

    // Monta a query de UPDATE com os dados novos
    $sql = "UPDATE carros SET 
            marca = '$marca', 
            nome = '$nome', 
            tipo = '$tipo', 
            ano = $ano, 
            cor = '$cor', 
            combustivel = '$combustivel', 
            cambio = '$cambio', 
            potencia = '$potencia', 
            km = $km, 
            preco = $preco, 
            status = '$status', 
            destaque = $destaque, 
            imagem = '$imagem', 
            descricao = '$descricao', 
            caracteristicas = '$caracteristicas' 
            WHERE id = $id";

    // Executa no banco e retorna o resultado
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["sucesso" => true, "mensagem" => "Veículo atualizado com sucesso!"]);
    } else {
        echo json_encode(["sucesso" => false, "mensagem" => "Erro ao atualizar: " . $conn->error]);
    }
} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Dados incompletos. ID, Marca e Nome são obrigatórios."]);
}

$conn->close();
?>