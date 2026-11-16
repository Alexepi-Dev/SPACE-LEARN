$pageFiles = Get-ChildItem -Path 'd:\Pro\SPACE LEARN AFRICA\src\pages' -Recurse -Filter '*Page.tsx' -File
foreach ($file in $pageFiles) {
    $content = Get-Content $file.FullName -Raw
    # Replace imports that go one level up to two levels up
    $updated = $content -replace "'\.\./", "'../../"
    # Also handle double quotes
    $updated = $updated -replace '"\.\./', '"../../'
    Set-Content -Path $file.FullName -Value $updated -Encoding UTF8
    Write-Host "Updated imports in $($file.FullName)"
}
