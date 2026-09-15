<?php
header('Content-Type: application/json');
require 'conexao.php';

session_start();

$dados = json_decode(file_get_contents("php://input"));

if (isset($dados->email) && isset($dados->senha)) {
    $email = $dados->email;
    $senha_digitada = $dados->senha;

    $stmt = $conn->prepare("SELECT * FROM clientes WHERE EMAIL = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows > 0) {
        $usuario = $resultado->fetch_assoc();

        if (password_verify($senha_digitada, $usuario['SENHA'])) {
            $_SESSION['usuario'] = [
                "id" => $usuario['ID'],
                "email" => $usuario['EMAIL'],
                "role" => $usuario['PERFIL'],
            ];

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
