$commands = @('node', 'pnpm', 'git', 'docker', 'rustc', 'cargo')

foreach ($command in $commands) {
  $resolved = Get-Command $command -ErrorAction SilentlyContinue
  if ($resolved) {
    Write-Output "[ok] $command"
  } else {
    Write-Output "[missing] $command"
  }
}
