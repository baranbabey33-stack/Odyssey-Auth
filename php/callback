<?php
require_once '../config.php';

function curl_post($url, $data) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

function curl_get($url, $headers) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

function loginUser($user, $link) {
    $_SESSION['loggedin'] = true;
    $_SESSION['id'] = $user['id'];
    $_SESSION['kullanici_adi'] = $user['kullanici_adi'] ?: $user['email']; // Kullanıcı adı yoksa e-postayı kullan
    header('Location: ' . APP_URL . '/dashboard.php'); // Başarılı giriş sonrası yönlendirilecek sayfa
    exit();
}

if (!isset($_GET['provider']) || !isset($_GET['code'])) {
    die("Hatalı istek.");
}

$provider = $_GET['provider'];
$code = $_GET['code'];
$access_token = null;
$user_info = null;

// Adım 1: Access Token Al
if ($provider == 'google') {
    $token_data = curl_post('https://oauth2.googleapis.com/token', [
        'code' => $code,
        'client_id' => GOOGLE_CLIENT_ID,
        'client_secret' => GOOGLE_CLIENT_SECRET,
        'redirect_uri' => GOOGLE_REDIRECT_URI,
        'grant_type' => 'authorization_code'
    ]);
    if (isset($token_data['access_token'])) {
        $access_token = $token_data['access_token'];
        $user_info = curl_get('https://www.googleapis.com/oauth2/v2/userinfo', ['Authorization: Bearer ' . $access_token]);
        $provider_id = $user_info['id'];
        $email = $user_info['email'];
        $name = $user_info['name'];
    }
} elseif ($provider == 'github') {
    $token_data = curl_post('https://github.com/login/oauth/access_token', [
        'client_id' => GITHUB_CLIENT_ID,
        'client_secret' => GITHUB_CLIENT_SECRET,
        'code' => $code,
        'redirect_uri' => GITHUB_REDIRECT_URI
    ]);
    if (isset($token_data['access_token'])) {
        $access_token = $token_data['access_token'];
        $user_info = curl_get('https://api.github.com/user', ['Authorization: token ' . $access_token, 'User-Agent: ' . 'Awesome-App']);
        
        // GitHub'da public e-posta yoksa, özel e-postaları çek
        if (!$user_info['email']) {
             $emails = curl_get('https://api.github.com/user/emails', ['Authorization: token ' . $access_token, 'User-Agent: ' . 'Awesome-App']);
             foreach ($emails as $em) {
                 if ($em['primary'] && $em['verified']) {
                     $user_info['email'] = $em['email'];
                     break;
                 }
             }
        }
        $provider_id = $user_info['id'];
        $email = $user_info['email'];
        $name = $user_info['login'];
    }
}

if (!$user_info || !$email) {
    die('Kullanıcı bilgileri alınamadı. Lütfen tekrar deneyin.');
}

// Adım 2: Veritabanında kullanıcıyı kontrol et veya oluştur
$sql = "SELECT * FROM kullanicilar WHERE email = ?";
if ($stmt = mysqli_prepare($link, $sql)) {
    mysqli_stmt_bind_param($stmt, "s", $email);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if ($user = mysqli_fetch_assoc($result)) {
        // Kullanıcı var, giriş yaptır
        loginUser($user, $link);
    } else {
        // Kullanıcı yok, oluştur
        $insert_sql = "INSERT INTO kullanicilar (email, kullanici_adi, provider, provider_id) VALUES (?, ?, ?, ?)";
        if ($insert_stmt = mysqli_prepare($link, $insert_sql)) {
            mysqli_stmt_bind_param($insert_stmt, "ssss", $email, $name, $provider, $provider_id);
            if (mysqli_stmt_execute($insert_stmt)) {
                $user_id = mysqli_insert_id($link);
                $new_user = ['id' => $user_id, 'email' => $email, 'kullanici_adi' => $name];
                loginUser($new_user, $link);
            }
        }
    }
    mysqli_stmt_close($stmt);
}
mysqli_close($link);
?>
