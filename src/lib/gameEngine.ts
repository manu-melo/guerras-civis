// src/lib/gameEngine.ts
import {
  Player,
  Role,
  Team,
  Action,
  Message,
  VoteResult,
  ActionType,
  CIVIL_ROLES,
  MAFIA_ROLES,
  EXCEPTION_ROLES,
  JOKER_MAPPINGS,
} from "@/types/game";
import { ROLES_DATA, ESSENTIAL_ROLES } from "@/lib/roles";
import { v4 as uuidv4 } from "uuid";

/**
 * Cria um novo jogador
 */
export function createPlayer(nick: string): Player {
  return {
    id: uuidv4(),
    nick: nick.trim(),
    alive: true,
    votes: 0,
  };
}

/**
 * Valida se o número de jogadores é válido
 */
export function isValidPlayerCount(count: number): boolean {
  return [12, 14, 16, 18].includes(count);
}

/**
 * Sorteia cargos para todos os jogadores
 */
export function assignRoles(players: Player[]): Player[] {
  if (!isValidPlayerCount(players.length)) {
    throw new Error("Número de jogadores inválido");
  }

  const halfCount = players.length / 2;
  const civilCount = halfCount;

  // Embaralhar jogadores
  const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);

  // Separar em dois grupos
  const civilPlayers = shuffledPlayers.slice(0, civilCount);
  const mafiaPlayers = shuffledPlayers.slice(civilCount);

  // Atribuir cargos civis
  const assignedCivilRoles = assignRolesToTeam(
    civilPlayers,
    CIVIL_ROLES,
    "CIVIL"
  );

  // Atribuir cargos máfias - garantir pelo menos 1 Assassino
  const assignedMafiaRoles = assignRolesToTeam(
    mafiaPlayers,
    MAFIA_ROLES,
    "MAFIA"
  );

  // Garantir pelo menos 1 Assassino
  ensureEssentialRoles(assignedMafiaRoles, "MAFIA");

  return [...assignedCivilRoles, ...assignedMafiaRoles];
}

/**
 * Atribui cargos para um time específico
 */
function assignRolesToTeam(
  players: Player[],
  availableRoles: Role[],
  team: Team
): Player[] {
  const shuffledRoles = [...availableRoles].sort(() => Math.random() - 0.5);

  return players.map((player, index) => ({
    ...player,
    role: shuffledRoles[index % shuffledRoles.length],
    team,
    originalRole: shuffledRoles[index % shuffledRoles.length],
  }));
}

/**
 * Garante que cargos essenciais estejam presentes
 */
function ensureEssentialRoles(players: Player[], team: Team): void {
  const essentialRoles = ESSENTIAL_ROLES[team] || [];

  for (const essentialRole of essentialRoles) {
    const hasRole = players.some((p) => p.role === essentialRole);

    if (!hasRole) {
      // Substitui um cargo menos crítico pelo essencial
      const replaceIndex = Math.floor(Math.random() * players.length);
      players[replaceIndex].role = essentialRole;
      players[replaceIndex].originalRole = essentialRole;
    }
  }
}

/**
 * Processa o dado do Coringa
 */
export function processJokerDice(
  players: Player[],
  diceValue: number
): Player[] {
  if (diceValue === 6) {
    throw new Error("Valor 6 não é permitido. Re-role o dado.");
  }

  const mapping = JOKER_MAPPINGS.find((m) => m.diceValue === diceValue);
  if (!mapping) {
    throw new Error("Valor de dado inválido");
  }

  return players.map((player) => {
    if (player.role === "Coringa") {
      return {
        ...player,
        originalRole: "Coringa", // Salva o cargo original
        role: mapping.role, // Assume o novo cargo baseado no dado
        // Mantém team como CIVIL (Coringa sempre é civil)
        team: "CIVIL",
      };
    }
    return player;
  });
}

/**
 * Valida se uma ação pode ser executada
 */
export function validateAction(
  action: Partial<Action>,
  players: Player[],
  existingActions: Action[]
): { valid: boolean; reason?: string } {
  const actor = players.find((p) => p.id === action.actorId);
  const target = players.find((p) => p.id === action.targetId);

  if (!actor || !actor.alive) {
    return { valid: false, reason: "Ator não encontrado ou morto" };
  }

  if (!target || !target.alive) {
    return { valid: false, reason: "Alvo não encontrado ou morto" };
  }

  if (actor.id === target.id && !canTargetSelf(actor.role!)) {
    return { valid: false, reason: "Não pode se auto-alvejar" };
  }

  // Verificar regra específica do Aprendiz
  if (actor.role === "Aprendiz" && action.type === "ASSASSINAR") {
    const assassinAlive = players.some(
      (p) => p.role === "Assassino" && p.alive
    );
    if (assassinAlive) {
      return {
        valid: false,
        reason: "Aprendiz não pode agir enquanto o Assassino estiver vivo",
      };
    }
  }

  // Verificar regra de múltiplas ações (exceções podem agir independentemente)
  if (!EXCEPTION_ROLES.includes(actor.role!)) {
    const actionsAgainstTarget = existingActions.filter(
      (a) =>
        a.targetId === target.id &&
        a.status === "VALID" &&
        !EXCEPTION_ROLES.includes(a.actorRole)
    );

    if (actionsAgainstTarget.length > 0) {
      return { valid: false, reason: "Alvo já foi alvo de outra ação" };
    }
  }

  return { valid: true };
}

/**
 * Registra uma ação noturna
 */
export function recordAction(
  actionData: Partial<Action>,
  players: Player[],
  existingActions: Action[]
): Action {
  const validation = validateAction(actionData, players, existingActions);

  const action: Action = {
    id: uuidv4(),
    actorId: actionData.actorId!,
    actorRole: actionData.actorRole!,
    targetId: actionData.targetId!,
    targetRole: players.find((p) => p.id === actionData.targetId)?.role,
    type: actionData.type!,
    timestamp: Date.now(),
    status: validation.valid ? "VALID" : "ANULLED",
    order: existingActions.length + 1,
    meta: {
      ...actionData.meta,
      reason: validation.reason,
    },
  };

  return action;
}

/**
 * Processa todas as ações da noite
 */
export function processNight(
  actions: Action[],
  players: Player[]
): {
  processedActions: Action[];
  messages: Message[];
  updatedPlayers: Player[];
} {
  // Ordenar ações por ordem de submissão
  const sortedActions = [...actions].sort((a, b) => a.order - b.order);

  const messages: Message[] = [];
  let updatedPlayers = [...players];
  const processedActions: Action[] = [];

  for (const action of sortedActions) {
    const result = processAction(action, updatedPlayers, processedActions);

    updatedPlayers = result.updatedPlayers;
    processedActions.push(result.processedAction);
    messages.push(...result.messages);
  }

  // Adicionar mensagem de resumo dos acontecimentos
  const timestamp = new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const summaryMessage: Message = {
    id: `summary-${Date.now()}`,
    createdAt: Date.now(),
    level: "INFO",
    text: `[${timestamp}] RESUMO DOS ACONTECIMENTOS — ${processedActions.length} ação(ões) processada(s)`,
  };

  messages.push(summaryMessage);

  return { processedActions, messages, updatedPlayers };
}

/**
 * Processa uma ação individual
 */
function processAction(
  action: Action,
  players: Player[],
  processedActions: Action[]
): {
  processedAction: Action;
  updatedPlayers: Player[];
  messages: Message[];
} {
  const messages: Message[] = [];
  let updatedPlayers = [...players];
  const processedAction = { ...action };

  const actor = players.find((p) => p.id === action.actorId);
  const target = players.find((p) => p.id === action.targetId);

  if (!actor || !target || action.status === "ANULLED") {
    // Ação já anulada ou atores inválidos
    messages.push(createActionMessage(action, "ACTION_ANULLED", players));
    return { processedAction, updatedPlayers, messages };
  }

  // Verificar proteções
  const angelProtections = processedActions.filter(
    (a) =>
      a.targetId === target.id && a.type === "PROTEGER" && a.status === "VALID"
  );

  const shieldProtections = processedActions.filter(
    (a) =>
      a.targetId === target.id && a.type === "DEFENDER" && a.status === "VALID"
  );

  // Proteção do Escudeiro - reflete TODAS as ações de volta para quem agiu
  // IMPORTANTE: O Escudeiro (DEFENDER) não apenas protege, mas reflete QUALQUER ação
  // A proteção só vale para uma noite, diferente do Anjo que apenas anula ações hostis
  // EXCEÇÃO: POSSUIR apenas é anulada, não refletida
  // PRIORIDADE: Escudeiro tem prioridade sobre Anjo
  if (shieldProtections.length > 0) {
    const shieldAction = shieldProtections[0];
    const shield = players.find((p) => p.id === shieldAction.actorId);

    // Anular a ação original
    processedAction.status = "ANULLED";
    processedAction.meta = {
      ...processedAction.meta,
      reason:
        action.type === "POSSUIR"
          ? "Alvo protegido pelo Escudeiro"
          : "Ação refletida pelo Escudeiro",
      reflectedTo: action.type === "POSSUIR" ? undefined : actor.id,
      shieldedBy: shield?.nick,
    };

    // POSSUIR apenas é anulada, não refletida
    if (action.type === "POSSUIR") {
      messages.push(
        createActionMessage(processedAction, "ACTION_ANULLED", players)
      );
      return { processedAction, updatedPlayers, messages };
    }

    // Aplicar a ação refletida no atacante
    switch (action.type) {
      case "ASSASSINAR":
        updatedPlayers = eliminatePlayer(
          updatedPlayers,
          actor.id,
          "Morte refletida pelo Escudeiro"
        );
        break;
      case "SILENCIAR":
        updatedPlayers = updatedPlayers.map((p) =>
          p.id === actor.id ? { ...p, meta: { ...p.meta, silenced: true } } : p
        );
        break;
      case "PARALISAR":
        updatedPlayers = updatedPlayers.map((p) =>
          p.id === actor.id ? { ...p, meta: { ...p.meta, paralyzed: true } } : p
        );
        break;
      case "EXECUTAR":
        updatedPlayers = eliminatePlayer(
          updatedPlayers,
          actor.id,
          "Execução refletida pelo Escudeiro"
        );
        break;
      case "PROTEGER":
        // Anjo tentou proteger alguém, mas a proteção é refletida para o próprio Anjo
        updatedPlayers = updatedPlayers.map((p) =>
          p.id === actor.id ? { ...p, meta: { ...p.meta, protected: true } } : p
        );
        break;
      case "INVESTIGAR":
        // Detetive tentou investigar, mas investiga a si mesmo
        // (Na prática, ele já conhece seu próprio cargo, então não há efeito mecânico)
        break;
      case "FOTOGRAFAR":
        // Paparazzi tentou fotografar, mas fotografa a si mesmo
        // (Revela seu próprio cargo publicamente)
        break;
      case "PRENDER":
        // Policial tentou prender, mas prende a si mesmo
        updatedPlayers = updatedPlayers.map((p) =>
          p.id === actor.id
            ? { ...p, meta: { ...p.meta, imprisoned: true } }
            : p
        );
        break;
      case "FADAR":
      case "PSICOPATIZAR":
        // Efeitos especiais também são refletidos
        updatedPlayers = updatedPlayers.map((p) =>
          p.id === actor.id
            ? { ...p, meta: { ...p.meta, [action.type.toLowerCase()]: true } }
            : p
        );

        // Criar ação refletida para gerar mensagem de dado
        const reflectedAction: Action = {
          ...action,
          targetId: actor.id,
          targetRole: actor.role,
        };
        messages.push(createDiceRequiredMessage(reflectedAction));
        break;
    }

    // Criar mensagem descritiva da reflexão
    const timestamp = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const actionName = getActionName(action.type);
    const requiresDice = ["FADAR", "PSICOPATIZAR"].includes(action.type);

    let reflectionText = `[${timestamp}] ⚡ REFLEXÃO DO ESCUDEIRO — ${actor.role} (${actor.nick}) tentou ${actionName} contra ${target.nick}, mas ${target.nick} estava protegido pelo Escudeiro (${shield?.nick}). `;

    if (requiresDice) {
      reflectionText += `${actionName} refletida de volta para ${actor.nick}! (Aguardando resultado do dado)`;
    } else {
      const actionResult = getActionDescription(action.type);
      reflectionText += `${actionResult} refletida de volta para ${actor.nick}!`;
    }

    const reflectionMessage: Message = {
      id: `reflection-${Date.now()}`,
      createdAt: Date.now(),
      level: "ELIMINATION",
      text: reflectionText,
    };

    messages.push(reflectionMessage);
    return { processedAction, updatedPlayers, messages };
  }

  // Proteção do Anjo - simplesmente anula ações hostis (apenas se não houve proteção do Escudeiro)
  if (angelProtections.length > 0 && isHostileAction(action.type)) {
    processedAction.status = "ANULLED";
    processedAction.meta = {
      ...processedAction.meta,
      reason: "Alvo protegido pelo Anjo",
    };
    messages.push(
      createActionMessage(processedAction, "ACTION_ANULLED", players)
    );
    return { processedAction, updatedPlayers, messages };
  }

  // Executar ação baseada no tipo
  switch (action.type) {
    case "ASSASSINAR":
      updatedPlayers = eliminatePlayer(
        updatedPlayers,
        target.id,
        "Assassinato"
      );
      messages.push(createActionMessage(action, "ACTION_VALID", players));
      break;

    case "EXECUTAR":
      // Juiz executa alguém (ação especial)
      updatedPlayers = eliminatePlayer(
        updatedPlayers,
        target.id,
        "Execução pelo Juiz"
      );
      messages.push(createActionMessage(action, "ACTION_VALID", players));
      break;

    case "PRENDER":
      // Policial prende alguém por uma noite
      updatedPlayers = updatedPlayers.map((p) =>
        p.id === target.id ? { ...p, meta: { ...p.meta, imprisoned: true } } : p
      );
      messages.push(createActionMessage(action, "ACTION_VALID", players));
      break;

    case "SILENCIAR":
      // Silenciador impede alvo de agir, votar e falar
      updatedPlayers = updatedPlayers.map((p) =>
        p.id === target.id ? { ...p, meta: { ...p.meta, silenced: true } } : p
      );
      messages.push(createActionMessage(action, "ACTION_VALID", players));
      break;

    case "PARALISAR":
      // Paralisador impede alvo de agir e votar
      updatedPlayers = updatedPlayers.map((p) =>
        p.id === target.id ? { ...p, meta: { ...p.meta, paralyzed: true } } : p
      );
      messages.push(createActionMessage(action, "ACTION_VALID", players));
      break;

    case "PROTEGER":
    case "DEFENDER":
      messages.push(createActionMessage(action, "ACTION_VALID", players));
      break;

    case "INVESTIGAR":
      messages.push(createInvestigationMessage(action, target));
      break;

    case "FOTOGRAFAR":
      messages.push(createPhotoMessage(action, target));
      break;

    case "POSSUIR":
      // Demônio assume o cargo do alvo na próxima noite
      updatedPlayers = updatedPlayers.map((p) =>
        p.id === actor.id
          ? { ...p, meta: { ...p.meta, possessedRole: target.role } }
          : p
      );
      messages.push(createActionMessage(action, "ACTION_VALID", players));
      break;

    case "FADAR":
    case "PSICOPATIZAR":
      // Requer input de dado
      messages.push(createDiceRequiredMessage(action));
      break;

    default:
      messages.push(createActionMessage(action, "ACTION_VALID", players));
  }

  return { processedAction, updatedPlayers, messages };
}

/**
 * Verifica se uma ação é hostil
 */
function isHostileAction(actionType: ActionType): boolean {
  return [
    "ASSASSINAR",
    "SILENCIAR",
    "PARALISAR",
    "POSSUIR",
    "EXECUTAR",
    "FADAR",
    "PSICOPATIZAR",
  ].includes(actionType);
}

/**
 * Elimina um jogador
 */
export function eliminatePlayer(
  players: Player[],
  playerId: string,
  _reason: string
): Player[] {
  return players.map((player) =>
    player.id === playerId ? { ...player, alive: false } : player
  );
}

/**
 * Processa eliminações especiais
 */
export function processSpecialElimination(
  players: Player[],
  eliminatedPlayer: Player,
  reason: string,
  meta?: {
    explosionTargets?: string[];
    revengeTargetId?: string;
  }
): { updatedPlayers: Player[]; messages: Message[] } {
  let updatedPlayers = [...players];
  const messages: Message[] = [];

  // Eliminar o jogador principal
  updatedPlayers = eliminatePlayer(updatedPlayers, eliminatedPlayer.id, reason);

  messages.push({
    id: uuidv4(),
    createdAt: Date.now(),
    level: "ELIMINATION",
    text: `${eliminatedPlayer.nick} (${eliminatedPlayer.role}) foi eliminado - ${reason}`,
  });

  // Processar efeitos especiais baseados no cargo
  switch (eliminatedPlayer.role) {
    case "Homem-bomba":
      if (meta?.explosionTargets) {
        for (const targetId of meta.explosionTargets) {
          updatedPlayers = eliminatePlayer(
            updatedPlayers,
            targetId,
            "Explosão"
          );
          const victim = players.find((p) => p.id === targetId);
          if (victim) {
            messages.push({
              id: uuidv4(),
              createdAt: Date.now(),
              level: "ELIMINATION",
              text: `${victim.nick} (${victim.role}) foi eliminado pela explosão de ${eliminatedPlayer.nick}`,
            });
          }
        }
      }
      break;

    case "Espírito Vingativo":
      if (meta?.revengeTargetId) {
        updatedPlayers = eliminatePlayer(
          updatedPlayers,
          meta.revengeTargetId,
          "Vingança"
        );
        const victim = players.find((p) => p.id === meta.revengeTargetId);
        if (victim) {
          messages.push({
            id: uuidv4(),
            createdAt: Date.now(),
            level: "ELIMINATION",
            text: `${victim.nick} (${victim.role}) foi eliminado pela vingança de ${eliminatedPlayer.nick}`,
          });
        }
      }
      break;

    case "Assassino":
      // Transferir poder para Aprendiz se houver
      const apprentice = updatedPlayers.find(
        (p) => p.role === "Aprendiz" && p.alive
      );
      if (apprentice) {
        updatedPlayers = updatedPlayers.map((p) =>
          p.id === apprentice.id
            ? { ...p, meta: { ...p.meta, hasAssassinPower: true } }
            : p
        );

        messages.push({
          id: uuidv4(),
          createdAt: Date.now(),
          level: "INFO",
          text: `${apprentice.nick} (Aprendiz) herdou o poder de assassinato`,
        });
      }
      break;
  }

  return { updatedPlayers, messages };
}

/**
 * Contabiliza votos
 */
export function tallyVotes(
  votes: Record<string, number>,
  players: Player[]
): VoteResult {
  if (Object.keys(votes).length === 0) {
    return { outcome: "NONE", players: [] };
  }

  // Encontrar maior número de votos
  const maxVotes = Math.max(...Object.values(votes));
  const playersWithMaxVotes = Object.entries(votes)
    .filter(([_playerId, voteCount]) => voteCount === maxVotes)
    .map(([playerId, _voteCount]) => players.find((p) => p.id === playerId)!)
    .filter(Boolean);

  if (playersWithMaxVotes.length === 1) {
    return {
      outcome: "ELIMINATED",
      players: playersWithMaxVotes,
    };
  } else if (playersWithMaxVotes.length > 1) {
    return {
      outcome: "TIE",
      players: [],
      tied: playersWithMaxVotes,
    };
  }

  return { outcome: "NONE", players: [] };
}

/**
 * Calcula estatísticas do jogo
 */
export function calculateTeamStats(players: Player[]): {
  civilPercentage: number;
  mafiaPercentage: number;
  aliveCount: number;
} {
  const alivePlayers = players.filter((p) => p.alive);
  const aliveCount = alivePlayers.length;

  if (aliveCount === 0) {
    return { civilPercentage: 0, mafiaPercentage: 0, aliveCount: 0 };
  }

  const civilCount = alivePlayers.filter((p) => p.team === "CIVIL").length;
  const mafiaCount = alivePlayers.filter((p) => p.team === "MAFIA").length;

  return {
    civilPercentage: Math.round((civilCount / aliveCount) * 100),
    mafiaPercentage: Math.round((mafiaCount / aliveCount) * 100),
    aliveCount,
  };
}

/**
 * Verifica condições de vitória
 */
export function checkWinConditions(players: Player[]): {
  gameOver: boolean;
  winningTeam?: Team;
  reason: string;
} {
  const alivePlayers = players.filter((p) => p.alive);
  const aliveCount = alivePlayers.length;

  if (aliveCount === 0) {
    return { gameOver: true, reason: "Todos os jogadores foram eliminados" };
  }

  const civilCount = alivePlayers.filter((p) => p.team === "CIVIL").length;
  const mafiaCount = alivePlayers.filter((p) => p.team === "MAFIA").length;

  // Um time foi completamente eliminado
  if (civilCount === 0) {
    return {
      gameOver: true,
      winningTeam: "MAFIA",
      reason: "Todos os civis foram eliminados",
    };
  }

  if (mafiaCount === 0) {
    return {
      gameOver: true,
      winningTeam: "CIVIL",
      reason: "Toda a máfia foi eliminada",
    };
  }

  // Verificar >70%
  const civilPercentage = (civilCount / aliveCount) * 100;
  const mafiaPercentage = (mafiaCount / aliveCount) * 100;

  if (civilPercentage > 70) {
    return {
      gameOver: true,
      winningTeam: "CIVIL",
      reason: "Civis representam mais de 70% dos jogadores",
    };
  }

  if (mafiaPercentage > 70) {
    return {
      gameOver: true,
      winningTeam: "MAFIA",
      reason: "Máfia representa mais de 70% dos jogadores",
    };
  }

  return { gameOver: false, reason: "Jogo continua" };
}

/**
 * Exporta estado do jogo
 */
export function exportGameState(gameState: Record<string, unknown>): string {
  return JSON.stringify(gameState, null, 2);
}

/**
 * Importa estado do jogo
 */
export function importGameState(jsonString: string): Record<string, unknown> {
  try {
    return JSON.parse(jsonString);
  } catch (_error) {
    throw new Error("Formato JSON inválido");
  }
}

// === Funções auxiliares para mensagens ===

function createActionMessage(
  action: Action,
  level: "ACTION_VALID" | "ACTION_ANULLED",
  players?: Player[]
): Message {
  const timestamp = new Date(action.timestamp).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  let actorInfo: string = action.actorRole;
  let targetInfo: string = action.targetRole || "Alvo";

  // Se temos informações dos jogadores, incluir nicks
  if (players) {
    const actor = players.find((p) => p.id === action.actorId);
    const target = players.find((p) => p.id === action.targetId);

    if (actor) {
      actorInfo = `${action.actorRole} (${actor.nick})`;
    }
    if (target) {
      targetInfo = `${target.nick} (${action.targetRole})`;
    }
  }

  let text: string;

  if (level === "ACTION_ANULLED") {
    text = `[${timestamp}] AÇÃO ANULADA — ${actorInfo} → ${targetInfo} — Motivo: ${
      action.meta?.reason || "Desconhecido"
    }`;

    // Informações especiais para ações refletidas
    if (action.meta?.reflectedTo) {
      text += ` — Ação refletida de volta!`;
    }
  } else {
    text = `[${timestamp}] AÇÃO EXECUTADA — ${actorInfo} → ${getActionName(
      action.type
    )} → ${targetInfo}`;

    // Destacar quando há ação contra Policial
    if (action.targetRole === "Policial") {
      text += ` ⚠️ [ALERTA: AÇÃO CONTRA POLICIAL]`;
    }
  }

  return {
    id: uuidv4(),
    createdAt: action.timestamp,
    level,
    text,
  };
}

function createInvestigationMessage(action: Action, target: Player): Message {
  const timestamp = new Date(action.timestamp).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    id: uuidv4(),
    createdAt: action.timestamp,
    level: "NEUTRAL",
    text: `[${timestamp}] INVESTIGAÇÃO — ${action.actorRole} investigou ${target.nick}: ${target.role}`,
  };
}

function createPhotoMessage(action: Action, target: Player): Message {
  const timestamp = new Date(action.timestamp).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    id: uuidv4(),
    createdAt: action.timestamp,
    level: "NEUTRAL",
    text: `[${timestamp}] FOTOGRAFIA — ${target.nick} foi fotografado: ${target.role}`,
  };
}

function createDiceRequiredMessage(action: Action): Message {
  const timestamp = new Date(action.timestamp).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    id: uuidv4(),
    createdAt: action.timestamp,
    level: "INFO",
    text: `[${timestamp}] AÇÃO PENDENTE — ${action.actorRole} (aguarda resultado do dado)`,
  };
}

function getActionDescription(actionType: ActionType): string {
  const descriptions: Record<ActionType, string> = {
    ASSASSINAR: "Assassinato executado",
    SILENCIAR: "Jogador silenciado",
    PARALISAR: "Jogador paralisado",
    PROTEGER: "Proteção ativada",
    INVESTIGAR: "Investigação realizada",
    FOTOGRAFAR: "Fotografia tirada",
    POSSUIR: "Possessão realizada",
    DEFENDER: "Defesa ativada",
    EXECUTAR: "Execução realizada",
    PRENDER: "Jogador preso",
    FADAR: "Fada aplicada",
    PSICOPATIZAR: "Psicopatia aplicada",
  };

  return descriptions[actionType] || "Ação executada";
}

function getActionName(actionType: ActionType): string {
  const names: Record<ActionType, string> = {
    ASSASSINAR: "ASSASSINAR",
    SILENCIAR: "SILENCIAR",
    PARALISAR: "PARALISAR",
    PROTEGER: "PROTEGER",
    INVESTIGAR: "INVESTIGAR",
    FOTOGRAFAR: "FOTOGRAFAR",
    POSSUIR: "POSSUIR",
    DEFENDER: "DEFENDER",
    EXECUTAR: "EXECUTAR",
    PRENDER: "PRENDER",
    FADAR: "FADAR",
    PSICOPATIZAR: "PSICOPATIZAR",
  };

  return names[actionType] || actionType;
}

/**
 * Obtém a ação padrão de um cargo (sobrecarga para Role)
 */
export function getRoleAction(role: Role): ActionType | null;
/**
 * Obtém a ação padrão de um jogador (considerando Coringa)
 */
export function getRoleAction(player: Player): ActionType | null;
export function getRoleAction(roleOrPlayer: Role | Player): ActionType | null {
  const roleActions: Partial<Record<Role, ActionType>> = {
    // Civis
    Juiz: "EXECUTAR", // Durante a noite pode executar alguém uma vez só durante toda partida
    Policial: "PRENDER", // Durante a noite pode prender alguém por uma noite (uma vez por partida)
    Anjo: "PROTEGER", // Durante a noite pode proteger alguém toda noite, exceto a si mesmo
    Detetive: "INVESTIGAR", // Durante a noite pode descobrir secretamente o cargo de um jogador
    Fada: "FADAR", // Durante a noite tem o poder de "fadar" alguém através do dado
    Escudeiro: "DEFENDER", // Durante a noite pode proteger alguém refletindo as ações
    // Aldeão: sem ação noturna, mas voto vale 3
    // Espírito Vingativo: ação especial só ao morrer

    // Máfias
    Assassino: "ASSASSINAR", // Durante a noite tem o poder de assassinar alguém toda noite
    Aprendiz: "ASSASSINAR", // Durante a noite (só se tiver herdado o poder após morte do Assassino)
    Silenciador: "SILENCIAR", // Durante a noite pode silenciar alguém toda noite
    Paralisador: "PARALISAR", // Durante a noite pode paralisar alguém toda noite
    // Bruxa: sem ação durante a noite (feitiço é configurado no início)
    Paparazzi: "FOTOGRAFAR", // Durante a noite fotografa alguém toda noite, revelando o cargo
    Psicopata: "PSICOPATIZAR", // Durante a noite tem o poder de "psicopatiar" alguém
    Demônio: "POSSUIR", // Durante a noite pode possuir alguém e exercer o cargo na próxima noite
    // Homem-bomba: ação especial só ao morrer
  };

  // Se é um Player, verificar se é Coringa transformado
  if (typeof roleOrPlayer === "object" && "id" in roleOrPlayer) {
    const player = roleOrPlayer as Player;
    // Se é um Coringa que já foi transformado, usar o cargo atual
    if (player.originalRole === "Coringa" && player.role) {
      return roleActions[player.role] || null;
    }
    // Caso contrário, usar o cargo atual normalmente
    return player.role ? roleActions[player.role] || null : null;
  }

  // Se é apenas um Role, usar normalmente (Coringa sem dado ainda não tem ação)
  const role = roleOrPlayer as Role;
  return roleActions[role] || null;
}
/**
 * Verifica se um cargo tem ação noturna (sobrecarga para Role)
 */
export function roleHasNightAction(role: Role): boolean;
/**
 * Verifica se um jogador tem ação noturna (considerando Coringa)
 */
export function roleHasNightAction(player: Player): boolean;
export function roleHasNightAction(roleOrPlayer: Role | Player): boolean {
  // Type guard para distinguir entre Player e Role
  if (typeof roleOrPlayer === "object" && "id" in roleOrPlayer) {
    return getRoleAction(roleOrPlayer as Player) !== null;
  } else {
    return getRoleAction(roleOrPlayer as Role) !== null;
  }
}

/**
 * Processa o resultado de um dado para ações especiais (FADAR, PSICOPATIZAR)
 */
export function processDiceAction(
  action: Action,
  diceValue: number,
  players: Player[]
): {
  updatedPlayers: Player[];
  messages: Message[];
} {
  let updatedPlayers = [...players];
  const messages: Message[] = [];

  const target = players.find((p) => p.id === action.targetId);
  const actor = players.find((p) => p.id === action.actorId);

  if (!target || !actor) {
    return { updatedPlayers, messages };
  }

  const timestamp = new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  switch (action.type) {
    case "FADAR":
      const fadaEffects = {
        1: "PARALISAR",
        2: "FOTOGRAFAR",
        3: "ASSASSINAR",
        4: "SILENCIAR",
        5: "INVESTIGAR",
        6: "ASSASSINAR",
      } as const;

      const effect = fadaEffects[diceValue as keyof typeof fadaEffects];

      if (effect === "ASSASSINAR") {
        updatedPlayers = eliminatePlayer(
          updatedPlayers,
          target.id,
          "Eliminado pela Fada"
        );
        messages.push({
          id: uuidv4(),
          createdAt: Date.now(),
          level: "ELIMINATION",
          text: `[${timestamp}] 🧚‍♀️ FADA — ${target.nick} (${target.role}) foi eliminado pela magia da Fada (dado: ${diceValue})`,
        });
      } else {
        // Aplicar outros efeitos
        if (effect === "PARALISAR") {
          updatedPlayers = updatedPlayers.map((p) =>
            p.id === target.id
              ? { ...p, meta: { ...p.meta, paralyzed: true } }
              : p
          );
        } else if (effect === "SILENCIAR") {
          updatedPlayers = updatedPlayers.map((p) =>
            p.id === target.id
              ? { ...p, meta: { ...p.meta, silenced: true } }
              : p
          );
        }

        const effectNames = {
          PARALISAR: "paralisado",
          FOTOGRAFAR: "fotografado",
          SILENCIAR: "silenciado",
          INVESTIGAR: "investigado",
        };

        messages.push({
          id: uuidv4(),
          createdAt: Date.now(),
          level: "NEUTRAL",
          text: `[${timestamp}] 🧚‍♀️ FADA — ${target.nick} (${target.role}) foi ${
            effectNames[effect as keyof typeof effectNames]
          } pela magia da Fada (dado: ${diceValue})`,
        });
      }
      break;

    case "PSICOPATIZAR":
      const isEliminated = [1, 3, 5].includes(diceValue);

      if (isEliminated) {
        updatedPlayers = eliminatePlayer(
          updatedPlayers,
          target.id,
          "Eliminado pelo Psicopata"
        );
        messages.push({
          id: uuidv4(),
          createdAt: Date.now(),
          level: "ELIMINATION",
          text: `[${timestamp}] 🔪 PSICOPATA — ${target.nick} (${target.role}) foi eliminado por ter sido psicopatizado pelo Psicopata (dado: ${diceValue})`,
        });
      } else {
        messages.push({
          id: uuidv4(),
          createdAt: Date.now(),
          level: "NEUTRAL",
          text: `[${timestamp}] 🔪 PSICOPATA — ${target.nick} (${target.role}) sobreviveu após ter sido psicopatizado pelo Psicopata (dado: ${diceValue})`,
        });
      }
      break;
  }

  return { updatedPlayers, messages };
}

/**
 * Verifica se existem ações pendentes que requerem dados
 */
export function getPendingDiceActions(actions: Action[]): Action[] {
  return actions.filter(
    (action) =>
      (action.type === "FADAR" || action.type === "PSICOPATIZAR") &&
      action.status === "VALID" &&
      !action.meta?.diceProcessed
  );
}

/**
 * Processa o resultado da votação e elimina o jogador mais votado
 */
export function processVotingResult(
  players: Player[],
  votes: Record<string, number>
): {
  updatedPlayers: Player[];
  eliminatedPlayer: Player | null;
  messages: Message[];
  isTie: boolean;
  tiedPlayers: Player[];
} {
  const messages: Message[] = [];
  let updatedPlayers = [...players];
  let eliminatedPlayer: Player | null = null;
  let isTie = false;
  let tiedPlayers: Player[] = [];

  // Se não há votos, ninguém é eliminado
  if (Object.keys(votes).length === 0) {
    messages.push({
      id: uuidv4(),
      createdAt: Date.now(),
      level: "INFO",
      text: "[VOTAÇÃO] Nenhum voto foi registrado. Ninguém foi eliminado.",
    });
    return { updatedPlayers, eliminatedPlayer, messages, isTie, tiedPlayers };
  }

  // Encontrar o(s) jogador(es) com mais votos
  const maxVotes = Math.max(...Object.values(votes));
  const playersWithMaxVotes = Object.entries(votes)
    .filter(([, voteCount]) => voteCount === maxVotes)
    .map(([playerId]) => playerId);

  // Verificar empate
  if (playersWithMaxVotes.length > 1) {
    isTie = true;
    tiedPlayers = players.filter((p) => playersWithMaxVotes.includes(p.id));

    const tiedNames = tiedPlayers.map((p) => p.nick).join(", ");
    messages.push({
      id: uuidv4(),
      createdAt: Date.now(),
      level: "INFO",
      text: `[VOTAÇÃO] Houve empate entre: ${tiedNames} (${maxVotes} votos cada)`,
    });

    return { updatedPlayers, eliminatedPlayer, messages, isTie, tiedPlayers };
  }

  // Eliminar o jogador mais votado
  const eliminatedPlayerId = playersWithMaxVotes[0];
  eliminatedPlayer = players.find((p) => p.id === eliminatedPlayerId) || null;

  if (eliminatedPlayer) {
    const timestamp = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Eliminar o jogador
    updatedPlayers = eliminatePlayer(
      updatedPlayers,
      eliminatedPlayerId,
      "Eliminado por votação"
    );

    // Criar mensagem de eliminação
    messages.push({
      id: uuidv4(),
      createdAt: Date.now(),
      level: "ELIMINATION",
      text: `[${timestamp}] 🗳️ VOTAÇÃO — ${eliminatedPlayer.nick} (${eliminatedPlayer.role}) foi eliminado por votação com ${maxVotes} votos`,
    });

    // Processar eliminações especiais (Espírito Vingativo, Homem-bomba, etc.)
    const { updatedPlayers: playersAfterSpecial, messages: specialMessages } =
      processSpecialElimination(
        updatedPlayers,
        eliminatedPlayer,
        "Eliminado por votação",
        {}
      );

    updatedPlayers = playersAfterSpecial;
    messages.push(...specialMessages);
  }

  return { updatedPlayers, eliminatedPlayer, messages, isTie, tiedPlayers };
}

function canTargetSelf(role: Role): boolean {
  return ROLES_DATA[role].canTargetSelf || false;
}
