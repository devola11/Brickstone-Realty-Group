<?php
declare(strict_types=1);

/* ============================================================
   BRICKSTONE REALTY GROUP — handle-contact.php
   Accepts POST only. Sanitises + validates inputs.
   Sends email via PHP mail(). Returns JSON.
   ============================================================ */

// Always output JSON — set headers before any output
header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store, no-cache, must-revalidate');

// ── 1. Reject non-POST requests (HTTP 405) ──────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
    exit;
}

// ── 2. Honeypot check ───────────────────────────────────────
// Real users never see or fill the hidden 'website' field.
// Bots auto-fill everything they find. Silently pass bots so
// they don't know they were caught and start probing harder.
if (!empty($_POST['website'])) {
    http_response_code(200);
    echo json_encode(['success' => true]);
    exit;
}

// ── 3. Session-based rate limiting ─────────────────────────
// Limits each visitor to 3 successful sends per 10-minute window.
// Uses PHP sessions (stored on server) — no database needed.
session_start();

$now        = time();
$window     = 600; // 10 minutes in seconds
$maxSends   = 3;

if (!isset($_SESSION['contact_sends'])) {
    $_SESSION['contact_sends']        = 0;
    $_SESSION['contact_window_start'] = $now;
}

// Reset window if the 10 minutes have elapsed
if (($now - $_SESSION['contact_window_start']) > $window) {
    $_SESSION['contact_sends']        = 0;
    $_SESSION['contact_window_start'] = $now;
}

if ($_SESSION['contact_sends'] >= $maxSends) {
    http_response_code(429);
    echo json_encode([
        'success' => false,
        'error'   => 'Too many requests. Please wait a few minutes and try again.',
    ]);
    exit;
}

// ── 4. Sanitise inputs ──────────────────────────────────────
// strip_tags removes any HTML/script injection before validation.
$name    = trim(strip_tags($_POST['name']    ?? ''));
$email   = trim(strip_tags($_POST['email']   ?? ''));
$phone   = trim(strip_tags($_POST['phone']   ?? ''));
$borough = trim(strip_tags($_POST['borough'] ?? ''));
$message = trim(strip_tags($_POST['message'] ?? ''));

// ── 5. Server-side validation (mirrors client-side rules) ───
$errors = [];

if (strlen($name) < 2) {
    $errors[] = 'Name must be at least 2 characters.';
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'A valid email address is required.';
}

if (strlen($message) < 10) {
    $errors[] = 'Message must be at least 10 characters.';
}

// Borough strict whitelist — silently null anything unexpected
$validBoroughs = ['', 'manhattan', 'brooklyn', 'queens', 'bronx', 'staten-island'];
if (!in_array($borough, $validBoroughs, true)) {
    $borough = '';
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => implode(' ', $errors)]);
    exit;
}

// ── 6. Build the email ──────────────────────────────────────
$recipientEmail = 'info@brickstonerealty.com';
$fromEmail      = 'no-reply@brickstonerealtygroups.com';
$boroughDisplay = $borough
    ? ucwords(str_replace('-', ' ', $borough))
    : 'No preference';

$subject = 'New Rental Enquiry from ' . $name . ' — Brickstone Realty Group';

$body  = "New rental enquiry received via brickstonerealtygroups.com\n\n";
$body .= "-----------------------------------------------------------\n";
$body .= "CONTACT DETAILS\n";
$body .= "-----------------------------------------------------------\n";
$body .= "Name:              " . $name . "\n";
$body .= "Email:             " . $email . "\n";
$body .= "Phone:             " . ($phone ?: 'Not provided') . "\n";
$body .= "Preferred Borough: " . $boroughDisplay . "\n";
$body .= "-----------------------------------------------------------\n";
$body .= "MESSAGE\n";
$body .= "-----------------------------------------------------------\n";
$body .= $message . "\n\n";
$body .= "-----------------------------------------------------------\n";
$body .= "Sent:   " . date('D, d M Y H:i:s T') . "\n";
$body .= "Source: https://www.brickstonerealtygroups.com/#contact\n";
$body .= "-----------------------------------------------------------\n";
$body .= "Reply-To is set to the enquirer's email address.\n";
$body .= "Just hit Reply in your email client to respond to them.\n";

// Email headers — use \r\n per RFC 2822
// Reply-To is set to the enquirer so you can reply directly to them
$headers  = 'From: Brickstone Realty Website <' . $fromEmail . '>' . "\r\n";
$headers .= 'Reply-To: ' . $name . ' <' . $email . '>' . "\r\n";
$headers .= 'MIME-Version: 1.0' . "\r\n";
$headers .= 'Content-Type: text/plain; charset=UTF-8' . "\r\n";
$headers .= 'Content-Transfer-Encoding: 8bit' . "\r\n";
$headers .= 'X-Mailer: PHP/' . phpversion() . "\r\n";

// ── 7. Send and respond ─────────────────────────────────────
$sent = mail($recipientEmail, $subject, $body, $headers);

if ($sent) {
    // Increment rate-limit counter only on successful send
    $_SESSION['contact_sends']++;

    http_response_code(200);
    echo json_encode(['success' => true]);
} else {
    // mail() returned false — server-side sending failure
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'We could not send your message right now. Please email us directly at info@brickstonerealty.com.',
    ]);
}

exit;
