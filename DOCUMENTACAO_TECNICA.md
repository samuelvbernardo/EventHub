#  Documentação Técnica - EventHub

## 1. Integração com API

 O projeto usa axios para se conectar com o backend Django. Quando acontece um erro (por exemplo, token expirado), o sistema automaticamente tenta renovar o token sem o usuário perceber.

**Referência:** `EventApp/src/lib/hooks/useApi.ts`

**Como funciona:** Quando você faz login, o sistema guarda um token. Se esse token expira, o axios detecta o erro 401 e renova automaticamente, sem você precisar fazer login de novo.

```typescript
// Quando dá erro 401 (token expirado), renova automaticamente
if (error.response?.status === 401) {
  // Pega um novo token
  const { data } = await client.post(API_ENDPOINTS.REFRESH, { refresh: refreshToken })
  storage.setToken(newAccess)
  // Tenta a requisição novamente com o novo token
  return client.request(originalRequest)
}
```

### O fluxo de autenticação JWT (login/logout)

Quando é feito login, o sistema guarda seus dados no navegador (localStorage). Quando fecha e abre de novo, ele lembra de você automaticamente.

**Localização do arquivo:** `EventApp/src/components/molecules/LoginForm.tsx` (tela de login) e `EventApp/src/lib/context/AuthContext.tsx` (controle de sessão)

**Como funciona:**
1. Você digita usuário e senha
2. O sistema pede um token para o backend
3. Guarda o token no navegador
4. Busca seus dados (nome, email, se é organizador ou participante)
5. Quando você volta ao site, ele já te reconhece

```typescript
// Faz login e guarda os dados
const response = await api.post(API_ENDPOINTS.LOGIN, values)
storage.setToken(access)
storage.setRefreshToken(refresh)

// Busca informações do usuário logado
const meResp = await api.get(API_ENDPOINTS.ME)
login(user, tokens)  // Salva tudo
```

### Frontend interagindo com os endpoints principais (criar, editar, deletar)

**Parcialmente.** O CRUD completo (criar, editar, deletar) está implementado apenas para **Eventos**. 
**CRUD Completo - Eventos:** `EventApp/src/services/eventoService.ts`

```typescript
// Todas as operações de eventos (CRUD completo)
{
  listEventos: async () => api.get(...)      // Listar
  createEvento: async () => api.post(...)    // Criar
  updateEvento: async () => api.put(...)     // Editar
  deleteEvento: async () => api.delete(...)  // Deletar
}
```

**Uso na interface:** `EventApp/src/pages/EventosPage.tsx`
```typescript
// Quando clica em "Salvar", verifica se está editando ou criando
if (editingEvent) {
  await eventosService.updateEvento(editingEvent.id, data)  // Edita
} else {
  await eventosService.createEvento(data)  // Cria novo
}
refetch()  // Atualiza a lista

// Deletar evento
const handleDelete = async (eventoId) => {
  await eventosService.deleteEvento(eventoId)
  toast.success("Evento deletado com sucesso!")
  refetch()
}
```

**Nota:** Embora os serviços tenham métodos para update e delete de inscrições, **apenas Eventos possui interface completa** com botões de editar e deletar visíveis para o usuário (organizador).

---

## 2. Estrutura e Organização

O projeto segue a estrutura atomic design: componentes pequenos (atoms), médios (molecules) e grandes (organisms). Também há separação entre páginas, serviços de API e utilitários.

**Estrutura:**
```
src/
├── components/
│   ├── atoms/      → Peças pequenas (Botão, Input, Card)
│   ├── molecules/  → Peças médias (Card de Evento, Formulário de Login)
│   └── organisms/  → Peças grandes (Cabeçalho da página)
├── lib/
│   ├── constants/  → URLs da API
│   ├── context/    → Dados compartilhados (usuário logado, notificações)
│   ├── hooks/      → Funções reutilizáveis
│   ├── types/      → Tipos do TypeScript
│   └── validators/ → Regras de validação de formulários
├── pages/          → Telas (Login, Eventos, Dashboard)
├── routes/         → Controle de rotas
└── services/       → Chamadas para a API
```

**Vantagem:** Facilita encontrar componentes. Botões estão em `atoms`, novas páginas em `pages`, etc.

### Tipos TypeScript centralizados

Todos os tipos ficam em um arquivo único (`types/index.ts`), facilitando a manutenção e consistência.

 `EventApp/src/lib/types/index.ts`

**O que contém:** Definições de User (usuário), Evento, Inscrição, etc.

```typescript
export interface User {
  id: number
  username: string
  email: string
  role: "participante" | "organizador"  // Só pode ser um desses dois
}

export interface Evento {
  titulo: string
  tipo: "presencial" | "virtual" | "hibrido"  // Só esses 3 tipos
  inscricaoStatus?: "pendente" | "confirmada" | "cancelada"
}
```

**Como é usado:** Funções que trabalham com eventos declaram que esperam receber um `Evento`, e o TypeScript valida automaticamente.

### Componentes reutilizáveis

Componentes são genéricos e usados em vários lugares. Por exemplo, o mesmo botão serve para login, criar evento, deletar, etc. Apenas mudam a cor e o texto via props.

**Referência:** `EventApp/src/components/atoms/Button.tsx`

**Como funciona:** O botão aceita configurações (cor, tamanho, estado de loading):

```typescript
// O mesmo botão pode ser usado de várias formas:
<Button variant="primary">Entrar</Button>           // Botão roxo
<Button variant="danger">Deletar</Button>           // Botão vermelho
<Button variant="ghost" size="sm">Cancelar</Button> // Botão transparente pequeno
<Button loading={true}>Salvando...</Button>         // Mostra "Carregando..."
```

**Vantagem:** Para mudar o estilo de todos os botões do site, basta alterar um único arquivo.

### Context API para dados globais

Informações que várias páginas precisam (quem está logado, notificações) ficam em Contexts, evitando passar props repetidamente de pai para filho.

**Referência:** `EventApp/src/lib/context/AuthContext.tsx`

**Como funciona:** O Context de autenticação armazena quem está logado e se é organizador ou participante.

```typescript
// Qualquer componente pode acessar essas informações
const { state, login, logout, isOrganizador } = useAuth()

// Exemplo: só mostra botão "Criar Evento" se for organizador
{isOrganizador() && (
  <Button>Criar Novo Evento</Button>
)}
```

**Vantagem:** Não é necessário passar `user` de componente em componente. Qualquer componente pode perguntar "quem está logado?" diretamente.

---

## 3. Funcionalidades e Navegação

### Rotas protegidas

Páginas como Dashboard, Eventos, Inscrições e Notificações só aparecem se você estiver logado. Se tentar acessar sem login, volta para a tela de login.

**Referência:** `EventApp/src/routes/PrivateRoute.tsx`

**Como funciona:** Antes de mostrar a página, verifica se você está logado. Se não estiver, manda para /login.

```typescript
// Verifica se está logado
if (!state.isAuthenticated) {
  return <Navigate to="/login" />  // Volta pro login
}

// Se estiver logado, mostra a página
return <>{children}</>
```

**Exemplo de uso:** `EventApp/src/routes/routes.tsx`
```typescript
// Essa páginas precia de login
<Route path="/dashboard" element={
  <PrivateRoute><DashboardPage /></PrivateRoute>
} />

// Essa não precisa (qualquer um acessa)
<Route path="/login" element={<LoginPage />} />
```

### Tela de login com validação

Quando você digita usuário e senha, o sistema verifica se está tudo certo antes de enviar. Mostra mensagens de erro específicas.

**Referência:** `EventApp/src/lib/validators/validationSchema.ts` (regras) e `EventApp/src/components/molecules/LoginForm.tsx` (formulário)

**Regras de validação:**
```typescript
// Usuário tem que ter no mínimo 3 letras, só pode ter letras, números e _
username: yup
  .string()
  .min(3, "Usuário deve ter no mínimo 3 caracteres")
  .matches(/^[a-zA-Z0-9_]+$/, "Só pode letras, números e _")
  .required("Campo obrigatório")

// Senha com no mínimo 6 caracteres
password: yup
  .string()
  .min(6, "Senha deve ter no mínimo 6 caracteres")
  .required("Campo obrigatório")
```

**Mensagens de erro personalizadas:**
```typescript
// Se der erro 401 (senha errada)
if (err.response?.status === 401) {
  message = "Usuário ou senha incorretos."
}

// Se não tiver internet
if (!navigator.onLine) {
  message = "Sem conexão com a internet."
}
```

**Redirecionamento:** Depois de logar com sucesso, manda direto pro Dashboard.

### Dados aparecem dinamicamente na tela

A lista de eventos, inscrições e notificações vem do backend e é mostrada em tempo real. Tem loading enquanto carrega e mensagem se não tiver nada.

**Referência:** `EventApp/src/pages/EventosPage.tsx`

**Como funciona:** Busca os eventos do backend e mostra na tela

```typescript
// Busca eventos (carrega quando a página abre)
const { data: eventosData, loading } = useFetch(() => eventosService.listEventos(page), [page])

// Enquanto carrega, mostra o círculo girando
{loading ? (
  <div>
    <div className="animate-spin">⏳</div>
    <p>Carregando eventos...</p>
  </div>
) : filteredEventos.length > 0 ? (
  // Se tiver eventos, mostra eles
  <div className="grid">
    {filteredEventos.map((evento) => (
      <EventCard evento={evento} />
    ))}
  </div>
) : (
  // Se não tiver eventos, mostra mensagem
  <p>Nenhum evento encontrado</p>
)}
```

**Cards com cores diferentes:** `EventApp/src/components/molecules/EventCard.tsx`
```typescript
// Muda a cor da borda conforme o status da inscrição
switch (evento.inscricaoStatus) {
  case "confirmada": return "borda verde"
  case "pendente": return "borda amarela"
  case "cancelada": return "borda vermelha"
}
```

### Logout funcionando corretamente

Quando clica em Sair, mostra um modal de confirmação. Ao confirmar, apaga tudo (tokens, dados do usuário) e volta pro login.

**Referência:** `EventApp/src/components/organisms/Header.tsx`

**Como funciona:**
1. Clica no botão "Sair"
2. Aparece modal perguntando "Tem certeza?"
3. Se confirmar, chama a função de logout
4. Vai pro login

```typescript
const confirmLogout = () => {
  logout()           // Apaga tokens e dados
  navigate("/login") // Volta pro login
}

<Button onClick={() => setShowLogoutConfirm(true)}>Sair</Button>

<ConfirmModal
  isOpen={showLogoutConfirm}
  title="Confirmar Saída"
  message="Tem certeza que deseja sair?"
  onConfirm={confirmLogout}
/>
```

**O que a função logout faz:** `EventApp/src/lib/context/AuthContext.tsx`
```typescript
const logout = () => {
  storage.clearAll()           // Apaga tudo do navegador
  clearDefaultAuthorization()  // Remove token do axios
  dispatch({ type: "LOGOUT" }) // Atualiza o estado (você não está mais logado)
}
```

---

## 4. Estilo e Usabilidade

O site se adapta para celular, tablet e desktop. No celular, o menu vira um hambúrguer (aquelas 3 linhas). Também tem animações de carregamento quando busca dados.

**Referência:** `EventApp/src/components/organisms/Header.tsx`

**Menu responsivo:**
```typescript
// No desktop, mostra os links normalmente
<nav className="hidden md:flex">  // hidden = escondido no celular
  <Link to="/dashboard">Home</Link>
  <Link to="/eventos">Eventos</Link>
</nav>

// No celular, mostra o menu hambúrguer
<button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
  Menu
</button>

// Quando clica, abre o menu por baixo
{mobileMenuOpen && (
  <div className="md:hidden">
    <Link to="/dashboard">Home</Link>
  </div>
)}
```

**Grid responsivo:** `EventApp/src/pages/EventosPage.tsx`
```typescript
// No celular: 1 coluna | No tablet: 2 colunas | No desktop: 3 colunas
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {eventos.map(...)}
</div>
```

### Sistema de estilização

O projeto utiliza Tailwind CSS, um framework CSS moderno. Também foram criadas variáveis de cor personalizadas para manter a consistência visual.

**Referência:** `EventApp/tailwind.config.cjs` (configuração) e `EventApp/src/index.css` (cores)

**Como funciona:**
```javascript
// Cores personalizadas configuradas no Tailwind
colors: {
  border: "hsl(var(--border))",
  primary: {
    DEFAULT: "hsl(var(--primary))",    // Cor roxa principal
    foreground: "hsl(var(--primary-foreground))",  // Texto em cima do roxo
  },
}
```

**Variáveis CSS:**
```css
/* Modo claro */
:root {
  --primary: 262.1 83.3% 57.8%;  /* Roxo */
  --background: 0 0% 100%;        /* Branco */
}

/* Modo escuro  */
.dark {
  --primary: 263.4 70% 50.4%;
  --background: 224 71.4% 4.1%;  /* Preto azulado */
}
```

**Vantagem:** Para mudar a cor principal do site inteiro, basta alterar uma variável e tudo atualiza automaticamente.

---

## 5. Boas Práticas e Código

Os nomes de variáveis e funções explicam claramente o que fazem. Por exemplo: `handleInscribe` = lidar com inscrição, `getBorderColor` = obter a cor da borda.

**Exemplos de nomenclatura clara:**
```typescript
const isSubscribeButtonEnabled = !evento.inscricaoStatus  // Deixa claro: "botão habilitado?"
const handleCreateOrUpdate = async (data) => { ... }      // Deixa claro: "cria ou atualiza"
const getBorderColor = () => { ... }                       // Deixa claro: "retorna uma cor"
```

**Comentários úteis:**
```typescript
// Verifica se o botão deve estar habilitado
// Só habilita se NÃO houver nenhuma inscrição
const isSubscribeButtonEnabled = !evento.inscricaoStatus
```

### Os hooks do React usados corretamente

O projeto utiliza `useState` para guardar informações temporárias (como se um modal está aberto), `useEffect` para executar ações quando a página carrega, e `useContext` para compartilhar informações entre componentes.

**useState - Armazenar estado local:**
```typescript
const [searchTerm, setSearchTerm] = useState("")      // Texto digitado na busca
const [showForm, setShowForm] = useState(false)       // Modal está aberto?
const [page, setPage] = useState(1)                   // Página atual
```

**useEffect - Executar efeitos colaterais:**

**Referência:** `EventApp/src/components/organisms/Header.tsx`
```typescript
useEffect(() => {
  let mounted = true  // Padrão para evitar problemas quando sai da página

  // Busca quantas notificações não lidas existem
  const fetchCount = async () => {
    if (!state.user) return  // Se não estiver logado, não faz nada
    
    const count = await notificacoesService.getUnreadCount()
    if (mounted) setUnreadCount(count)  // Só atualiza se ainda estiver na página
  }

  fetchCount()  // Busca agora
  
  // Também escuta se chegou notificação nova
  window.addEventListener("notificationsUpdated", fetchCount)

  // Quando sair da página, para de escutar (cleanup)
  return () => {
    mounted = false
    window.removeEventListener("notificationsUpdated", fetchCount)
  }
}, [state.user])  // Executa novamente se o usuário mudar
```

**useContext - Compartilhar informações globalmente:**

**Referência:** `EventApp/src/pages/EventosPage.tsx`
```typescript
// Acessa informações compartilhadas
const { isOrganizador } = useAuth()  // Verifica se é organizador
const toast = useToast()             // Acessa sistema de notificações

// Usa as informações
const handleInscribe = async (eventoId) => {
  await inscricoesService.createInscricaoByEventoId(eventoId)
  toast.success("Inscrição realizada!")  // Mostra mensagem de sucesso
  refetch()  // Atualiza a lista
}

// Renderização condicional baseada no papel do usuário
{isOrganizador() && (
  <Button>Criar Evento</Button>
)}
```

**useReducer - Para lógica mais complexa:**

**Referência:** `EventApp/src/lib/context/AuthContext.tsx`
```typescript
// Gerencia o estado de autenticação de forma organizada
const [state, dispatch] = useReducer(authReducer, initialState)

// Diferentes tipos de ação
const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return { ...state, isAuthenticated: true, user: action.payload.user }
    case "LOGOUT":
      return { ...initialState, loading: false }
  }
}
```

## 6. Apresentação e Documentação

O README.md explica o que é o projeto, como instalar, como configurar e como usar.

**Referência:** `README.md` (na raiz do projeto)

**O que tem:**

1. **Descrição:** O que é o EventHub e para que serve
2. **Tecnologias:** Lista de tudo que foi usado (React, TypeScript, Django, etc.)
3. **Como instalar:**
   - Passo a passo para instalar o backend (Django)
   - Passo a passo para instalar o frontend (React)
   - Como criar o arquivo `.env` com as configurações
4. **Como usar:**
   - Instruções para participantes (cadastrar, fazer login, se inscrever)
   - Instruções para organizadores (criar eventos, gerenciar inscrições)
5. **URLs:** Onde acessar a aplicação, API, documentação

**Exemplo de trecho do README:**
```markdown
## Como Usar

### Como Participante:
1. Acesse `/register` para criar uma conta
2. Faça login em `/login`
3. Navegue pelos eventos disponíveis
4. Inscreva-se em eventos de interesse
5. Acompanhe suas inscrições em `/inscricoes`

### Como Organizador:
1. Acesse `/organizadores/cadastrar`
2. Faça login
3. Crie eventos no dashboard
4. Gerencie inscrições e participantes
```

---

