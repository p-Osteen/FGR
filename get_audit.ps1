param([string]$FilePath, [string]$AuditId)
$json = Get-Content $FilePath -Raw | ConvertFrom-Json
$audit = $json.audits.$AuditId
$audit | ConvertTo-Json -Depth 5
