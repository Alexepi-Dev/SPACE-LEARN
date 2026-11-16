$pages = Get-ChildItem -Path 'd:\Pro\SPACE LEARN AFRICA\src\pages' -Filter '*Page.tsx'
foreach ($file in $pages) {
    $folderName = $file.BaseName -replace 'Page$',''
    $newDir = Join-Path $file.Directory.FullName $folderName
    if (-not (Test-Path $newDir)) {
        New-Item -ItemType Directory -Path $newDir | Out-Null
    }
    Move-Item -Path $file.FullName -Destination (Join-Path $newDir $file.Name) -Force
}
