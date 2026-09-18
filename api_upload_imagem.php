<?php
header('Content-Type: application/json');
require_once 'auth.php';
exigirAdmin();

$TIPOS_PERMITIDOS = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
$TAMANHO_MAX = 4 * 1024 * 1024; // 4MB

if (!isset($_FILES['imagem']) || $_FILES['imagem']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(["sucesso" => false, "mensagem" => "Nenhuma imagem enviada."]);
    exit;
}

$arquivo = $_FILES['imagem'];

if ($arquivo['size'] > $TAMANHO_MAX) {
    echo json_encode(["sucesso" => false, "mensagem" => "Imagem maior que 4MB."]);
    exit;
}

$tipoReal = mime_content_type($arquivo['tmp_name']);
if (!isset($TIPOS_PERMITIDOS[$tipoReal])) {
    echo json_encode(["sucesso" => false, "mensagem" => "Formato não permitido. Use JPG, PNG, WEBP ou GIF."]);
    exit;
}

$pastaDestino = __DIR__ . '/uploads/carros/';
if (!is_dir($pastaDestino)) {
    mkdir($pastaDestino, 0755, true);
}

$nomeArquivo = uniqid('carro_', true) . '.' . $TIPOS_PERMITIDOS[$tipoReal];
$caminhoDestino = $pastaDestino . $nomeArquivo;

if (move_uploaded_file($arquivo['tmp_name'], $caminhoDestino)) {
    echo json_encode(["sucesso" => true, "url" => "uploads/carros/" . $nomeArquivo]);
} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Falha ao salvar a imagem no servidor."]);
}
