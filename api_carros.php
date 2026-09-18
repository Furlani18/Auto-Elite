<?php
header('Content-Type: application/json; charset=utf-8');
require 'conexao.php';

$sql = "SELECT * FROM carros ORDER BY id DESC";
$resultado = $conn->query($sql);
$carros = array();

if ($resultado && $resultado->num_rows > 0) {
    while($row = $resultado->fetch_assoc()) {
        $row = array_change_key_case($row, CASE_LOWER);
        
        $row['preco'] = (float) $row['preco'];
        $row['km'] = (int) $row['km'];
        $row['ano'] = (int) $row['ano'];
        $row['views'] = (int) ($row['views'] ?? 0);
        $row['destaque'] = $row['destaque'] == 1 ? true : false;
        
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