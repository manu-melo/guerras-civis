// src/lib/gameMachine.ts
import { createMachine, assign } from "xstate";
import {
  GameState,
  Player,
  Action,
  Message,
  GamePhase,
  Team,
} from "@/types/game";
import {
  assignRoles,
  processJokerDice,
  processNight,
  processDiceAction,
  getPendingDiceActions,
  processVotingResult,
  checkWinConditions,
} from "@/lib/gameEngine";
import { v4 as uuidv4 } from "uuid";

export interface GameContext extends GameState {}

export type GameEvent =
  | { type: "START_GAME"; hostNick: string; players: Player[] }
  | { type: "ASSIGN_ROLES" }
  | { type: "SET_JOKER_DICE"; value: number }
  | { type: "RECORD_ACTION"; action: Partial<Action> }
  | { type: "PROCESS_NIGHT" }
  | { type: "GO_TO_EVENTS" }
  | { type: "GO_TO_DAY" }
  | { type: "PROCESS_DICE"; actionId: string; diceValue: number }
  | { type: "START_VOTING" }
  | { type: "REGISTER_VOTE"; playerId: string; targetId: string; votes: number }
  | { type: "END_VOTING" }
  | { type: "PROCESS_VOTING_RESULT"; result: any }
  | { type: "GO_TO_NEXT_NIGHT" }
  | { type: "ELIMINATE_PLAYER"; playerId: string; reason?: string }
  | { type: "END_GAME"; winningTeam?: Team }
  | { type: "RESET_GAME" }
  | { type: "ENABLE_PIP" }
  | { type: "ADD_MESSAGE"; message: Omit<Message, "id" | "createdAt"> };

const createInitialContext = (): GameContext => ({
  phase: "SETUP",
  round: 0,
  hostNick: "",
  players: [],
  actions: [],
  messages: [],
  votes: {},
  isVotingActive: false,
  gameStarted: false,
  civilPercentage: 50,
  mafiaPercentage: 50,
  isPiPEnabled: false,
});

export const gameMachine = createMachine(
  {
    id: "guerrasCivis",
    initial: "setup",
    context: createInitialContext(),
    states: {
      setup: {
        on: {
          START_GAME: {
            target: "roleAssignment",
            actions: assign({
              hostNick: ({ event }) => event.hostNick,
              players: ({ event }) => event.players,
              gameStarted: () => true,
              round: () => 1,
            }),
          },
        },
      },

      roleAssignment: {
        entry: assign({
          phase: () => "SETUP" as GamePhase,
        }),
        on: {
          ASSIGN_ROLES: {
            target: "checkJoker",
            actions: "assignRolesToPlayers",
          },
        },
      },

      checkJoker: {
        always: [
          {
            target: "jokerDice",
            guard: "hasJokerPlayer",
          },
          {
            target: "night",
          },
        ],
      },

      jokerDice: {
        on: {
          SET_JOKER_DICE: {
            target: "night",
            actions: "processJokerDice",
          },
        },
      },

      night: {
        entry: assign({
          phase: () => "NIGHT" as GamePhase,
          actions: () => [], // Limpar ações da noite anterior
        }),
        on: {
          RECORD_ACTION: {
            actions: "recordNightAction",
          },
          GO_TO_EVENTS: {
            target: "events",
            actions: "processNightActions",
          },
        },
      },

      events: {
        entry: assign({
          phase: () => "EVENTS" as GamePhase,
        }),
        on: {
          GO_TO_DAY: {
            target: "day",
          },
        },
      },

      day: {
        entry: assign({
          phase: () => "DAY" as GamePhase,
        }),
        on: {
          PROCESS_DICE: {
            actions: "processDiceAction",
          },
          START_VOTING: {
            target: "voting",
          },
        },
      },

      voting: {
        entry: assign({
          phase: () => "VOTING" as GamePhase,
          isVotingActive: () => true,
          votes: () => ({}),
        }),
        on: {
          REGISTER_VOTE: {
            actions: "registerVote",
          },
          END_VOTING: [
            {
              target: "#guerrasCivis.gameOver",
              guard: "isGameOverAfterVoting",
              actions: ["processElimination"],
            },
            {
              target: "night",
              actions: ["processElimination", "incrementRound"],
            },
          ],
        },
      },

      gameOver: {
        entry: assign({
          phase: () => "GAME_OVER" as GamePhase,
        }),
        on: {
          RESET_GAME: {
            target: "setup",
            actions: assign(createInitialContext()),
          },
        },
      },
    },

    on: {
      ELIMINATE_PLAYER: {
        actions: "eliminatePlayer",
      },
      END_GAME: {
        target: "#guerrasCivis.gameOver",
        actions: assign({
          winningTeam: ({ event }) => event.winningTeam,
        }),
      },
      ENABLE_PIP: {
        actions: assign({
          isPiPEnabled: () => true,
        }),
      },
      ADD_MESSAGE: {
        actions: "addMessage",
      },
    },
  },
  {
    actions: {
      assignRolesToPlayers: assign({
        players: ({ context }) => {
          try {
            return assignRoles(context.players);
          } catch (error) {
            console.error("Erro ao distribuir cargos:", error);
            return context.players;
          }
        },
        civilPercentage: ({ context }) => {
          try {
            const playersWithRoles = assignRoles(context.players);
            const civilCount = playersWithRoles.filter(
              (p) => p.team === "CIVIL"
            ).length;
            return Math.round((civilCount / playersWithRoles.length) * 100);
          } catch (error) {
            return 50;
          }
        },
        mafiaPercentage: ({ context }) => {
          try {
            const playersWithRoles = assignRoles(context.players);
            const mafiaCount = playersWithRoles.filter(
              (p) => p.team === "MAFIA"
            ).length;
            return Math.round((mafiaCount / playersWithRoles.length) * 100);
          } catch (error) {
            return 50;
          }
        },
      }),

      processJokerDice: assign({
        players: ({ context, event }) => {
          if (event.type !== "SET_JOKER_DICE") return context.players;
          try {
            return processJokerDice(context.players, event.value);
          } catch (error) {
            console.error("Erro ao processar dado do Coringa:", error);
            return context.players;
          }
        },
      }),

      processDiceAction: assign({
        players: ({ context, event }) => {
          if (event.type !== "PROCESS_DICE") return context.players;

          const action = context.actions.find((a) => a.id === event.actionId);
          if (!action) return context.players;

          try {
            const { updatedPlayers } = processDiceAction(
              action,
              event.diceValue,
              context.players
            );
            return updatedPlayers;
          } catch (error) {
            console.error("Erro ao processar dado da ação:", error);
            return context.players;
          }
        },
        actions: ({ context, event }) => {
          if (event.type !== "PROCESS_DICE") return context.actions;

          // Marcar a ação como processada
          return context.actions.map((action) =>
            action.id === event.actionId
              ? { ...action, meta: { ...action.meta, diceProcessed: true } }
              : action
          );
        },
        messages: ({ context, event }) => {
          if (event.type !== "PROCESS_DICE") return context.messages;

          const action = context.actions.find((a) => a.id === event.actionId);
          if (!action) return context.messages;

          try {
            const { messages } = processDiceAction(
              action,
              event.diceValue,
              context.players
            );
            return [...context.messages, ...messages];
          } catch (error) {
            console.error("Erro ao processar dado da ação:", error);
            return context.messages;
          }
        },
      }),

      recordNightAction: assign({
        actions: ({ context, event }) => {
          if (event.type !== "RECORD_ACTION") return context.actions;

          const newAction: Action = {
            id: uuidv4(),
            actorId: event.action.actorId!,
            actorRole: event.action.actorRole!,
            targetId: event.action.targetId!,
            targetRole: event.action.targetRole,
            type: event.action.type!,
            timestamp: Date.now(),
            status: "VALID",
            order: context.actions.length + 1,
            meta: event.action.meta,
          };

          return [...context.actions, newAction];
        },
        messages: ({ context, event }) => {
          if (event.type !== "RECORD_ACTION") return context.messages;

          // Encontrar informações dos jogadores
          const actor = context.players.find(
            (p) => p.id === event.action.actorId
          );
          const target = context.players.find(
            (p) => p.id === event.action.targetId
          );

          if (!actor || !target) return context.messages;

          // Criar mensagem imediata da ação
          const timestamp = new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          });

          const newMessage: Message = {
            id: uuidv4(),
            createdAt: Date.now(),
            level: "ACTION_VALID",
            text: `[${timestamp}] AÇÃO REGISTRADA — ${actor.role} (${actor.nick}) → ${event.action.type} → ${target.nick} (aguarda processamento)`,
          };

          return [...context.messages, newMessage];
        },
      }),

      processNightActions: assign({
        actions: ({ context }) => {
          // Processar ações da noite (validações, anulações, etc.)
          const result = processNight(context.actions, context.players);
          return result.processedActions;
        },
        messages: ({ context }) => {
          // Gerar mensagens dos acontecimentos
          const result = processNight(context.actions, context.players);
          return [...context.messages, ...result.messages];
        },
        players: ({ context }) => {
          // Atualizar jogadores com base nos resultados da noite
          const result = processNight(context.actions, context.players);
          return result.updatedPlayers;
        },
      }),

      registerVote: assign({
        votes: ({ context, event }) => {
          if (event.type !== "REGISTER_VOTE") return context.votes;

          return {
            ...context.votes,
            [event.targetId]:
              (context.votes[event.targetId] || 0) + event.votes,
          };
        },
      }),

      processElimination: assign({
        players: ({ context }) => {
          try {
            const { updatedPlayers } = processVotingResult(
              context.players,
              context.votes
            );
            return updatedPlayers;
          } catch (error) {
            console.error("Erro ao processar eliminação:", error);
            return context.players;
          }
        },
        messages: ({ context }) => {
          try {
            const { messages } = processVotingResult(
              context.players,
              context.votes
            );
            return [...context.messages, ...messages];
          } catch (error) {
            console.error("Erro ao processar mensagens de eliminação:", error);
            return context.messages;
          }
        },
        votes: () => ({}), // Limpar votos após processamento
        civilPercentage: ({ context }) => {
          try {
            const { updatedPlayers } = processVotingResult(
              context.players,
              context.votes
            );
            const alivePlayers = updatedPlayers.filter((p) => p.alive);
            const aliveCount = alivePlayers.length;
            if (aliveCount === 0) return 0;

            const civilCount = alivePlayers.filter(
              (p) => p.team === "CIVIL"
            ).length;
            return Math.round((civilCount / aliveCount) * 100);
          } catch (error) {
            console.error("Erro ao calcular porcentagem civil:", error);
            return context.civilPercentage;
          }
        },
        mafiaPercentage: ({ context }) => {
          try {
            const { updatedPlayers } = processVotingResult(
              context.players,
              context.votes
            );
            const alivePlayers = updatedPlayers.filter((p) => p.alive);
            const aliveCount = alivePlayers.length;
            if (aliveCount === 0) return 0;

            const mafiaCount = alivePlayers.filter(
              (p) => p.team === "MAFIA"
            ).length;
            return Math.round((mafiaCount / aliveCount) * 100);
          } catch (error) {
            console.error("Erro ao calcular porcentagem máfia:", error);
            return context.mafiaPercentage;
          }
        },
      }),

      eliminatePlayer: assign({
        players: ({ context, event }) => {
          if (event.type !== "ELIMINATE_PLAYER") return context.players;

          return context.players.map((player) =>
            player.id === event.playerId ? { ...player, alive: false } : player
          );
        },
      }),

      incrementRound: assign({
        round: ({ context }) => context.round + 1,
      }),

      addMessage: assign({
        messages: ({ context, event }) => {
          if (event.type !== "ADD_MESSAGE") return context.messages;

          const newMessage: Message = {
            id: uuidv4(),
            createdAt: Date.now(),
            ...event.message,
          };

          return [...context.messages, newMessage];
        },
      }),
    },

    guards: {
      hasJokerPlayer: ({ context }) => {
        return context.players.some((player) => player.role === "Coringa");
      },

      isGameOver: ({ context }) => {
        const alivePlayers = context.players.filter((p) => p.alive);
        const aliveCount = alivePlayers.length;

        if (aliveCount === 0) return true;

        const civilCount = alivePlayers.filter(
          (p) => p.team === "CIVIL"
        ).length;
        const mafiaCount = alivePlayers.filter(
          (p) => p.team === "MAFIA"
        ).length;

        // Verificar se um time foi completamente eliminado
        if (civilCount === 0 || mafiaCount === 0) return true;

        // Verificar se algum time tem >70% dos jogadores
        const civilPercentage = (civilCount / aliveCount) * 100;
        const mafiaPercentage = (mafiaCount / aliveCount) * 100;

        return civilPercentage > 70 || mafiaPercentage > 70;
      },

      isGameOverAfterVoting: ({ context }) => {
        try {
          const { updatedPlayers } = processVotingResult(
            context.players,
            context.votes
          );
          const winConditions = checkWinConditions(updatedPlayers);
          return winConditions.gameOver;
        } catch (error) {
          console.error("Erro ao verificar fim do jogo após votação:", error);
          return false;
        }
      },
    },
  }
);
