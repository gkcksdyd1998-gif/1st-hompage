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

function Save-JsonFile([object]$value, [string]$path) {
  $json = $value | ConvertTo-Json -Depth 6
  $encoding = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText((Resolve-Path -LiteralPath (Split-Path $path -Parent)).Path + [System.IO.Path]::DirectorySeparatorChar + (Split-Path $path -Leaf), $json, $encoding)
}

function Convert-RationalToDouble([byte[]]$bytes, [int]$offset) {
  $numerator = [BitConverter]::ToUInt32($bytes, $offset)
  $denominator = [BitConverter]::ToUInt32($bytes, $offset + 4)

  if ($denominator -eq 0) {
    return 0
  }

  return $numerator / [double]$denominator
}

function Get-ExifText($image, [int]$id) {
  if ($image.PropertyIdList -notcontains $id) {
    return $null
  }

  $bytes = $image.GetPropertyItem($id).Value
  return ([System.Text.Encoding]::ASCII.GetString($bytes)).Trim([char]0).Trim()
}

function Get-GpsCoordinate($image, [int]$coordinateId, [int]$refId) {
  if (($image.PropertyIdList -notcontains $coordinateId) -or ($image.PropertyIdList -notcontains $refId)) {
    return $null
  }

  $coordinateBytes = $image.GetPropertyItem($coordinateId).Value
  $refBytes = $image.GetPropertyItem($refId).Value
  $degrees = Convert-RationalToDouble $coordinateBytes 0
  $minutes = Convert-RationalToDouble $coordinateBytes 8
  $seconds = Convert-RationalToDouble $coordinateBytes 16
  $value = $degrees + ($minutes / 60) + ($seconds / 3600)
  $ref = ([System.Text.Encoding]::ASCII.GetString($refBytes)).Trim([char]0).Trim()

  if ($ref -eq "S" -or $ref -eq "W") {
    $value = -$value
  }

  return [Math]::Round($value, 6)
}

function Get-PhotoInfo($entry) {
  $stream = $entry.Open()
  try {
    $image = [System.Drawing.Image]::FromStream($stream, $false, $false)
    try {
      $latitude = Get-GpsCoordinate $image 2 1
      $longitude = Get-GpsCoordinate $image 4 3
      $takenAt = Get-ExifText $image 0x9003

      if (-not $takenAt) {
        $takenAt = Get-ExifText $image 0x0132
      }

      return [pscustomobject]@{
        Entry = $entry
        HasGps = ($null -ne $latitude -and $null -ne $longitude)
        Latitude = $latitude
        Longitude = $longitude
        TakenAt = $takenAt
      }
    } finally {
      $image.Dispose()
    }
  } catch {
    return [pscustomobject]@{
      Entry = $entry
      HasGps = $false
      Latitude = $null
      Longitude = $null
      TakenAt = $null
    }
  } finally {
    $stream.Dispose()
  }
}

function Save-ResizedJpeg($entry, [string]$destination) {
  $stream = $entry.Open()
  try {
    $source = [System.Drawing.Image]::FromStream($stream)
    try {
      if ($source.PropertyIdList -contains 0x0112) {
        $orientation = [BitConverter]::ToUInt16($source.GetPropertyItem(0x0112).Value, 0)

        switch ($orientation) {
          2 { $source.RotateFlip([System.Drawing.RotateFlipType]::RotateNoneFlipX) }
          3 { $source.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone) }
          4 { $source.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipX) }
          5 { $source.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipX) }
          6 { $source.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
          7 { $source.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipX) }
          8 { $source.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }
        }
      }

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

    $photoInfos = $group.Group | Sort-Object FullName | ForEach-Object { Get-PhotoInfo $_ }
    $gpsPhotoInfos = @($photoInfos | Where-Object { $_.HasGps })
    $entries = if ($gpsPhotoInfos.Count -ge $PhotosPerTrip) { $gpsPhotoInfos } else { $photoInfos }
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
        $info = $entries[$index]
        if (-not $selected.Contains($info)) {
          $selected.Add($info)
        }
      }
    }

    $photos = @()
    for ($i = 0; $i -lt $selected.Count; $i++) {
      $fileName = "{0:D2}.jpg" -f ($i + 1)
      $destination = Join-Path $tripDir $fileName
      $info = $selected[$i]
      Save-ResizedJpeg $info.Entry $destination

      $photo = [ordered]@{
        src = "/photos/$slug/$fileName"
        alt = "$tripName photo $($i + 1)"
        caption = "$tripName #$($i + 1)"
        originalName = $info.Entry.Name
        takenAt = $info.TakenAt
      }

      if ($info.HasGps) {
        $photo.latitude = $info.Latitude
        $photo.longitude = $info.Longitude
        $photo.mapUrl = "https://www.google.com/maps?q=$($info.Latitude),$($info.Longitude)"
      }

      $photos += $photo
    }

    Copy-Item -LiteralPath (Join-Path $tripDir "01.jpg") -Destination (Join-Path $tripDir "cover.jpg") -Force

    $manifest += [ordered]@{
      slug = $slug
      name = $tripName
      originalImageCount = $photoInfos.Count
      gpsImageCount = $gpsPhotoInfos.Count
      importedImageCount = $selected.Count
      cover = "/photos/$slug/cover.jpg"
      photos = $photos
    }
  }

  $manifestPath = Join-Path $OutputRoot "manifest.json"
  Save-JsonFile $manifest $manifestPath
  $dataManifestPath = Join-Path "src/data" "photo-manifest.json"
  Save-JsonFile $manifest $dataManifestPath
  $manifest | Select-Object slug, name, originalImageCount, gpsImageCount, importedImageCount
} finally {
  $archive.Dispose()
}
