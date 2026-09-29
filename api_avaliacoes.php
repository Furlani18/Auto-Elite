<?php
header('Content-Type: application/json');
require 'conexao.php';
require 'mail_config.php';
require 'phpmailer/PHPMailer.php';
require 'phpmailer/SMTP.php';
require 'phpmailer/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$dados = json_decode(file_get_contents("php://input"));

// Honeypot: campo escondido que só bot preenche. Finge sucesso e não grava nada.
if (!empty($dados->empresa)) {
    echo json_encode(["sucesso" => true, "mensagem" => "Mensagem enviada com sucesso!"]);
    exit;
}

if ($dados) {
    $nome      = $dados->nome ?? '';
    $telefone  = $dados->telefone ?? '';
    $email     = $dados->email ?? '';
    $mensagem  = $dados->mensagem ?? '';

    // Pega o ID do veículo, se existir (se não, grava como nulo/0)
    $veiculoId = isset($dados->veiculoId) ? (int)$dados->veiculoId : 0;

    // Todo novo contato entra com o status "novo"
    $status    = 'novo';
    $dataAtual = date('Y-m-d H:i:s'); // Salva a hora exata do contato

    $sql = "INSERT INTO avaliacao (nome, telefone, email, mensagem, veiculo_id, status, data_criacao)
            VALUES (?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssiss", $nome, $telefone, $email, $mensagem, $veiculoId, $status, $dataAtual);

    if ($stmt->execute()) {
        echo json_encode(["sucesso" => true, "mensagem" => "Mensagem enviada com sucesso!"]);

        // Avisa o admin por e-mail — não deixa uma falha de envio quebrar a resposta ao cliente
        try {
            $mail = new PHPMailer(true);
            $mail->isSMTP();
            $mail->Host = SMTP_HOST;
            $mail->SMTPAuth = true;
            $mail->Username = SMTP_USER;
            $mail->Password = SMTP_PASS;
            $mail->SMTPSecure = 'tls';
            $mail->Port = SMTP_PORT;
            $mail->CharSet = 'UTF-8';

            $mail->setFrom(SMTP_USER, SMTP_FROM_NOME);
            $mail->addAddress(SMTP_USER);

            $mail->isHTML(false);
            $mail->Subject = '🔔 Novo lead — ' . $nome;
            $mail->Body = "Novo contato recebido pelo site:\n\n"
                . "Nome: $nome\n"
                . "Telefone: $telefone\n"
                . "E-mail: $email\n"
                . "Mensagem: $mensagem\n\n"
                . "Veja no painel: " . SITE_URL . "/admin.html";

            $mail->send();
        } catch (Exception $e) {
            error_log('Falha ao notificar lead por e-mail: ' . $e->getMessage());
        }
    } else {
        echo json_encode(["sucesso" => false, "mensagem" => "Erro no banco: " . $stmt->error]);
    }
} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Nenhum dado recebido."]);
}

$conn->close();
