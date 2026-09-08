<?php
header('Content-Type: application/json');
require 'conexao.php';

$dados = json_decode(file_get_contents("php://input"));

if (isset($dados->email) && isset($dados->senha)) {
    $email = $conn->real_escape_string($dados->email);
    $senha_digitada = $dados->senha;

    $sql = "SELECT * FROM clientes WHERE EMAIL = '$email'";
    $resultado = $conn->query($sql);

    if ($resultado->num_rows > 0) {
        $usuario = $resultado->fetch_assoc();
        
        // Verifica a senha criptografada
        if (password_verify($senha_digitada, $usuario['SENHA']) || $senha_digitada === $usuario['SENHA']) {
            
            echo json_encode([
                "sucesso" => true, 
                "usuario" => [
                    "id" => $usuario['ID'],
                    "nome" => isset($usuario['NOME']) ? $usuario['NOME'] : 'Usuário',
                    "email" => $usuario['EMAIL'],
                    "role" => $usuario['PERFIL'], // Mapeando PERFIL para role para não quebrar seu JS
                    "avatar" => "👤"
                ]
            ]);
        } else {
            echo json_encode(["sucesso" => false, "mensagem" => "Senha incorreta."]);
        }
    } else {
        echo json_encode(["sucesso" => false, "mensagem" => "Usuário não encontrado."]);
    }
} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Dados incompletos."]);
}

$conn->close();
?>