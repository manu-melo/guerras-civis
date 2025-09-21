# Guerras Civis - Sistema de Jogo

Sistema web moderno para hospedar e gerenciar partidas do jogo **Guerras Civis** do Habbo Hotel. Interface completa para hosts controlarem partidas através de uma interface Picture-in-Picture friendly.

## 🎮 Sobre o Jogo

O Guerras Civis é um jogo clássico de estratégia e dedução do universo Habbo, onde jogadores se dividem em dois times (Civis vs Máfia) e lutam pela dominação através de ações noturnas secretas e votações diárias.

### Características

- **12, 14, 16 ou 18 jogadores** divididos igualmente entre os times
- **18 cargos únicos** com habilidades especiais
- **Ciclos de jogo** estruturados: Noite → Acontecimentos → Dia → Votação
- **Sistema de Picture-in-Picture** para hosts
- **Persistência automática** com localStorage
- **Exportação/Importação** de partidas

## 🚀 Tecnologias

- **Next.js 15** com App Router
- **React 19**
- **TypeScript** (strict mode)
- **Tailwind CSS** para estilização
- **shadcn/ui** para componentes
- **XState** para máquina de estados
- **localStorage** para persistência

## 📦 Instalação e Execução

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd guerras-civis-game

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run dev

# Acesse http://localhost:3000
```

## 🎯 Como Usar

### Para Hosts

1. **Acessar**: Navegue até `http://localhost:3000`
2. **Iniciar**: Clique em "Iniciar Partida" na página inicial
3. **Configurar**:
   - Adicione seu nick como host
   - Adicione jogadores (12, 14, 16 ou 18)
   - Clique em "Guerrear" para começar
4. **Jogar**:
   - Sistema sorteia cargos automaticamente
   - Se houver Coringa, insira resultado do dado (1-5)
   - Registre ações dos jogadores durante a noite
   - Processe votações durante o dia
   - Acompanhe mensagens no painel lateral

### Picture-in-Picture

O sistema solicita permissão para PiP ao iniciar (opcional). A interface é otimizada para funcionar em janelas pequenas quando ativado.

## 🎲 Cargos do Jogo

### 👑 Time Civil (9 cargos)

- **Juiz**: Executa jogadores durante o dia
- **Policial**: Prende jogadores, vê ações contra si
- **Anjo**: Protege jogadores das ações hostis
- **Detetive**: Investiga cargos secretamente
- **Aldeão**: Voto vale 3 pontos
- **Fada**: Ação baseada em dado (1-6)
- **Espírito Vingativo**: Leva alguém ao morrer
- **Escudeiro**: Reflete ações para o atacante
- **Coringa**: Assume cargo baseado em dado (1-5)

### 🗡️ Time Máfia (9 cargos)

- **Assassino**: Elimina jogadores
- **Aprendiz**: Herda poder do Assassino
- **Silenciador**: Impede fala, ação e voto
- **Paralisador**: Impede ação e voto
- **Bruxa**: Palavra proibida elimina
- **Paparazzi**: Revela cargos
- **Homem-bomba**: Explode laterais ao morrer
- **Psicopata**: Ação baseada em dado
- **Demônio**: Possui cargos de outros

## 🔧 Funcionalidades Implementadas

### ✅ Interface Principal

- Status do jogo em tempo real (fase atual, round, porcentagens dos times)
- Sistema de registrar ações noturnas
- Painel de votação com contabilização automática
- Botões de controle (eliminar, encerrar, verificar vencedor)

### ✅ Painel de Mensagens

- Feed permanente de todas as ações do jogo
- Código de cores: Verde (válidas), Amarelo (anuladas), Vermelho (eliminações)
- Exportação em JSON e TXT
- Timestamps em todas as mensagens

### ✅ Sistema de Cargos

- Sorteio automático balanceado
- 18 cargos únicos implementados
- Validação de ações por cargo
- Exceções de regras para cargos específicos

### ✅ Persistência

- Auto-save automático no localStorage
- Restauração de partidas interrompidas
- Export/Import manual de arquivos JSON

## 🎯 Regras Especiais

### Exceções de Ações

Cargos que podem agir independentemente (não sofrem regra de "2 ações contra mesmo alvo"):

**Civis**: Policial, Detetive, Fada, Escudeiro  
**Máfias**: Paralisador, Paparazzi, Demônio

### Condições de Vitória

- Eliminar todo o time adversário
- Ter >70% dos jogadores vivos em um time
- Verificação manual pelo host através do botão "Verificar vencedor"

### Ações com Dado

- **Fada**: 1=Paralisa, 2=Fotografa, 3=Mata, 4=Silencia, 5=Investiga, 6=Mata
- **Psicopata**: 1,3,5=Mata / 2,4,6=Salva
- **Coringa**: 1=Policial, 2=Anjo, 3=Detetive, 4=Fada, 5=Escudeiro

## 📁 Estrutura do Projeto

```
guerras-civis-game/
├── src/
│   ├── app/                 # Páginas Next.js
│   │   ├── como-jogar/      # Página de regras completas
│   │   ├── jogo/            # Interface principal do jogo
│   │   └── page.tsx         # Página inicial
│   ├── components/          # Componentes React
│   │   ├── ui/              # Componentes shadcn/ui
│   │   ├── GameBoard.tsx    # Interface principal do jogo
│   │   ├── Header.tsx       # Cabeçalho com navegação
│   │   ├── HomeHero.tsx     # Página inicial
│   │   ├── MessagesPanel.tsx # Painel de mensagens
│   │   ├── PlayersList.tsx  # Lista de jogadores
│   │   └── VotingPanel.tsx  # Sistema de votação
│   ├── hooks/               # React Hooks customizados
│   │   ├── useGameState.ts  # Hook principal do jogo
│   │   └── useLocalStorage.ts # Persistência localStorage
│   ├── lib/                 # Lógicas principais
│   │   ├── gameEngine.ts    # Engine principal do jogo
│   │   ├── gameMachine.ts   # Máquina de estados XState
│   │   ├── roles.ts         # Definições e dados dos cargos
│   │   └── utils.ts         # Utilitários gerais
│   └── types/               # Tipos TypeScript
│       └── game.ts          # Tipos principais do jogo
```

## 🎨 Design System

### Tema

- **Default**: Escuro (fundo preto)
- **Alternativo**: Claro (toggle no header)
- **Cores dos times**: Azul (Civis), Vermelho (Máfia)
- **Responsivo**: Desktop e mobile
- **PiP friendly**: Interface adaptável para Picture-in-Picture

### Acessibilidade

- ✅ Navegação por teclado
- ✅ Roles ARIA apropriados
- ✅ Contraste adequado
- ✅ Compatível com leitores de tela

## 📝 Checklist de QA

### ✅ Funcionalidades Básicas

- [x] Iniciar partida com 12/14/16/18 jogadores
- [x] Sorteio automático de cargos balanceado
- [x] Processamento do Coringa (dado 1-5, rejeita 6)
- [x] Registrar ações durante a noite
- [x] Sistema de votação completo
- [x] Eliminações especiais (Homem-bomba, Espírito Vingativo)

### ✅ Interface

- [x] Tema escuro/claro funcionando
- [x] Painel de mensagens sempre visível
- [x] Cores corretas por tipo de mensagem
- [x] Responsividade em diferentes tamanhos
- [x] Picture-in-Picture otimizado

### ✅ Persistência

- [x] Auto-save funcionando
- [x] Restauração de partidas
- [x] Export/Import de arquivos JSON
- [x] Limpeza de dados ao resetar

### ✅ Validações

- [x] Não permitir ações de jogadores mortos
- [x] Regra de múltiplas ações respeitada
- [x] Exceções de cargos funcionando
- [x] Verificação de vitória manual
- [x] Contagem de votos correta (Aldeão = 3)

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Servidor de desenvolvimento

# Build
npm run build        # Build de produção
npm run start        # Servidor de produção

# Linting e Formatação
npm run lint         # ESLint
npm run lint:fix     # ESLint com correção automática

# Testes (quando implementados)
npm run test         # Testes unitários
npm run test:e2e     # Testes end-to-end
npm run test:coverage # Coverage de testes
```

## 🌟 Próximas Features

- [ ] Testes unitários completos
- [ ] Testes E2E com Playwright
- [ ] Sistema de rooms/salas múltiplas
- [ ] Histórico de partidas
- [ ] Estatísticas de jogadores
- [ ] Integração com APIs externas
- [ ] PWA (Progressive Web App)
- [ ] Modo espectador

## 📄 Licença

Este projeto está licenciado sob a MIT License.

---

**Desenvolvido com ❤️ para a comunidade Habbo Brasil**

## 🎯 Status do Projeto

**Status**: ✅ **Funcional e Pronto para Uso**

O sistema está completamente implementado e funcional, incluindo:

- ✅ Interface completa e responsiva
- ✅ Todos os 18 cargos implementados
- ✅ Sistema de votação funcional
- ✅ Persistência de dados
- ✅ Máquina de estados robusta
- ✅ Validações de regras
- ✅ Tema claro/escuro
- ✅ Exportação/Importação
- ✅ Picture-in-Picture ready

**Para usar**: Simplesmente execute `npm run dev` e acesse `http://localhost:3000`
