# Validates nuwe-maroela theme CSS matches maroela_web2 design tokens
$ErrorActionPreference = "Stop"
$cssPath = Join-Path $PSScriptRoot "..\server\liveblog\themes\themes_assets\nuwe-maroela\dist\nuwe-maroela.css"
$css = Get-Content $cssPath -Raw
$required = @(
    "#c45712",
    "#157578",
    "#f5efe7",
    "Lato",
    "maroela-heading-cinema",
    ".lb-timeline .header-bar",
    "--maroela-page-bg-light"
)
$failed = @()
foreach ($token in $required) {
    if ($css -notmatch [regex]::Escape($token)) {
        $failed += $token
    }
}
if ($failed.Count -gt 0) {
    Write-Error "Missing tokens in nuwe-maroela.css: $($failed -join ', ')"
}
Write-Host "PASS: nuwe-maroela theme CSS contains all web2 design tokens ($($required.Count) checks)"
exit 0
