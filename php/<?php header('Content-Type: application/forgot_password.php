<?php
header('Content-Type: application/json');
if ($_SERVER["REQUEST_METHOD"] == "POST" && !empty($_POST['email']) && filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
    // Gerçek uygulamada: E-posta gönderimi ve token oluşturma işlemleri yapılır.
    echo json_encode([ 'status' => 'success', 'message' => 'Eğer bu e-posta adresi sistemimizde kayıtlıysa, bir şifre sıfırlama bağlantısı gönderildi.' ]);
} else {
    echo json_encode([ 'status' => 'error', 'message' => 'Lütfen geçerli bir e-posta adresi girin.' ]);
}
exit();
?>
