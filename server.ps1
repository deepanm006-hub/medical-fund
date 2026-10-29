# MedicalFund Local Static Web Server
$port = 8000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
} catch {
    Write-Host "Port $port is in use, trying 8080..." -ForegroundColor Yellow
    $port = 8080
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$port/")
    $listener.Start()
}

Write-Host "==================================================" -ForegroundColor Green
Write-Host "  MedicalFund Local Server Running!" -ForegroundColor Cyan
Write-Host "  URL: http://localhost:$port/" -ForegroundColor Yellow
Write-Host "  Press Ctrl + C in this terminal to stop server." -ForegroundColor Gray
Write-Host "==================================================" -ForegroundColor Green

# Open browser
Start-Process "http://localhost:$port/"

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.LocalPath.TrimStart('/').Replace('/', '\')
        if ([string]::IsNullOrEmpty($urlPath)) {
            $urlPath = "index.html"
        }

        $filePath = Join-Path $PSScriptRoot $urlPath

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $response.ContentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")
            
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.StatusCode = 200
            Write-Host " [200] $($request.HttpMethod) /$urlPath" -ForegroundColor Green
        } else {
            $response.StatusCode = 404
            $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            Write-Host " [404] $($request.HttpMethod) /$urlPath" -ForegroundColor Red
        }

        $response.OutputStream.Close()
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
