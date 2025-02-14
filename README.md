```markdown
# YT Downloader com Efeitos de Áudio 🎶
Aplicativo web para download de vídeos do YouTube com efeitos de áudio inovadores, incluindo 8D e Slowed + Reverb.

---

## 🚀 Requisitos do Sistema
- **Node.js** versão 20.x ou superior
- **npm** (geralmente vem com o Node.js)
- **Python** (para yt-dlp)
- **FFmpeg** para processamento de áudio

---

## 📥 Instalação

### 1. Clone o Repositório
Abra o PowerShell e digite o seguinte comando para clonar o repositório:

```powershell
git clone https://github.com/Anthony-Richard1/site-8d.git
cd site-8d
```

### 2. Instale o FFmpeg

- 🖥️ **Windows:**  
  Baixe o FFmpeg [aqui](https://ffmpeg.org/download.html).  
  Extraia os arquivos baixados.  
  Adicione o caminho da pasta `bin` ao `PATH` do sistema:

  Abra o PowerShell como Administrador e digite:

  ```powershell
  [System.Environment]::SetEnvironmentVariable("Path", "$env:Path;C:\caminho\para\ffmpeg\bin", [System.EnvironmentVariableTarget]::Machine)
  ```

  Substitua `C:\caminho\para\ffmpeg\bin` pelo caminho real onde você extraiu o FFmpeg.

- 🐧 **Linux:**

  ```bash
  sudo apt update
  sudo apt install ffmpeg
  ```

- 🍏 **macOS:**

  ```bash
  brew install ffmpeg
  ```

### 3. Configure o Backend

No PowerShell, navegue até a pasta do backend e instale as dependências:

```powershell
cd backend
npm install
```

Agora, crie o arquivo `.env`:

```powershell
cp .env.example .env
```

Inicie o servidor:

```powershell
npm run dev
```

### 4. Configure o Frontend

Abra outro terminal (PowerShell), navegue até a pasta raiz e instale as dependências:

```powershell
cd ..
npm install
```

Inicie o servidor de desenvolvimento:

```powershell
npm run dev
```

---

## 🌐 Acesso

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend:** [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Solução de Problemas

### Erro de FFmpeg Não Encontrado

Verifique se o FFmpeg está instalado corretamente:

```powershell
ffmpeg -version
```

Se não aparecer a versão, tente os seguintes passos:

1. Limpe o cache do npm:

   ```powershell
   npm cache clean --force
   ```

2. Delete as pastas `node_modules` e o arquivo `package-lock.json`:

   ```powershell
   rm -rf node_modules package-lock.json
   ```

3. Reinstale as dependências:

   ```powershell
   npm install
   ```

---

## 🔧 Configurações Adicionais

### Variáveis de Ambiente (.env)

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
PORT=3000
NODE_ENV=development
```

### Configuração do CORS

Se necessário, altere as configurações de CORS no arquivo `backend/src/server.js`:

```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true
}));
```

---

## 📦 Estrutura do Projeto

```bash
site-8d/
├── backend/  # Servidor Node.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   └── package.json
├── src/  # Frontend React
│   ├── components/
│   ├── services/
│   ├── styles/
│   └── App.jsx
└── package.json
```

---

## 🔐 Segurança

- Mantenha **Node.js** e todas as dependências atualizadas.
- Nunca compartilhe seu arquivo `.env`.
- Configure corretamente as políticas de CORS no servidor.
- Limite o tamanho dos uploads no backend para evitar sobrecarga.

---

## 📝 Scripts Disponíveis

### Backend

- Inicie o servidor em modo desenvolvimento:

  ```powershell
  npm run dev
  ```

- Inicie o servidor em modo produção:

  ```powershell
  npm run start
  ```

### Frontend

- Inicie o servidor de desenvolvimento:

  ```powershell
  npm run dev
  ```

- Crie a build para produção:

  ```powershell
  npm run build
  ```

- Visualize a build de produção:

  ```powershell
  npm run preview
  ```

---

## 🤝 Contribuindo

1. Faça um fork do projeto.
2. Crie uma branch para sua feature:

   ```powershell
   git checkout -b feature/AmazingFeature
   ```

3. Commit suas mudanças:

   ```powershell
   git commit -m 'Add some AmazingFeature'
   ```

4. Faça o push para a branch:

   ```powershell
   git push origin feature/AmazingFeature
   ```

5. Abra um Pull Request.

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Consulte o arquivo `LICENSE` para mais detalhes.

---

## 📧 Contato

**Anthony Richard** - GitHub  
[https://github.com/Anthony-Richard1/site-8d](https://github.com/Anthony-Richard1/site-8d)

---
```