# E-Transporte.pro — Landing

## Site publicado (GitHub Pages)

Após configurar o deploy, o site fica em:

**https://goulartfelipe618-beep.github.io/LANDING_PAGE/**

---

## Subir o código para o GitHub (primeira vez)

**Erro 403 “denied to felipegoulart06-lab”?** O Windows estava a usar outra conta. O remoto já está com o utilizador certo no URL:

`https://goulartfelipe618-beep@github.com/goulartfelipe618-beep/LANDING_PAGE.git`

### Opção A — script (recomendado)

1. Instale o **GitHub CLI** (se ainda não tiver): `winget install GitHub.cli`
2. No PowerShell, na pasta do projeto:

```powershell
cd "c:\Users\55479\Desktop\landing page e-transporte.pro"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\push-github.ps1
```

3. Quando abrir o browser em **github.com/login/device**, faça login com **`goulartfelipe618-beep`** (não com felipegoulart06-lab).

### Opção B — manual

```powershell
git init
git branch -M main
git add .
git commit -m "Landing E-Transporte.pro + deploy GitHub Pages"
git remote add origin https://goulartfelipe618-beep@github.com/goulartfelipe618-beep/LANDING_PAGE.git
gh auth login --web
gh auth setup-git
git push -u origin main
```

Use **Personal Access Token** como “palavra-passe” se o Git pedir (não a senha da conta).

---

## Ativar deploy automático (uma vez)

1. Abra o repositório: [LANDING_PAGE](https://github.com/goulartfelipe618-beep/LANDING_PAGE)
2. **Settings** → **Pages**
3. Em **Build and deployment** → **Source**: escolha **GitHub Actions** (não “Deploy from a branch”)
4. Faça um push qualquer na branch `main` (ou **Actions** → workflow **Deploy GitHub Pages** → **Run workflow**)

A cada `git push` na `main`, o site é gerado de novo e publicado em alguns minutos.

---

## Editar e publicar (dia a dia)

```powershell
git add .
git commit -m "Descrição da alteração"
git push
```

---

## Chat Áxus (opcional)

Para o webhook funcionar no site do GitHub, crie secrets no repositório: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

- `VITE_N8N_WEBHOOK_TEST`
- `VITE_N8N_WEBHOOK_PROD`

(O workflow já referencia estes nomes.)

---

## Teste local

```powershell
npm install
npm run dev
```

Build com o mesmo caminho do GitHub Pages:

```powershell
$env:VITE_BASE_PATH="/LANDING_PAGE/"; npm run build; npm run preview
```
