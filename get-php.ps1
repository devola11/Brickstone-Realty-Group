$desktop  = "$env:USERPROFILE\Desktop"
$phpDir   = "$desktop\php-local"
$zipPath  = "$desktop\php-local.zip"
$phpUrl   = "https://windows.php.net/downloads/releases/php-8.0.30-nts-Win32-vs16-x64.zip"
$projDir  = "$desktop\Brickstone Realty Group"

if (!(Test-Path "$phpDir\php.exe")) {
    Write-Host "Downloading PHP 8.0 portable..."
    Invoke-WebRequest -Uri $phpUrl -OutFile $zipPath -UseBasicParsing
    Write-Host "Extracting..."
    Expand-Archive -Path $zipPath -DestinationPath $phpDir -Force
    Remove-Item $zipPath
    Write-Host "PHP extracted to $phpDir"
}

if (Test-Path "$phpDir\php.exe") {
    Write-Host "PHP_READY"
    & "$phpDir\php.exe" --version
} else {
    Write-Host "FAILED"
}
