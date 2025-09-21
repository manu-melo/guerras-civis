// src/lib/roles.ts
import { Role, RoleData, Team } from "@/types/game";

export const ROLES_DATA: Record<Role, RoleData> = {
  // === CIVIS ===
  Juiz: {
    name: "Juiz",
    team: "CIVIL",
    description:
      "Durante a noite pode executar alguém uma vez só durante toda partida, se executar Assassino ou Aprendiz, pode executar novamente até que não seja assassino ou aprendiz o alvo, também executa mais uma vez após a morte do Policial.",
    nightAction: true,
  },
  Policial: {
    name: "Policial",
    team: "CIVIL",
    description:
      "Durante a noite pode prender um jogador, impedindo-o de agir naquela noite.",
    nightAction: true,
  },
  Anjo: {
    name: "Anjo",
    team: "CIVIL",
    description:
      "Durante a noite pode proteger um jogador (inclusive a si mesmo) contra qualquer ação hostil.",
    nightAction: true,
    canTargetSelf: true,
  },
  Detetive: {
    name: "Detetive",
    team: "CIVIL",
    description:
      "Durante a noite pode investigar um jogador e descobrir seu cargo.",
    nightAction: true,
  },
  Aldeão: {
    name: "Aldeão",
    team: "CIVIL",
    description:
      "Representa o povo. Seu voto vale 3 pontos durante as votações.",
    nightAction: false,
  },
  Fada: {
    name: "Fada",
    team: "CIVIL",
    description:
      "Durante a noite pode usar magia. O efeito depende do resultado de um dado (1-6): pode curar, proteger ou eliminar.",
    nightAction: true,
    canTargetSelf: true,
  },
  "Espírito Vingativo": {
    name: "Espírito Vingativo",
    team: "CIVIL",
    description:
      "Ao morrer, pode escolher um jogador para eliminar junto (exceto se for o último sobrevivente do time).",
    nightAction: false,
  },
  Escudeiro: {
    name: "Escudeiro",
    team: "CIVIL",
    description:
      "Durante a noite pode defender um jogador, anulando qualquer ação contra ele.",
    nightAction: true,
  },
  Coringa: {
    name: "Coringa",
    team: "CIVIL",
    description:
      "No início da partida, um dado determina qual cargo ele assumirá (1-5). Continua sendo do time civil.",
    nightAction: false, // Depende do cargo assumido
  },

  // === MÁFIAS ===
  Assassino: {
    name: "Assassino",
    team: "MAFIA",
    description:
      "Durante a noite pode eliminar um jogador. Se morrer e houver Aprendiz vivo, passa o poder para ele.",
    nightAction: true,
  },
  Aprendiz: {
    name: "Aprendiz",
    team: "MAFIA",
    description:
      "Se o Assassino morrer, herda o poder de eliminar durante a noite.",
    nightAction: false, // Só após herdar o poder
  },
  Silenciador: {
    name: "Silenciador",
    team: "MAFIA",
    description:
      "Durante a noite pode silenciar um jogador, impedindo-o de falar no dia seguinte.",
    nightAction: true,
  },
  Paralisador: {
    name: "Paralisador",
    team: "MAFIA",
    description:
      "Durante a noite pode paralisar um jogador, impedindo-o de agir.",
    nightAction: true,
  },
  Bruxa: {
    name: "Bruxa",
    team: "MAFIA",
    description:
      "Tem o poder de criar um feitiço pelo wired, esse feitiço é basicamente uma proibição de falar a palavra determinada pela bruxa, ao iniciar a partida a bruxa será solicitada de repassar a palavra do feitiço para o host no Habbo.",
    nightAction: false, // Sem ação durante a noite
  },
  Paparazzi: {
    name: "Paparazzi",
    team: "MAFIA",
    description:
      "Durante a noite pode fotografar um jogador, revelando seu cargo para todos.",
    nightAction: true,
  },
  "Homem-bomba": {
    name: "Homem-bomba",
    team: "MAFIA",
    description:
      "Ao morrer, pode eliminar até 2 jogadores ao seu lado (esquerda/direita). Escolha é do host.",
    nightAction: false,
  },
  Psicopata: {
    name: "Psicopata",
    team: "MAFIA",
    description:
      "Durante a noite causa um acidente. O efeito depende do resultado de um dado (1-6).",
    nightAction: true,
  },
  Demônio: {
    name: "Demônio",
    team: "MAFIA",
    description:
      "Durante a noite pode possuir um jogador, assumindo seu cargo na próxima noite. Continua sendo máfia.",
    nightAction: true,
  },
};

// Função para obter cargos por time
export function getRolesByTeam(team: Team): Role[] {
  return Object.entries(ROLES_DATA)
    .filter(([_role, data]) => data.team === team)
    .map(([role, _data]) => role as Role);
}

// Função para verificar se cargo tem ação noturna
export function hasNightAction(role: Role): boolean {
  return ROLES_DATA[role].nightAction || false;
}

// Função para verificar se cargo pode se alvejar
export function canTargetSelf(role: Role): boolean {
  return ROLES_DATA[role].canTargetSelf || false;
}

// Cargos essenciais que devem sempre estar presentes
export const ESSENTIAL_ROLES: Partial<Record<Team, Role[]>> = {
  MAFIA: ["Assassino"], // Sempre ter pelo menos 1 Assassino
  CIVIL: [], // Nenhum cargo civil é obrigatório
};
