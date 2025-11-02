# EventHub - Sistema de Gerenciamento de Eventos

Sistema web para gerenciamento de eventos desenvolvido com Django REST Framework (backend) e React + TypeScript (frontend). A aplicação permite que organizadores criem e gerenciem eventos, enquanto participantes podem se inscrever e acompanhar suas participações.

## Sobre o Projeto

EventHub é uma plataforma full-stack que implementa um sistema completo de gerenciamento de eventos com autenticação JWT, sistema de permissões diferenciado entre participantes e organizadores, e notificações automáticas.

**Principais características:**
- Autenticação JWT com tokens de acesso e refresh
- Sistema de permissões (Participante vs Organizador)
- CRUD completo de eventos, inscrições e notificações
- Soft delete em todos os modelos
- Sistema de notificações automático via Django signals
- Interface responsiva com Tailwind CSS
- Documentação interativa da API (Swagger/OpenAPI)

## Tecnologias Utilizadas

**Backend:**
- Django 5.2.6
- Django REST Framework 3.16.1
- djangorestframework-simplejwt 5.5.1
- django-cors-headers 4.9.0
- drf-spectacular 0.28.0
- SQLite 3.x

**Frontend:**
- React 18.3.1
- TypeScript 5.3.3
- Vite 5.1.0
- React Router DOM 7.9.5
- Axios 1.7.7
- React Hook Form 7.65.0
- Yup 1.7.1
- Tailwind CSS 3.4.18

## Pré-requisitos

- Python 3.8 ou superior
- Node.js 16 ou superior
- npm (geralmente instalado com Node.js)

Verificar instalações:
```powershell
python --version
node --version
npm --version
```

## Instalação e Configuração

### 1. Backend (Django)

Navegue até a pasta do backend:
```powershell
cd EventHub
```

Crie e ative um ambiente virtual Python:
```powershell
python -m venv venv
.\venv\Scripts\activate # Windows
source venv/bin/activate # Linux/Mac
```

**Nota:** Se encontrar erro de política de execução no PowerShell, execute:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Instale as dependências:
```powershell
pip install -r requirements.txt
```

**Importante: Crie o arquivo `.env` no mesmo nivel que `.env.example`. Copie o arquivo `.env.example` para `.env`:**


Edite o arquivo `.env` e configure as variáveis necessárias:
```env
DEBUG=True
SECRET_KEY=your-secret-key-here
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

**Importante:** Gere uma SECRET_KEY segura executando:
```powershell
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Execute as migrações do banco de dados:
```powershell
python manage.py migrate
```

(Opcional) Crie um superusuário para acessar o admin:
```powershell
python manage.py createsuperuser
```

Inicie o servidor:
```powershell
python manage.py runserver
```

O backend estará rodando em: http://localhost:8000

### 2. Frontend (React + Vite)

Abra um novo terminal e navegue até a pasta do frontend:
```powershell
cd EventApp
```

Instale as dependências:
```powershell
npm install
```

**Importante: Crie o arquivo `.env` no mesmo nivel que `.env.example`. Copie o arquivo `.env.example` para `.env`:**

O arquivo `.env` deve conter:
```env
VITE_API_URL=http://localhost:8000/api
```

Inicie o servidor de desenvolvimento:
```powershell
npm run dev
```

O frontend estará rodando em: http://localhost:5173

## Acessando a Aplicação

- **Aplicação Web:** http://localhost:5173
- **API REST:** http://localhost:8000/api/v1/
- **Admin Django:** http://localhost:8000/admin/
- **Documentação Swagger:** http://localhost:8000/api/docs/
- **Documentação ReDoc:** http://localhost:8000/api/redoc/

## Como Usar

### Como Participante:
1. Acesse `/register` para criar uma conta
2. Faça login em `/login`
3. Navegue pelos eventos disponíveis no dashboard
4. Inscreva-se em eventos de interesse
5. Acompanhe suas inscrições em `/inscricoes`
6. Visualize notificações clicando no ícone de sino

### Como Organizador:
1. Acesse `/organizadores/cadastrar` para criar um perfil de organizador
2. Faça login em `/login`
3. Crie eventos no dashboard
4. Configure título, descrição, datas, local, tipo (presencial/virtual/híbrido), capacidade e preço
5. Gerencie inscrições e visualize participantes
6. Receba notificações sobre novas inscrições

---

## Licença

Este projeto foi desenvolvido para fins educacionais como parte da disciplina de Desenvolvimento Web II.
