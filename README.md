# YT Downloader com Efeitos de Áudio 🎶

Aplicativo web para download de vídeos do YouTube com efeitos de áudio inovadores, incluindo 8D e Slowed + Reverb.

## 🚀 Requisitos do Sistema
- **Node.js** versão 20.x ou superior
- **npm** (geralmente vem com o Node.js)
- **Python** (para yt-dlp)
- **FFmpeg** para processamento de áudio

## 📥 Instalação

### 1. Clone o Repositório
```bash
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
```bash
# Navegue até a pasta do backend
cd backend

# Instale as dependências
npm install

# Crie o arquivo .env
cp .env.example .env

# Inicie o servidor
npm run dev
```

### 4. Configure o Frontend
```bash
# Em outro terminal, navegue até a pasta raiz
cd ..

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

## 🌐 Acesso

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend:** [http://localhost:3000](http://localhost:3000)

## 🛠️ Solução de Problemas

### Erro de FFmpeg Não Encontrado
```bash
# Verifique se o FFmpeg está instalado corretamente
ffmpeg -version

# Se não estiver instalado, siga as instruções da seção de instalação
```

### Erro de Módulos Não Encontrados
```bash
# Limpe o cache do npm
npm cache clean --force

# Delete node_modules e package-lock.json
rm -rf node_modules package-lock.json

# Reinstale as dependências
npm install
```

## 🔧 Configurações Adicionais

### Variáveis de Ambiente (.env)
```env
PORT=3000
NODE_ENV=development
```

### Configuração do CORS
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true
}));
```

## 📦 Estrutura do Projeto
```
site-8d/
├── backend/           # Servidor Node.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   └── package.json
├── src/              # Frontend React
│   ├── components/
│   ├── services/
│   ├── styles/
│   └── App.jsx
└── package.json
```

## 🔐 Segurança

- Mantenha **Node.js** e todas as dependências atualizadas
- Nunca compartilhe seu arquivo `.env`
- Configure corretamente as políticas de CORS
- Limite o tamanho dos uploads no backend

## 📝 Scripts Disponíveis

### Backend
```bash
npm run dev      # Inicia o servidor em modo desenvolvimento
npm run start    # Inicia o servidor em modo produção
```

### Frontend
```bash
npm run dev      # Inicia o servidor de desenvolvimento
npm run build    # Cria a build de produção
npm run preview  # Visualiza a build de produção
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie sua branch de feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📧 Contato

Anthony Richard - [GitHub](https://github.com/Anthony-Richard1)

Link do Projeto: [https://github.com/Anthony-Richard1/site-8d](https://github.com/Anthony-Richard1/site-8d)