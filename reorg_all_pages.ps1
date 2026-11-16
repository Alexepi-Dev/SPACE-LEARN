$pages = Get-ChildItem -Path 'd:\\Pro\\SPACE LEARN AFRICA\\src\\pages' -Filter '*Page.tsx' -File
foreach ($file in $pages) {
    $folderName = $file.BaseName -replace 'Page$',''
    $newDir = Join-Path $file.Directory.FullName $folderName
    if (-not (Test-Path $newDir)) { New-Item -ItemType Directory -Path $newDir | Out-Null }
    Move-Item -Path $file.FullName -Destination (Join-Path $newDir $file.Name) -Force
}
# Update imports in App.tsx
$appPath = 'd:\\Pro\\SPACE LEARN AFRICA\\src\\App.tsx'
$appContent = Get-Content $appPath -Raw
$pagesBase = $pages | ForEach-Object { $_.BaseName }
foreach ($base in $pagesBase) {
    $old = "'./pages/$base'"
    $folder = $base -replace 'Page$',''
    $new = "'./pages/$folder/$base'"
    $appContent = $appContent -replace [regex]::Escape($old), $new
    # also double quotes
    $oldDQ = "\"./pages/$base\""
    $newDQ = "\"./pages/$folder/$base\""
    $appContent = $appContent -replace [regex]::Escape($oldDQ), $newDQ
}
# Update lazy import for SolarSystemExplorerPage if present
$appContent = $appContent -replace "import\('\./pages/SolarSystemExplorerPage'\)", "import('\./pages/SolarSystemExplorerPage/SolarSystemExplorerPage')"
Set-Content -Path $appPath -Value $appContent -Encoding UTF8
Write-Host 'Reorganization complete.'
