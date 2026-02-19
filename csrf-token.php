<?php
declare(strict_types=1);

/* ============================================================
   BRICKSTONE REALTY GROUP — csrf-token.php
   Issues a per-session CSRF token for the contact form.
   Called once by JS on page load; value injected into
   a hidden <input> that handle-contact.php verifies.
   ============================================================ */

ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');
error_reporting(E_ALL);
ini_set('log_errors', '1');
mb_internal_encoding('UTF-8');

ob_start();

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('X-Content-Type-Options: nosniff');

/* ── Helper ──────────────────────────────────────────────── */
function send_token_response(int $code, array $payload): never {
    ob_end_clean();
    http_response_code($code);
    echo json_encode($payload, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    exit;
}

define('TOKEN_ALLOWED_ORIGIN', 'https://www.brickstonerealtygroups.com');

/* ── 1. Method guard ─────────────────────────────────────── */
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Allow: GET');
    send_token_response(405, ['success' => false, 'error' => 'Method not allowed.']);
}

/* ── 2. Origin check — reject explicitly foreign origins ─── */
$origin = rtrim((string) ($_SERVER['HTTP_ORIGIN'] ?? ''), '/');

if ($origin !== '' && $origin !== TOKEN_ALLOWED_ORIGIN) {
    send_token_response(403, ['success' => false, 'error' => 'Forbidden.']);
}

/* ── 3. Session with hardened cookie flags ───────────────── */
session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'domain'   => '',
    'secure'   => true,
    'httponly' => true,
    'samesite' => 'Strict',
]);
session_start();

/* ── 4. Issue token (generate once per session) ──────────── */
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

send_token_response(200, ['token' => $_SESSION['csrf_token']]);
