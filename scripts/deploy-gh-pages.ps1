# Deploy automático sem GitHub Actions
# Publica o conteúdo de `dist/` na branch `gh-pages` do repositório remoto.
#
# Uso (PowerShell):
#   cd "c:\Users\55479\Desktop\landing page e-transporte.pro"
#   .\scripts\deploy-gh-pages.ps1 -RemoteName e-transporte -BranchName gh-pages

[CmdletBinding()]
param(
  [string]$RemoteName = "e-transporte",
  [string]$BranchName = "gh-pages"
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$DistDir = Join-Path $Root "dist"
$TempWorkDir = Join-Path $env:TEMP ("gh-pages-deploy-" + [guid]::NewGuid().ToString("N"))

function EnsureGitHubRemote {
  param([string]$Name)
  & git remote get-url $Name | Out-Null
}

function EnsureViteBuild {
  # build igual ao CI: base no root
  $env:VITE_BASE_PATH = "/"
  Set-Location $Root

  if (!(Test-Path -Path (Join-Path $Root "node_modules"))) {
    Write-Host "node_modules não encontrado. Executando npm install..." -ForegroundColor Yellow
    npm install
  }

  Write-Host "Rodando build..." -ForegroundColor Cyan
  npm run build

  if (!(Test-Path -Path $DistDir)) {
    throw "Build falhou: pasta dist/ não encontrada em: $DistDir"
  }
}

function EnsureLocalBranchExists {
  param([string]$Name)

  # Se a branch não existe localmente, cria apontando para o HEAD atual.
  & git show-ref --verify --quiet ("refs/heads/" + $Name) 2>$null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Criando branch local '$Name' a partir do HEAD atual..." -ForegroundColor Yellow
    & git branch $Name
  }
}

try {
  EnsureGitHubRemote -Name $RemoteName
  EnsureViteBuild
  EnsureLocalBranchExists -Name $BranchName

  Write-Host "Atualizando trabalho no worktree: $TempWorkDir" -ForegroundColor Cyan
  & git worktree add $TempWorkDir $BranchName | Out-Null

  # Limpa o conteúdo do worktree (mantém apenas o .git)
  Get-ChildItem $TempWorkDir -Force | ForEach-Object {
    if ($_.Name -ne ".git") {
      Remove-Item $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
    }
  }

  Write-Host "Copiando dist/ -> gh-pages..." -ForegroundColor Cyan
  Copy-Item (Join-Path $DistDir "*") $TempWorkDir -Recurse -Force

  Set-Location $TempWorkDir
  & git add -A

  $msg = "Deploy GitHub Pages ($BranchName): $(Get-Date -Format u)"
  & git commit -m $msg --allow-empty | Out-Null

  Write-Host "Enviando branch '$BranchName' para remoto '$RemoteName'..." -ForegroundColor Cyan
  & git push $RemoteName $BranchName | Out-Null

  Write-Host "Deploy concluído: $RemoteName:$BranchName" -ForegroundColor Green
}
finally {
  # remove worktree (mesmo se houver erro)
  if (Test-Path -Path $TempWorkDir) {
    & git worktree remove $TempWorkDir --force | Out-Null
  }
}

