$phpDir = "C:\Users\muyideen olawumi\Desktop\php-local"
$iniDst = "$phpDir\php.ini"
$extDir = "$phpDir\ext"

$ini = Get-Content $iniDst -Raw

# Uncomment and set the extension_dir that already has our path in it
$ini = $ini -replace [regex]::Escape(";extension_dir = `"$extDir`""), "extension_dir = `"$extDir`""

# Enable mbstring and openssl (already done but double check)
$ini = $ini -replace ";extension=mbstring", "extension=mbstring"
$ini = $ini -replace ";extension=openssl",  "extension=openssl"

Set-Content $iniDst $ini -Encoding UTF8

Write-Host "Done. Verifying:"
Get-Content $iniDst | Select-String "^extension_dir"
Get-Content $iniDst | Select-String "^extension=mbstring"
