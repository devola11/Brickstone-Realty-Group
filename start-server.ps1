$phpExe  = "$env:USERPROFILE\Desktop\php-local\php.exe"
$projDir = "$env:USERPROFILE\OneDrive\Desktop\Brickstone Realty Group"
$port    = 8080

Write-Host "Starting PHP server at http://localhost:$port ..."
Write-Host "Project folder: $projDir"
Write-Host "Press Ctrl+C to stop the server."
Write-Host ""

& $phpExe -S "localhost:$port" -t $projDir
