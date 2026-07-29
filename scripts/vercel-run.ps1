param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]] $VercelArgs
)

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$vercelHome = Join-Path $root '.vercel-home'
$dataHome = Join-Path $vercelHome 'data'
$configHome = Join-Path $vercelHome 'config'
$appData = Join-Path $vercelHome 'appdata'
$localAppData = Join-Path $vercelHome 'localappdata'
$globalConfigDir = Join-Path $dataHome 'com.vercel.cli'

New-Item -ItemType Directory -Force -Path $dataHome, $configHome, $appData, $localAppData, $globalConfigDir | Out-Null

$env:XDG_DATA_HOME = $dataHome
$env:XDG_CONFIG_HOME = $configHome
$env:APPDATA = $appData
$env:LOCALAPPDATA = $localAppData

& vercel --global-config $globalConfigDir @VercelArgs
exit $LASTEXITCODE
