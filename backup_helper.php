<?php
// Gera um dump SQL de carros/clientes/avaliacao e manda por e-mail.
// Usado tanto pelo botão manual (api_backup.php) quanto pelo gatilho automático (api_login.php).
function executarBackup($conn) {
    require_once __DIR__ . '/mail_config.php';
    require_once __DIR__ . '/phpmailer/PHPMailer.php';
    require_once __DIR__ . '/phpmailer/SMTP.php';
    require_once __DIR__ . '/phpmailer/Exception.php';

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

    $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
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
}

// Roda o backup no máximo 1x por dia, controlado por um arquivo de data.
function backupDiarioSeNecessario($conn) {
    $arquivoControle = __DIR__ . '/backups/ultimo_backup.txt';
    $hoje = date('Y-m-d');

    if (file_exists($arquivoControle) && trim(file_get_contents($arquivoControle)) === $hoje) {
        return; // já rodou hoje
    }

    if (!is_dir(__DIR__ . '/backups')) {
        mkdir(__DIR__ . '/backups', 0755, true);
    }

    try {
        executarBackup($conn);
        file_put_contents($arquivoControle, $hoje);
    } catch (\Throwable $e) {
        // Não deixa uma falha de backup quebrar o login do admin
        error_log('Falha no backup automático: ' . $e->getMessage());
    }
}
