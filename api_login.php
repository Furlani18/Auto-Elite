<?php
header('Content-Type: application/json');
require 'conexao.php';
require_once 'backup_helper.php';

session_start();

const MAX_TENTATIVAS = 5;
const BLOQUEIO_MINUTOS = 15;

$dados = json_decode(file_get_contents("php://input"));

if (isset($dados->email) && isset($dados->senha)) {
    $email = $dados->email;
    $senha_digitada = $dados->senha;

    $stmt = $conn->prepare("
        SELECT *,
               (BLOQUEADO_ATE IS NOT NULL AND BLOQUEADO_ATE > NOW()) AS esta_bloqueado,
               GREATEST(TIMESTAMPDIFF(MINUTE, NOW(), BLOQUEADO_ATE), 1) AS minutos_restantes
        FROM clientes WHERE EMAIL = ?
    ");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows > 0) {
        $usuario = $resultado->fetch_assoc();

        if ($usuario['esta_bloqueado']) {
            $minutosRestantes = (int) $usuario['minutos_restantes'];
            echo json_encode(["sucesso" => false, "mensagem" => "Muitas tentativas erradas. Tente novamente em $minutosRestantes minuto(s)."]);
        } elseif (password_verify($senha_digitada, $usuario['SENHA'])) {
            $reset = $conn->prepare("UPDATE clientes SET TENTATIVAS_FALHAS = 0, BLOQUEADO_ATE = NULL WHERE ID = ?");
            $reset->bind_param("i", $usuario['ID']);
            $reset->execute();

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

            // Aproveita o login do admin pra manter o backup diário em dia
            if ($usuario['PERFIL'] === 'admin') {
                backupDiarioSeNecessario($conn);
            }
        } else {
            $tentativas = (int) $usuario['TENTATIVAS_FALHAS'] + 1;

            if ($tentativas >= MAX_TENTATIVAS) {
                $minutos = BLOQUEIO_MINUTOS;
                $upd = $conn->prepare("UPDATE clientes SET TENTATIVAS_FALHAS = 0, BLOQUEADO_ATE = DATE_ADD(NOW(), INTERVAL ? MINUTE) WHERE ID = ?");
                $upd->bind_param("ii", $minutos, $usuario['ID']);
                $upd->execute();
                echo json_encode(["sucesso" => false, "mensagem" => "Muitas tentativas erradas. Conta bloqueada por " . BLOQUEIO_MINUTOS . " minutos."]);
            } else {
                $upd = $conn->prepare("UPDATE clientes SET TENTATIVAS_FALHAS = ? WHERE ID = ?");
                $upd->bind_param("ii", $tentativas, $usuario['ID']);
                $upd->execute();
                echo json_encode(["sucesso" => false, "mensagem" => "Senha incorreta."]);
            }
        }
    } else {
        echo json_encode(["sucesso" => false, "mensagem" => "Usuário não encontrado."]);
    }
} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Dados incompletos."]);
}

$conn->close();
