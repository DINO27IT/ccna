# CCNA 2 v7 Local Web Server
param(
    [int]$Port = 8080
)

$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.InterfaceAlias -notmatch 'Loopback|vEthernet|WSL|Virtual' -and $_.IPAddress -notmatch '^169\.254\.' 
} | Select-Object -First 1).IPAddress

if (-not $localIP) { $localIP = "127.0.0.1" }

$baseFolder = $PSScriptRoot
if (-not $baseFolder) { $baseFolder = (Get-Location).Path }

function Get-MimeType([string]$extension) {
    switch ($extension.ToLower()) {
        ".html" { return "text/html; charset=utf-8" }
        ".css"  { return "text/css; charset=utf-8" }
        ".js"   { return "application/javascript; charset=utf-8" }
        ".json" { return "application/json; charset=utf-8" }
        ".svg"  { return "image/svg+xml" }
        ".png"  { return "image/png" }
        ".jpg"  { return "image/jpeg" }
        ".jpeg" { return "image/jpeg" }
        ".webp" { return "image/webp" }
        ".ico"  { return "image/x-icon" }
        default { return "application/octet-stream" }
    }
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
try {
    $listener.Start()
} catch {
    Write-Host "Port $Port je obsazen, zkousim 8081..." -ForegroundColor Yellow
    $Port = 8081
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
    $listener.Start()
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       CCNA 2 v7 Test Server spuštěn!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Počítač (prohlížeč):" -ForegroundColor Yellow
Write-Host "    http://localhost:$Port" -ForegroundColor White
Write-Host ""
Write-Host "  iPhone (Safari ve stejné Wi-Fi síti):" -ForegroundColor Yellow
Write-Host "    http://${localIP}:$Port" -ForegroundColor Green
Write-Host "    (Zadejte tuto adresu do Safari na svém iPhone)" -ForegroundColor Gray
Write-Host ""
Write-Host "  Tip pro iPhone: V Safari klepněte na Sdílet -> 'Přidat na plochu'" -ForegroundColor Magenta
Write-Host "  Stiskněte Ctrl+C pro ukončení." -ForegroundColor DarkGray
Write-Host "==========================================================" -ForegroundColor Cyan

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        
        # Read header
        $buffer = New-Object byte[] 4096
        $bytesRead = $stream.Read($buffer, 0, $buffer.Length)
        if ($bytesRead -le 0) {
            $client.Close()
            continue
        }
        
        $reqText = [System.Text.Encoding]::ASCII.GetString($buffer, 0, $bytesRead)
        $firstLine = $reqText.Split([char]10)[0].Trim()
        $parts = $firstLine.Split(' ')
        if ($parts.Length -lt 2) {
            $client.Close()
            continue
        }
        
        $reqPath = $parts[1]
        $qIdx = $reqPath.IndexOf('?')
        if ($qIdx -ge 0) { $reqPath = $reqPath.Substring(0, $qIdx) }
        
        if ($reqPath -eq "/" -or $reqPath -eq "") {
            $reqPath = "/index.html"
        }
        
        $relPath = [System.Uri]::UnescapeDataString($reqPath.TrimStart('/'))
        $fullPath = Join-Path $baseFolder ($relPath.Replace('/', [System.IO.Path]::DirectorySeparatorChar))
        
        if (Test-Path $fullPath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($fullPath)
            $mime = Get-MimeType $ext
            $content = [System.IO.File]::ReadAllBytes($fullPath)
            
            $header = "HTTP/1.1 200 OK`r`n" +
                      "Content-Type: $mime`r`n" +
                      "Content-Length: $($content.Length)`r`n" +
                      "Connection: close`r`n" +
                      "Access-Control-Allow-Origin: *`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
            
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($content, 0, $content.Length)
            $stream.Flush()
        } else {
            $body = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($body, 0, $body.Length)
            $stream.Flush()
        }
        $client.Close()
    }
} finally {
    $listener.Stop()
}
