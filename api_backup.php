<?php
header('Content-Type: application/json');
require 'conexao.php';
require 'mail_config.php';
require 'phpmailer/PHPMailer.php';
require 'phpmailer/SMTP.php';
require 'phpmailer/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$secretRecebido = $_SERVER['HTTP_X_BACKUP_SECRET'] ?? '';
if (!hash_equals(BACKUP_SECRET, $secretRecebido)) {
    http_response_code(401);
    echo json_encode(["sucesso" => false, "mensagem" => "Não autorizado."]);
    exit;
}

$tabelas = ['carros', 'clientes', 'avaliacao'];
$dump = "-- Backup AutoElite — " . date('Y-m-d H:i:s') . "\n\n";

foreach ($tabelas as $tabela) {
    $criar = $conn->query("SHOW CREATE TABLE `$tabela`")->fetch_assoc();
    $dump .= "DROP TABLE IF EXISTS `$tabela`;\n" . $criar['Create Table'] . ";\n\n";

    $resultado = $conn->query("SELECT * FROM `$tabela`");
    while ($linha = $resultado->fetch_assoc()) {
        $colunas = array_keys($linha);
        $valores = array_map(function ($v) use ($conn) {
            return $v === null ? 'NULL' : "'" . $conn->real_escape_string($v) . "'";
        }, array_values($linha));
        $dump .= "INSERT INTO `$tabela` (`" . implode('`, `', $colunas) . "`) VALUES (" . implode(', ', $valores) . ");\n";
    }
    $dump .= "\n";
}

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
    $mail->addAddress(SMTP_USER);
    $mail->addStringAttachment($dump, 'backup_autoelite_' . date('Y-m-d') . '.sql');

    $mail->isHTML(false);
    $mail->Subject = 'Backup AutoElite — ' . date('d/m/Y');
    $mail->Body = 'Backup automático do banco de dados em anexo.';

    $mail->send();
    echo json_encode(["sucesso" => true, "mensagem" => "Backup enviado por e-mail."]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["sucesso" => false, "mensagem" => "Erro ao enviar backup: " . $mail->ErrorInfo]);
}

$conn->close();
