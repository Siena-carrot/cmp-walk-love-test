param(
  [Parameter(Mandatory=$true)][string]$Password
)
# Compute SHA-256 hex digest of the provided password string (UTF-8)
$bytes = [System.Text.Encoding]::UTF8.GetBytes($Password)
$sha = [System.Security.Cryptography.SHA256]::Create()
$hash = $sha.ComputeHash($bytes)
$hex = ($hash | ForEach-Object { $_.ToString("x2") }) -join ''
Write-Output $hex
