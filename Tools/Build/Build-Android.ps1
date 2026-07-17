param(
    [Parameter(Mandatory = $true)]
    [string]$UnityPath,
    [string]$Version = "0.1.0",
    [string]$ProjectPath = ""
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($ProjectPath)) {
    $ProjectPath = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
}

$OutDir = Join-Path $ProjectPath "Builds\Android"
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$LogFile = Join-Path $OutDir "build_$Version.log"

if (-not (Test-Path $UnityPath)) {
    Write-Error "Unity not found at: $UnityPath"
}

Write-Host "Building Cruza RD $Version → $OutDir"

& $UnityPath `
    -batchmode `
    -nographics `
    -quit `
    -projectPath $ProjectPath `
    -executeMethod CruzaRD.EditorTools.CruzaRDBuildPipeline.BuildAndroidAab `
    -logFile $LogFile `
    -buildVersion $Version

if ($LASTEXITCODE -ne 0) {
    Write-Error "Unity build failed. See $LogFile"
}

Write-Host "Done. Check $OutDir and $LogFile"
