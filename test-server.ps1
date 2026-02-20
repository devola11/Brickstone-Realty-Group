Start-Sleep -Seconds 2
try {
    $r = Invoke-WebRequest -Uri "http://localhost:8080/csrf-token.php" -UseBasicParsing
    Write-Host "STATUS: $($r.StatusCode)"
    Write-Host "BODY: $($r.Content)"
} catch {
    $err = $_.Exception.Message
    Write-Host "ERROR: $err"
    # Try to get response body even on error
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host "RESPONSE_BODY: $($reader.ReadToEnd())"
    } catch {}
}
