<?php
define('API_REQUEST', true);
header('Content-Type: application/json');

require_once 'config.php';
if (!isset($link) || $link === false) { echo json_encode(['status' => 'error', 'message' => 'Veritabanı bağlantısı başarısız. Lütfen config dosyasını kontrol edin.']); exit; }

$response = ['status' => 'error', 'message' => 'Geçersiz istek.'];

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $kullanici_adi = trim($_POST['kullanici_adi']);
    $sifre = trim($_POST['sifre']);

    if (empty($kullanici_adi) || empty($sifre)) {
        $response['message'] = 'Kullanıcı adı ve şifre boş bırakılamaz.';
    } else {
        $sql = "SELECT id, kullanici_adi, sifre FROM kullanicilar WHERE kullanici_adi = ?";
        if ($stmt = mysqli_prepare($link, $sql)) {
            mysqli_stmt_bind_param($stmt, "s", $kullanici_adi);
            if (mysqli_stmt_execute($stmt)) {
                mysqli_stmt_store_result($stmt);
                if (mysqli_stmt_num_rows($stmt) == 1) {
                    mysqli_stmt_bind_result($stmt, $id, $username_db, $hashed_sifre);
                    if (mysqli_stmt_fetch($stmt)) {
                        if (password_verify($sifre, $hashed_sifre)) {
                            session_regenerate_id();
                            $_SESSION["loggedin"] = true;
                            $_SESSION["id"] = $id;
                            $_SESSION["kullanici_adi"] = $username_db;
                            $response = ['status' => 'success', 'message' => 'Giriş başarılı! Yönlendiriliyorsunuz...'];
                        } else {
                            $response['message'] = 'Geçersiz kullanıcı adı veya şifre.';
                        }
                    }
                } else {
                    $response['message'] = 'Geçersiz kullanıcı adı veya şifre.';
                }
            } else { $response['message'] = 'Bir sorun oluştu. Lütfen tekrar deneyin.'; }
            mysqli_stmt_close($stmt);
        } else { $response['message'] = 'Veritabanı sorgu hatası.'; }
    }
}
mysqli_close($link);
echo json_encode($response);
?>
