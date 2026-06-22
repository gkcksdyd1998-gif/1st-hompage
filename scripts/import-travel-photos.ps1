param(
  [Parameter(Mandatory = $true)]
  [string]$ZipPath,

  [string]$OutputRoot = "public/photos",

  [int]$PhotosPerTrip = 12,

  [int]$MaxWidth = 1600
)

Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.Drawing

$imageExtensions = @(".jpg", ".jpeg", ".png")
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq "image/jpeg" }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
  [System.Drawing.Imaging.Encoder]::Quality,
  [int64]82
)

function Convert-ToSlug([string]$name) {
  if ($name -match "26\.05\.15") { return "kagoshima-2026-05" }
  if ($name -match "26\.03\.14") { return "kitakyushu-2026-03" }
  if ($name -match "25\.12\.13") { return "hiroshima-2025-12" }
  if ($name -match "25\.10\.18") { return "hakodate-2025-10" }
  if ($name -match "25\.08\.25") { return "sapporo-2025-08" }
  if ($name -match "25\.04\.12") { return "nagoya-shizuoka-2025-04" }
  if ($name -match "25\.02\.08") { return "kyoto-nara-2025-02" }

  $slug = $name.ToLowerInvariant()
  $slug = $slug -replace "[^a-z0-9]+", "-"
  $slug = $slug.Trim("-")
  return $slug
}

function Save-ResizedJpeg($entry, [string]$destination) {
  $stream = $entry.Open()
  try {
    $source = [System.Drawing.Image]::FromStream($stream)
    try {
      $ratio = [Math]::Min(1.0, $MaxWidth / [double]$source.Width)
      $width = [Math]::Max(1, [int][Math]::Round($source.Width * $ratio))
      $height = [Math]::Max(1, [int][Math]::Round($source.Height * $ratio))

      $bitmap = New-Object System.Drawing.Bitmap($width, $height)
      try {
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        try {
          $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
          $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
          $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
          $graphics.DrawImage($source, 0, 0, $width, $height)
        } finally {
          $graphics.Dispose()
        }

        $bitmap.Save($destination, $jpegCodec, $encoderParams)
      } finally {
        $bitmap.Dispose()
      }
    } finally {
      $source.Dispose()
    }
  } finally {
    $stream.Dispose()
  }
}

$archive = [System.IO.Compression.ZipFile]::OpenRead($ZipPath)
try {
  $groups = $archive.Entries |
    Where-Object {
      -not [string]::IsNullOrWhiteSpace($_.Name) -and
      $imageExtensions -contains ([System.IO.Path]::GetExtension($_.Name).ToLowerInvariant()) -and
      $_.Length -gt 50000 -and
      $_.FullName -notmatch "/Screenshot_"
    } |
    Group-Object { ($_.FullName -split "/")[0] } |
    Sort-Object Name

  $manifest = @()

  foreach ($group in $groups) {
    $tripName = $group.Name
    $slug = Convert-ToSlug $tripName
    $tripDir = Join-Path $OutputRoot $slug
    New-Item -ItemType Directory -Force $tripDir | Out-Null

    Get-ChildItem $tripDir -Filter "*.jpg" -ErrorAction SilentlyContinue |
      Remove-Item -Force

    $entries = $group.Group | Sort-Object FullName
    if ($entries.Count -eq 0) {
      continue
    }

    $selected = New-Object System.Collections.Generic.List[object]
    if ($entries.Count -le $PhotosPerTrip) {
      foreach ($entry in $entries) {
        $selected.Add($entry)
      }
    } else {
      for ($i = 0; $i -lt $PhotosPerTrip; $i++) {
        $index = [int][Math]::Round($i * (($entries.Count - 1) / [double]($PhotosPerTrip - 1)))
        $entry = $entries[$index]
        if (-not $selected.Contains($entry)) {
          $selected.Add($entry)
        }
      }
    }

    $photos = @()
    for ($i = 0; $i -lt $selected.Count; $i++) {
      $fileName = "{0:D2}.jpg" -f ($i + 1)
      $destination = Join-Path $tripDir $fileName
      Save-ResizedJpeg $selected[$i] $destination

      $photos += [ordered]@{
        src = "/photos/$slug/$fileName"
        alt = "$tripName photo $($i + 1)"
        caption = "$tripName #$($i + 1)"
      }
    }

    Copy-Item -LiteralPath (Join-Path $tripDir "01.jpg") -Destination (Join-Path $tripDir "cover.jpg") -Force

    $manifest += [ordered]@{
      slug = $slug
      name = $tripName
      originalImageCount = $entries.Count
      importedImageCount = $selected.Count
      cover = "/photos/$slug/cover.jpg"
      photos = $photos
    }
  }

  $manifestPath = Join-Path $OutputRoot "manifest.json"
  $manifest | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $manifestPath -Encoding UTF8
  $manifest | Select-Object slug, name, originalImageCount, importedImageCount
} finally {
  $archive.Dispose()
}
