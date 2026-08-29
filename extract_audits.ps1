param([string]$FilePath)
$json = Get-Content $FilePath -Raw | ConvertFrom-Json
$audits = $json.audits
$failed = @()
foreach ($key in $audits.PSObject.Properties.Name) {
    $a = $audits.$key
    if ($null -ne $a.score -and $a.score -lt 1 -and $a.scoreDisplayMode -ne 'informative' -and $a.scoreDisplayMode -ne 'notApplicable') {
        $failed += [PSCustomObject]@{
            id = $a.id
            title = $a.title
            score = $a.score
            displayValue = $a.displayValue
        }
    }
}
$failed | Format-Table -AutoSize -Wrap
