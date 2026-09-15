<?php
header('Content-Type: application/json');
require 'conexao.php';

$dados = json_decode(file_get_contents("php://input"));

if (isset($dados->nome) && isset($dados->email) && isset($dados->senha)) {
    $nome = $dados->nome;
    $email = $dados->email;
    $senha = password_hash($dados->senha, PASSWORD_DEFAULT);
    $perfil = 'cliente'; // Todo novo cadastro pelo site entra como cliente

    $check = $conn->prepare("SELECT ID FROM clientes WHERE EMAIL = ?");
    $check->bind_param("s", $email);
    $check->execute();

    if ($check->get_result()->num_rows > 0) {
        echo json_encode(["sucesso" => false, "mensagem" => "Esse e-mail já está cadastrado."]);
    } else {
        $stmt = $conn->prepare("INSERT INTO clientes (NOME, EMAIL, SENHA, PERFIL) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $nome, $email, $senha, $perfil);

        if ($stmt->execute()) {
            echo json_encode(["sucesso" => true, "mensagem" => "Conta criada com sucesso!"]);
        } else {
            echo json_encode(["sucesso" => false, "mensagem" => "Erro no banco: " . $stmt->error]);
        }
    }
} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Dados incompletos."]);
}

$conn->close();
?>
