<?php
define('API_REQUEST', true);
header('Content-Type: application/json');

require_once 'config.php';
if (!isset($link) || $link === false) { echo json_encode(['status' => 'error', 'message' => 'Veritabanı bağlantısı başarısız. Lütfen config dosyasını kontrol edin.']); exit; }

$response = ['status' => 'error', 'message' => 'Geçersiz istek.'];

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $kullanici_adi = trim($_POST['kullanici_adi']);
    $email = trim($_POST['email']);
    $sifre = trim($_POST['sifre']);

    if (empty($kullanici_adi) || empty($email) || empty($sifre)) {
        $response['message'] = 'Tüm alanlar zorunludur.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response['message'] = 'Geçersiz e-posta formatı.';
    } elseif (strlen($kullanici_adi) < 3) {
        $response['message'] = 'Kullanıcı adı en az 3 karakter olmalıdır.';
    } else {
        $hashed_sifre = password_hash($sifre, PASSWORD_DEFAULT);
        $sql = "INSERT INTO kullanicilar (kullanici_adi, email, sifre) VALUES (?, ?, ?)";

        if ($stmt = mysqli_prepare($link, $sql)) {
            mysqli_stmt_bind_param($stmt, "sss", $kullanici_adi, $email, $hashed_sifre);
            if (mysqli_stmt_execute($stmt)) {
                $response = ['status' => 'success', 'message' => 'Kayıt başarıyla tamamlandı! Şimdi giriş yapabilirsiniz.'];
            } else {
                if(mysqli_errno($link) == 1062) {
                    $response['message'] = 'Bu kullanıcı adı veya e-posta zaten kullanımda.';
                } else {
                     $response['message'] = 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.';
                }
            }
            mysqli_stmt_close($stmt);
        }
    }
}
mysqli_close($link);
echo json_encode($response);
?>
