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
$respostaGenerica = ["sucesso" => true, "mensagem" => "Se esse e-mail estiver cadastrado, enviamos um link de redefinição."];

if (!isset($dados->email)) {
    echo json_encode(["sucesso" => false, "mensagem" => "Informe o e-mail."]);
    exit;
}

$email = $dados->email;

$stmt = $conn->prepare("SELECT ID, NOME FROM clientes WHERE EMAIL = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows === 0) {
    // Não revela se o e-mail existe ou não
    echo json_encode($respostaGenerica);
    exit;
}

$usuario = $resultado->fetch_assoc();
$token = bin2hex(random_bytes(32));
$expira = date('Y-m-d H:i:s', strtotime('+1 hour'));

$upd = $conn->prepare("UPDATE clientes SET RESET_TOKEN = ?, RESET_EXPIRA = ? WHERE ID = ?");
$upd->bind_param("ssi", $token, $expira, $usuario['ID']);
$upd->execute();

$link = SITE_URL . '/login.html?reset=' . $token;

$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host = SMTP_HOST;
    $mail->SMTPAuth = true;
    $mail->Username = SMTP_USER;
    $mail->Password = SMTP_PASS;
    $mail->SMTPSecure = 'tls';
    $mail->Port = SMTP_PORT;
    $mail->CharSet = 'UTF-8';

    $mail->setFrom(SMTP_USER, SMTP_FROM_NOME);
    $mail->addAddress($email, $usuario['NOME'] ?? '');

    $mail->isHTML(true);
    $mail->Subject = 'Redefinição de senha — AutoElite';
    $mail->Body = "Olá! Recebemos um pedido para redefinir sua senha na AutoElite.<br><br>"
        . "<a href=\"$link\">Clique aqui para criar uma nova senha</a><br><br>"
        . "Esse link expira em 1 hora. Se você não pediu isso, pode ignorar este e-mail.";

    $mail->send();
} catch (Exception $e) {
    echo json_encode(["sucesso" => false, "mensagem" => "Erro ao enviar e-mail: " . $mail->ErrorInfo]);
    exit;
}

echo json_encode($respostaGenerica);

$conn->close();
