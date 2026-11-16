$pages = Get-ChildItem -Path 'd:\\Pro\\SPACE LEARN AFRICA\\src\\pages' -Filter '*Page.tsx' -File
$map = @{}
foreach ($p in $pages) {
    $base = $p.BaseName
    $folder = $base -replace 'Page$',''
    $map[$base] = $folder
}

# Process all .tsx files in src (excluding node_modules)
$tsxFiles = Get-ChildItem -Path 'd:\\Pro\\SPACE LEARN AFRICA\\src' -Recurse -Include *.tsx -File | Where-Object { $_.FullName -notmatch 'node_modules' }
foreach ($file in $tsxFiles) {
    $content = Get-Content $file.FullName -Raw
    foreach ($kvp in $map.GetEnumerator()) {
        $base = [regex]::Escape($kvp.Key)
        $folder = $kvp.Value
        # Replace single-quoted imports
        $patternSq = "(['\"])\.\/pages\/$base(['\"])"
        $replacementSq = "`$1./pages/$folder/$base`$2"
        $content = [regex]::Replace($content, $patternSq, $replacementSq)
        # Replace double-quoted imports (same pattern works)
        $content = [regex]::Replace($content, $patternSq, $replacementSq)
    }
    # Update lazy import for SolarSystemExplorerPage if present
    $content = $content -replace "import\(['\"]\.\/pages\/SolarSystemExplorerPage['\"]\)", "import('./pages/SolarSystemExplorerPage/SolarSystemExplorerPage')"
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
    Write-Host "Updated imports in $($file.FullName)"
}
Write-Host 'All imports updated.'
