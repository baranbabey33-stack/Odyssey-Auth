<?php
if (session_status() == PHP_SESSION_NONE) { session_start(); }

/* Veritabanı Bilgileri */
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'root');      // DEĞİŞTİR
define('DB_PASSWORD', '');          // DEĞİŞTİR
define('DB_NAME', 'test');          // DEĞİŞTİR

// Hata Raporlama ve Güvenilir Bağlantı
try {
    $link = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
    if($link === false){ throw new Exception(mysqli_connect_error()); }
    mysqli_set_charset($link, "utf8mb4");
} catch (Exception $e) {
    // config.php'nin kendisi çökmemeli, ama diğer dosyaların kullanması için hatayı raporlamalı.
    // Bu, diğer PHP dosyalarının anlamlı bir JSON hatası göndermesine olanak tanır.
    if (!defined('API_REQUEST')) { // API isteği değilse, hata sayfasını göster
         die("Veritabanı bağlantısı kurulamadı. Lütfen ayarları kontrol edin. Hata: " . $e->getMessage());
    }
    // API isteği ise, diğer dosya JSON hatası üretecek.
}

/* Sosyal Giriş Ayarları */
define('APP_URL', 'http://localhost/ODYSSEY_FINAL'); 

define('GOOGLE_CLIENT_ID', 'BURAYA_GOOGLE_CLIENT_ID_YAZIN');
define('GOOGLE_CLIENT_SECRET', 'BURAYA_GOOGLE_CLIENT_SECRET_YAZIN');
define('GITHUB_CLIENT_ID', 'BURAYA_GITHUB_CLIENT_ID_YAZIN');
define('GITHUB_CLIENT_SECRET', 'BURAYA_GITHUB_CLIENT_SECRET_YAZIN');

define('GOOGLE_REDIRECT_URI', APP_URL . '/php/callback.php?provider=google');
define('GITHUB_REDIRECT_URI', APP_URL . '/php/callback.php?provider=github');
?>
