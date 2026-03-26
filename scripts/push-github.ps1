# Executar no PowerShell (clique direito → Executar com PowerShell), na pasta do projeto:
#   cd "c:\Users\55479\Desktop\landing page e-transporte.pro"
#   .\scripts\push-github.ps1
#
# 1) Abre o login GitHub no browser — use a conta goulartfelipe618-beep (não felipegoulart06-lab).
# 2) Configura o Git para usar as credenciais do `gh`.
# 3) Faz git push.

$ErrorActionPreference = "Stop"
# scripts/push-github.ps1 -> raiz do repo = pasta acima de scripts
$Root = Split-Path -Parent $PSScriptRoot

# Garantir gh no PATH (instalador winget)
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Host "Instale o GitHub CLI: winget install GitHub.cli" -ForegroundColor Red
  exit 1
}

Write-Host "`n=== GitHub: login (use a conta goulartfelipe618-beep) ===`n" -ForegroundColor Cyan
gh auth login --hostname github.com --git-protocol https --web

Write-Host "`n=== A ligar o Git ao GitHub CLI ===`n" -ForegroundColor Cyan
gh auth setup-git

Set-Location $Root
Write-Host "`n=== git push ===`n" -ForegroundColor Cyan
git push -u origin main
git push -u e-transporte main

Write-Host "`n=== Deploy GitHub Pages (sem Actions) ===`n" -ForegroundColor Cyan
# Publica dist/ na branch gh-pages do repo E-TRANSPORTE.PRO
& "$Root\\scripts\\deploy-gh-pages.ps1" -RemoteName "e-transporte" -BranchName "gh-pages"

Write-Host "`nDone. Se o push falhar, confirme em github.com que estás logado como goulartfelipe618-beep.`n" -ForegroundColor Green
