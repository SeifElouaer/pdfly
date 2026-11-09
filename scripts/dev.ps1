# Launch frontend and backend concurrently
Write-Host "Starting iLovePDF Clone Development Environment..." -ForegroundColor Cyan

# Check Python and Node
$nodeVersion = node --version
$pythonVersion = python --version
Write-Host "Node: $nodeVersion | Python: $pythonVersion" -ForegroundColor Green

# Start Backend in a background process or new window if desired, or run concurrently
npm run dev
