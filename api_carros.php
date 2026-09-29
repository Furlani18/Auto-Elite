<?php
header('Content-Type: application/json; charset=utf-8');
require 'conexao.php';

$sql = "SELECT * FROM carros ORDER BY id DESC";
$resultado = $conn->query($sql);
$carros = array();

// Agrupa as fotos extras de cada carro num mapa carro_id => [urls]
$galerias = [];
$resGaleria = $conn->query("SELECT ID, CARRO_ID, URL FROM carro_imagens ORDER BY ORDEM, ID");
if ($resGaleria) {
    while ($foto = $resGaleria->fetch_assoc()) {
        $galerias[$foto['CARRO_ID']][] = ["id" => (int) $foto['ID'], "url" => $foto['URL']];
    }
}

if ($resultado && $resultado->num_rows > 0) {
    while($row = $resultado->fetch_assoc()) {
        $row = array_change_key_case($row, CASE_LOWER);

        $row['preco'] = (float) $row['preco'];
        $row['km'] = (int) $row['km'];
        $row['ano'] = (int) $row['ano'];
        $row['views'] = (int) ($row['views'] ?? 0);
        $row['destaque'] = $row['destaque'] == 1 ? true : false;
        $row['galeria'] = $galerias[$row['id']] ?? [];

        if (!empty($row['caracteristicas'])) {
            $row['caracteristicas'] = array_map('trim', explode(',', $row['caracteristicas']));
        } else {
            $row['caracteristicas'] = [];
        }
        $carros[] = $row;
    }
}

$json = json_encode($carros, JSON_UNESCAPED_UNICODE);

// Evita tela branca: se o encode falhar, retorna o motivo em vez de nada
if ($json === false) {
    echo json_encode(["erro" => "Falha no JSON: " . json_last_error_msg()]);
} else {
    echo $json;
}

$conn->close();