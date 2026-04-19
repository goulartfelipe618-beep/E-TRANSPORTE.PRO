# E-Transporte.pro — Landing

## Site em produção

- **https://e-transporte.pro**
- **https://www.e-transporte.pro** (use redirecionamento no DNS ou no hosting para apontar `www` → apex ou o inverso; URL canónica no HTML: `https://e-transporte.pro/`)

---

## Espelho no GitHub Pages (opcional)

Se o deploy automático publicar também no GitHub:

**https://goulartfelipe618-beep.github.io/LANDING_PAGE/**

(Com **domínio próprio** ligado no GitHub Pages, o build usa `VITE_BASE_PATH=/` no workflow.)

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
4. Para **domínio próprio** (`e-transporte.pro`): **Settings** → **Pages** → **Custom domain** e ficheiro DNS conforme a documentação do GitHub.
5. Faça um push na branch `main` (ou **Actions** → **Deploy GitHub Pages** → **Run workflow**)

---

## Editar e publicar (dia a dia)

```powershell
git add .
git commit -m "Descrição da alteração"
git push
```

---

## Teste local

```powershell
npm install
npm run dev
```

Build igual à produção (base na raiz do domínio):

```powershell
npm run build
npm run preview
```

Build antiga só para path de repositório GitHub (sem domínio próprio):

```powershell
$env:VITE_BASE_PATH="/LANDING_PAGE/"; npm run build; npm run preview
```
