param([int]$Port = 3027)
$ErrorActionPreference = 'Stop'
$projectDirectory = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$apiDirectory = Join-Path $projectDirectory 'api'
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Install Node.js 20 or later first.' }
if (-not (Test-Path -LiteralPath (Join-Path $apiDirectory '.env') -PathType Leaf)) {
    throw 'Copy api/.env.example to api/.env and configure a running MySQL database first. See README.md.'
}
$previousPort = $env:PORT
Push-Location -LiteralPath $apiDirectory
try {
    if (-not (Test-Path -LiteralPath 'node_modules/mysql2/package.json' -PathType Leaf)) {
        & npm.cmd ci
        if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed.' }
    }
    $env:PORT = [string]$Port
    Write-Host "Public website: http://localhost:$Port/"
    Write-Host "Staff website:  http://localhost:$Port/admin/"
    Write-Host 'Keep this terminal open. Press Ctrl+C to stop the preview.'
    & node server.js
    if ($LASTEXITCODE -ne 0) { throw 'Preview failed. Check MySQL and api/.env.' }
} finally {
    if ($null -eq $previousPort) { Remove-Item Env:\PORT -ErrorAction SilentlyContinue }
    else { $env:PORT = $previousPort }
    Pop-Location
}
