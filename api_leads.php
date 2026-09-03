<?php
header('Content-Type: application/json');
require 'conexao.php';

// Busca todas as avaliações/leads, da mais nova para a mais antiga
$sql = "SELECT * FROM avaliacao ORDER BY id DESC";
$resultado = $conn->query($sql);
$leads = array();

if ($resultado && $resultado->num_rows > 0) {
    while($row = $resultado->fetch_assoc()) {
        $row = array_change_key_case($row, CASE_LOWER);
        $leads[] = $row;
    }
}

echo json_encode($leads);
$conn->close();
?>