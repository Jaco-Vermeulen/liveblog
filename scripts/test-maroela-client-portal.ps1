# Verifies compiled client CSS includes maroela portal UX tokens
$ErrorActionPreference = "Stop"
$distDir = Join-Path $PSScriptRoot "..\client\dist"
if (-not (Test-Path $distDir)) {
    Write-Warning "client/dist not found — run client build first (docker compose up client)"
    exit 0
}
$cssFiles = Get-ChildItem $distDir -Filter "*.css" -Recurse | Select-Object -First 5
if (-not $cssFiles) {
    Write-Warning "No CSS in client/dist"
    exit 0
}
$css = ($cssFiles | ForEach-Object { Get-Content $_.FullName -Raw }) -join "`n"
$required = @("#f5efe7", "#c45712", "#157578", "Lato", ".blogedit", ".bloglist", "--mar-page", "1.0625rem", 'a[href="#/workspace"]', 'a[href="#/publish_queue"]')
$forbidden = @("data-color-scheme", ".mm-dark-toggle")
$failed = @()
foreach ($token in $required) {
    if ($css -notmatch [regex]::Escape($token)) {
        $failed += $token
    }
}
$warn = @()
foreach ($token in $forbidden) {
    if ($css -match [regex]::Escape($token)) {
        $warn += $token
    }
}
if ($failed.Count -gt 0) {
    Write-Error "Missing in compiled client CSS: $($failed -join ', ')"
}
if ($warn.Count -gt 0) {
    Write-Warning "Unexpected dark-mode artifacts in CSS: $($warn -join ', ')"
}
Write-Host ("PASS: maroela portal CSS verified — {0} required tokens present" -f $required.Count)
exit 0
