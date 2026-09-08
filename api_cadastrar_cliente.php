<?php
header('Content-Type: application/json');
require 'conexao.php';

$dados = json_decode(file_get_contents("php://input"));

if (isset($dados->nome) && isset($dados->email) && isset($dados->senha)) {
    $nome = $conn->real_escape_string($dados->nome);
    $email = $conn->real_escape_string($dados->email);
    $senha = password_hash($dados->senha, PASSWORD_DEFAULT); 
    $perfil = 'cliente'; // Todo novo cadastro pelo site entra como cliente

    $check = $conn->query("SELECT ID FROM clientes WHERE EMAIL = '$email'");
    
    if ($check->num_rows > 0) {
        echo json_encode(["sucesso" => false, "mensagem" => "Esse e-mail já está cadastrado."]);
    } else {
        // Usa os nomes exatos das suas colunas (adicionando o NOME que recomendei criar)
        $sql = "INSERT INTO clientes (NOME, EMAIL, SENHA, PERFIL) VALUES ('$nome', '$email', '$senha', '$perfil')";

        if ($conn->query($sql) === TRUE) {
            echo json_encode(["sucesso" => true, "mensagem" => "Conta criada com sucesso!"]);
        } else {
            echo json_encode(["sucesso" => false, "mensagem" => "Erro no banco: " . $conn->error]);
        }
    }
} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Dados incompletos."]);
}

$conn->close();
?>