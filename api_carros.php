<?php
header('Content-Type: application/json');
require 'conexao.php';

// Busca todos os carros, ordenando dos mais recentes para os mais antigos
$sql = "SELECT * FROM carros ORDER BY id DESC";
$resultado = $conn->query($sql);
$carros = array();

if ($resultado && $resultado->num_rows > 0) {
    while($row = $resultado->fetch_assoc()) {
        
        // 🚨 MÁGICA AQUI: Força todos os nomes de colunas para minúsculo
        $row = array_change_key_case($row, CASE_LOWER);

        // Agora podemos converter os dados com segurança
        $row['preco'] = (float) $row['preco'];
        $row['km'] = (int) $row['km'];
        $row['ano'] = (int) $row['ano'];
        $row['destaque'] = $row['destaque'] == 1 ? true : false;
        
        // Trata as características para o modal
        if (!empty($row['caracteristicas'])) {
            $row['caracteristicas'] = array_map('trim', explode(',', $row['caracteristicas']));
        } else {
            $row['caracteristicas'] = [];
        }

        $carros[] = $row;
    }
}

echo json_encode($carros);
$conn->close();
?>