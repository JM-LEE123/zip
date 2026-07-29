param()

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$vercelHome = Join-Path $root '.vercel-home'
$dataHome = Join-Path $vercelHome 'data'
$configHome = Join-Path $vercelHome 'config'
$appData = Join-Path $vercelHome 'appdata'
$localAppData = Join-Path $vercelHome 'localappdata'

New-Item -ItemType Directory -Force -Path $dataHome, $configHome, $appData, $localAppData | Out-Null

$env:XDG_DATA_HOME = $dataHome
$env:XDG_CONFIG_HOME = $configHome
$env:APPDATA = $appData
$env:LOCALAPPDATA = $localAppData

Write-Host "Vercel CLI environment set for this PowerShell session."
Write-Host "XDG_DATA_HOME=$dataHome"
Write-Host "XDG_CONFIG_HOME=$configHome"
Write-Host "APPDATA=$appData"
Write-Host "LOCALAPPDATA=$localAppData"
