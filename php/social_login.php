<?php
require_once '../config.php';

if (!isset($_GET['provider'])) {
    die("Sağlayıcı belirtilmedi.");
}

$provider = $_GET['provider'];
$auth_url = '';

switch ($provider) {
    case 'google':
        $params = [
            'response_type' => 'code',
            'client_id' => GOOGLE_CLIENT_ID,
            'redirect_uri' => GOOGLE_REDIRECT_URI,
            'scope' => 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
            'access_type' => 'offline'
        ];
        $auth_url = 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query($params);
        break;

    case 'github':
        $params = [
            'client_id' => GITHUB_CLIENT_ID,
            'redirect_uri' => GITHUB_REDIRECT_URI,
            'scope' => 'user:email'
        ];
        $auth_url = 'https://github.com/login/oauth/authorize?' . http_build_query($params);
        break;

    default:
        die("Geçersiz sağlayıcı.");
}

header('Location: ' . $auth_url);
exit();
?>```

#### **`callback.php` (Yeni)**

Google/GitHub'dan dönen kullanıcıyı yakalar, bilgilerini alır ve veritabanına işler.

```php
<?php
require_once '../config.php';

// ... (Bu dosyanın tüm içeriği bir sonraki mesajda olacak, karakter limitinden dolayı)
// ÖNEMLİ: Bu dosyanın içeriği çok uzun olduğu için bir sonraki mesaja ayırıyorum.
// Lütfen bu dosyanın tam kodunu bir sonraki mesajımdan kopyalayın.
?>