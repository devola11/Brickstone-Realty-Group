# Step 1 — Get CSRF token (uses a session cookie)
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

$tokenResp = Invoke-WebRequest -Uri "http://localhost:8080/csrf-token.php" `
    -UseBasicParsing -WebSession $session
$token = ($tokenResp.Content | ConvertFrom-Json).token
Write-Host "CSRF Token: $token"

# Step 2 — POST form with that token + same session cookie
$body = @{
    csrf_token = $token
    name       = "Test User"
    email      = "test@example.com"
    phone      = "212-555-0100"
    borough    = "brooklyn"
    message    = "This is a local test submission from the dev server."
    website    = ""   # honeypot must be empty
}

try {
    $resp = Invoke-WebRequest -Uri "http://localhost:8080/handle-contact.php" `
        -Method POST -Body $body -UseBasicParsing -WebSession $session `
        -Headers @{ Referer = "http://localhost:8080/" }
    Write-Host "STATUS: $($resp.StatusCode)"
    Write-Host "BODY:   $($resp.Content)"
} catch {
    $err = $_.Exception.Response
    if ($err) {
        $stream = $err.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host "ERROR STATUS: $($err.StatusCode.value__)"
        Write-Host "ERROR BODY:   $($reader.ReadToEnd())"
    } else {
        Write-Host "ERROR: $($_.Exception.Message)"
    }
}
