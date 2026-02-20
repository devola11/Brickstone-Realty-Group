<?php
declare(strict_types=1);

/* ============================================================
   BRICKSTONE REALTY GROUP — handle-contact.php
   POST only · JSON responses · PHP mail()

   Security layers (in order):
     1  PHP hardening             (display_errors off, UTF-8)
     2  Method guard              (405)
     3  Origin / Referer check    (403)
     4  Honeypot                  (silent 200)
     5  Session start + hardened cookie
     6  CSRF token validation     (403) + rotate
     7  Rate limiting             (429) — all attempts counted
     8  Input sanitise + length caps
     9  Field validation          (422)
    10  Email header injection guard
    11  Build + send email        (500 on failure)
   ============================================================ */

/* ── 1. PHP HARDENING ───────────────────────────────────────
   Disable error output so PHP warnings never contaminate the
   JSON response body. Log errors silently server-side instead.   */
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');
error_reporting(E_ALL);                // log everything, show nothing
ini_set('log_errors', '1');
mb_internal_encoding('UTF-8');        // safe mb_* defaults throughout

/* ── Output buffer — stops whitespace reaching headers ─────── */
ob_start();

/* ── Always return JSON ─────────────────────────────────────── */
header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

/* ── Helper: flush buffer, set status, echo JSON, exit ──────── */
function send_response(int $code, bool $success, string $error = ''): never {
    ob_end_clean();
    http_response_code($code);
    $payload = ['success' => $success];
    if ($error !== '') {
        $payload['error'] = $error;
    }
    echo json_encode($payload, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    exit;
}

/* Both www and non-www are valid — .htaccess redirects non-www to www,
   but the browser fetch() Origin header reflects the page the user is on
   at the moment of submission, which may still be non-www mid-redirect. */
define('CONTACT_ALLOWED_ORIGIN',     'https://www.brickstonerealtygroups.com');
define('CONTACT_ALLOWED_ORIGIN_ALT', 'https://brickstonerealtygroups.com');
define('CONTACT_ALLOWED_ORIGIN_DEV', 'http://localhost');  // local XAMPP testing only

/* ════════════════════════════════════════════════════════════════
   2. METHOD GUARD
   ════════════════════════════════════════════════════════════════ */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    send_response(405, false, 'Method not allowed.');
}

/* ════════════════════════════════════════════════════════════════
   3. ORIGIN / REFERER — block cross-origin POSTs
      fetch() from same page always sends Origin on modern browsers.
      Referer is the fallback for older browsers / privacy modes.
   ════════════════════════════════════════════════════════════════ */
$origin  = rtrim((string) ($_SERVER['HTTP_ORIGIN']  ?? ''), '/');
$referer = (string) ($_SERVER['HTTP_REFERER'] ?? '');

$allowedOrigins = [CONTACT_ALLOWED_ORIGIN, CONTACT_ALLOWED_ORIGIN_ALT, CONTACT_ALLOWED_ORIGIN_DEV];

$originOk  = in_array($origin, $allowedOrigins, true);
$refererOk = (
    strncmp($referer, CONTACT_ALLOWED_ORIGIN,     strlen(CONTACT_ALLOWED_ORIGIN))     === 0 ||
    strncmp($referer, CONTACT_ALLOWED_ORIGIN_ALT, strlen(CONTACT_ALLOWED_ORIGIN_ALT)) === 0 ||
    strncmp($referer, CONTACT_ALLOWED_ORIGIN_DEV, strlen(CONTACT_ALLOWED_ORIGIN_DEV)) === 0
);

if (!$originOk && !$refererOk) {
    send_response(403, false, 'Forbidden.');
}

/* ════════════════════════════════════════════════════════════════
   4. HONEYPOT — real users never see or fill this field
      Bots auto-fill everything; silently pass them so they don't
      know they were detected and start probing differently.
   ════════════════════════════════════════════════════════════════ */
if (!empty($_POST['website'])) {
    send_response(200, true);
}

/* ════════════════════════════════════════════════════════════════
   5. SESSION — start with hardened cookie flags
   ════════════════════════════════════════════════════════════════ */
$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (int) ($_SERVER['SERVER_PORT'] ?? 80) === 443;
session_set_cookie_params([
    'lifetime' => 0,          // expires when browser closes
    'path'     => '/',
    'domain'   => '',         // current domain only
    'secure'   => $isHttps,   // HTTPS only on live; allows HTTP on localhost
    'httponly' => true,       // inaccessible to JS
    'samesite' => 'Strict',   // never sent cross-site
]);
session_start();

/* ════════════════════════════════════════════════════════════════
   6. CSRF — constant-time comparison; single-use token rotation
   ════════════════════════════════════════════════════════════════ */
$submittedToken = (string) ($_POST['csrf_token'] ?? '');
$sessionToken   = (string) ($_SESSION['csrf_token'] ?? '');

if (
    $submittedToken === '' ||
    $sessionToken   === '' ||
    !hash_equals($sessionToken, $submittedToken)
) {
    send_response(403, false, 'Invalid request. Please reload the page and try again.');
}

/* Rotate immediately — one token per submission */
$_SESSION['csrf_token'] = bin2hex(random_bytes(32));

/* ════════════════════════════════════════════════════════════════
   7. RATE LIMITING — 3 attempts per 10-minute window
      Incremented BEFORE validation so bots can't cycle bad
      payloads without burning their quota.
   ════════════════════════════════════════════════════════════════ */
$now      = time();
$window   = 600; // 10 minutes in seconds
$maxSends = 3;

if (!isset($_SESSION['contact_sends'], $_SESSION['contact_window_start'])) {
    $_SESSION['contact_sends']        = 0;
    $_SESSION['contact_window_start'] = $now;
}

if (($now - (int) $_SESSION['contact_window_start']) >= $window) {
    $_SESSION['contact_sends']        = 0;
    $_SESSION['contact_window_start'] = $now;
}

if ((int) $_SESSION['contact_sends'] >= $maxSends) {
    $retryAfter = $window - ($now - (int) $_SESSION['contact_window_start']);
    header('Retry-After: ' . max(0, $retryAfter));
    send_response(429, false, 'Too many requests. Please wait a few minutes and try again.');
}

$_SESSION['contact_sends'] = (int) $_SESSION['contact_sends'] + 1;

/* ════════════════════════════════════════════════════════════════
   8. SANITISE — strip_tags + trim + hard length caps
      Caps applied before validation to prevent oversized-body attacks.
   ════════════════════════════════════════════════════════════════ */
$name    = mb_substr(trim(strip_tags((string) ($_POST['name']    ?? ''))),    0, 100, 'UTF-8');
$email   = mb_substr(trim(strip_tags((string) ($_POST['email']   ?? ''))),    0, 254, 'UTF-8');
$phone   = mb_substr(trim(strip_tags((string) ($_POST['phone']   ?? ''))),    0,  30, 'UTF-8');
$borough = mb_substr(trim(strip_tags((string) ($_POST['borough'] ?? ''))),    0,  30, 'UTF-8');
$message = mb_substr(trim(strip_tags((string) ($_POST['message'] ?? ''))),    0, 5000, 'UTF-8');

/* ════════════════════════════════════════════════════════════════
   9. VALIDATE
   ════════════════════════════════════════════════════════════════ */
$errors = [];

if (mb_strlen($name, 'UTF-8') < 2) {
    $errors[] = 'Name must be at least 2 characters.';
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'A valid email address is required.';
}

if (mb_strlen($message, 'UTF-8') < 10) {
    $errors[] = 'Message must be at least 10 characters.';
}

// Phone: digits, spaces, +, -, (, ), . only — optional field
if ($phone !== '' && !preg_match('/^[0-9\s+\-().]{7,20}$/', $phone)) {
    $errors[] = 'Phone number contains invalid characters.';
}

// Borough strict whitelist — silently normalise unexpected values
$validBoroughs = ['', 'manhattan', 'brooklyn', 'queens', 'bronx', 'staten-island'];
if (!in_array($borough, $validBoroughs, true)) {
    $borough = '';
}

if (!empty($errors)) {
    send_response(422, false, implode(' ', $errors));
}

/* ════════════════════════════════════════════════════════════════
   10. EMAIL HEADER INJECTION GUARD
       CR, LF, or NUL in name/email would let an attacker inject
       arbitrary mail headers (Bcc:, To:, etc.).
   ════════════════════════════════════════════════════════════════ */
if (preg_match('/[\r\n\0]/', $name . $email)) {
    send_response(400, false, 'Invalid characters in submission.');
}

/* ════════════════════════════════════════════════════════════════
   11. BUILD + SEND EMAIL
   ════════════════════════════════════════════════════════════════ */
$recipientEmail = 'info@brickstonerealtygroups.com';
$fromEmail      = 'no-reply@brickstonerealtygroups.com';
$boroughDisplay = $borough !== ''
    ? ucwords(str_replace('-', ' ', $borough))
    : 'No preference';

// Subject — use UTF-8 encoded em dash (no escaped hex in double quotes)
$subject = 'New Rental Enquiry from ' . $name . ' \xe2\x80\x94 Brickstone Realty Group';

$sep  = str_repeat('-', 59);
$body = implode("\n", [
    'New rental enquiry received via brickstonerealtygroups.com',
    '',
    $sep,
    'CONTACT DETAILS',
    $sep,
    sprintf('%-18s %s', 'Name:',              $name),
    sprintf('%-18s %s', 'Email:',             $email),
    sprintf('%-18s %s', 'Phone:',             ($phone !== '' ? $phone : 'Not provided')),
    sprintf('%-18s %s', 'Preferred Borough:', $boroughDisplay),
    $sep,
    'MESSAGE',
    $sep,
    $message,
    '',
    $sep,
    sprintf('%-18s %s', 'Sent:',   date('D, d M Y H:i:s T')),
    sprintf('%-18s %s', 'Source:', 'https://www.brickstonerealtygroups.com/#contact'),
    $sep,
    'Reply-To is set to the enquirer. Hit Reply in your email client to respond.',
    '',
]);

// RFC 2822 headers — \r\n only, no X-Mailer (prevents PHP version fingerprinting)
$headers = implode("\r\n", [
    'From: Brickstone Realty Website <' . $fromEmail . '>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Priority: 3',
    '', // trailing \r\n required by RFC
]);

$sent = mail($recipientEmail, $subject, $body, $headers);

if ($sent) {
    send_response(200, true);
} else {
    send_response(500, false, 'We could not send your message right now. Please email us directly at info@brickstonerealtygroups.com.');
}
