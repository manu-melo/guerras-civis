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
  processVotingResult,
  checkWinConditions,
  checkForBombExplosion,
  validateAction,
  getAngelProtectedPlayers,
} from "@/lib/gameEngine";
import { v4 as uuidv4 } from "uuid";

// Type alias for game context
export type GameContext = GameState;

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
  | { type: "REPEAT_VOTING" }
  | { type: "CONTINUE_TO_NIGHT" }
  | { type: "PROCESS_VOTING_RESULT"; result: Record<string, unknown> }
  | { type: "GO_TO_NEXT_NIGHT" }
  | { type: "ELIMINATE_PLAYER"; playerId: string; reason?: string }
  | { type: "PROCESS_SPIRIT_REVENGE"; targetId: string }
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
  tiedPlayers: [],
  eliminatedSpiritPlayer: undefined,
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
        entry: [
          assign({
            phase: () => "NIGHT" as GamePhase,
            actions: () => [], // Limpar ações da noite anterior
          }),
          "clearDayEffects",
        ],
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
          GO_TO_DAY: [
            {
              target: "bombExplosion",
              guard: "hasBombExplosion",
            },
            {
              target: "day",
            },
          ],
        },
      },

      day: {
        entry: [
          assign({
            phase: () => "DAY" as GamePhase,
          }),
          "addDayStatusMessage",
        ],
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
        entry: [
          assign({
            phase: () => "VOTING" as GamePhase,
            isVotingActive: () => true,
            votes: () => ({}),
            tiedPlayers: () => [], // Limpar jogadores empatados ao iniciar nova votação
          }),
          assign({
            messages: ({ context }) => {
              // ⚖️ AVISO: Verificar se há jogadores protegidos pelo Anjo
              const protectedPlayerIds = getAngelProtectedPlayers(
                context.actions
              );

              if (protectedPlayerIds.length === 0) {
                return context.messages; // Nenhum jogador protegido
              }

              // Criar mensagens para cada jogador protegido
              const timestamp = new Date().toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              });

              const protectionMessages = protectedPlayerIds.map(
                (playerId: string) => {
                  const protectedPlayer = context.players.find(
                    (p) => p.id === playerId
                  );
                  const playerName = protectedPlayer
                    ? protectedPlayer.nick
                    : `Jogador ${playerId}`;

                  return {
                    id: `angel-protection-${playerId}-${Date.now()}`,
                    createdAt: Date.now(),
                    level: "INFO" as const,
                    text: `[${timestamp}] 😇 ATENÇÃO: ${playerName} está protegido pelo Anjo e não pode ser votado`,
                  };
                }
              );

              return [...context.messages, ...protectionMessages];
            },
          }),
        ],
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
              target: "tieBreaker",
              guard: "hasVotingTie",
              actions: ["checkVotingTie"],
            },
            {
              target: "bombExplosion",
              guard: "eliminatedBombVoting",
              actions: ["processEliminationWithBomb"],
            },
            {
              target: "spiritRevenge",
              guard: "eliminatedSpiritVingativo",
              actions: ["processEliminationWithSpirit"],
            },
            {
              target: "night",
              actions: ["processElimination", "incrementRound"],
            },
          ],
        },
      },

      tieBreaker: {
        entry: assign({
          phase: () => "TIE_BREAKER" as GamePhase,
        }),
        on: {
          REPEAT_VOTING: {
            target: "tieVoting",
            actions: assign({
              votes: () => ({}),
              // Manter os jogadores empatados para a votação de desempate
              tiedPlayers: ({ context }) => context.tiedPlayers || [],
            }),
          },
          CONTINUE_TO_NIGHT: {
            target: "night",
            actions: ["incrementRound", "addNoEliminationMessage"],
          },
        },
      },

      tieVoting: {
        entry: assign({
          phase: () => "TIE_VOTING" as GamePhase,
          isVotingActive: () => true,
          // NÃO limpar votes aqui, já foi limpo na transição
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
              target: "tieBreaker",
              guard: "hasVotingTie",
              actions: ["checkVotingTie"],
            },
            {
              target: "bombExplosion",
              guard: "eliminatedBombVoting",
              actions: ["processEliminationWithBomb"],
            },
            {
              target: "spiritRevenge",
              guard: "eliminatedSpiritVingativo",
              actions: ["processEliminationWithSpirit"],
            },
            {
              target: "night",
              actions: ["processElimination", "incrementRound"],
            },
          ],
        },
      },

      spiritRevenge: {
        entry: assign({
          phase: () => "SPIRIT_REVENGE" as GamePhase,
        }),
        on: {
          PROCESS_SPIRIT_REVENGE: {
            target: "night",
            actions: ["processSpiritRevenge", "incrementRound"],
          },
        },
      },

      bombExplosion: {
        entry: assign({
          phase: () => "BOMB_EXPLOSION" as GamePhase,
        }),
        on: {
          PROCESS_BOMB_EXPLOSION: [
            {
              target: "#guerrasCivis.gameOver",
              guard: "isGameOverAfterBombExplosion",
              actions: ["processBombExplosion"],
            },
            {
              target: "spiritRevenge",
              guard: "eliminatedSpiritInBombExplosion",
              actions: ["processBombExplosionWithSpirit"],
            },
            {
              target: "night",
              actions: ["processBombExplosion", "incrementRound"],
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
            const playersWithRoles = assignRoles(context.players);

            // ⚖️ INICIALIZAR PONTOS DO JUIZ (1 ponto inicial)
            return playersWithRoles.map((player) => {
              if (player.role === "Juiz") {
                return {
                  ...player,
                  meta: {
                    ...player.meta,
                    judgePoints: 1, // Juiz começa com 1 ponto
                  },
                };
              }
              return player;
            });
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
          } catch (_error) {
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
          } catch (_error) {
            return 50;
          }
        },
      }),

      processJokerDice: assign({
        players: ({ context, event }) => {
          if (event.type !== "SET_JOKER_DICE") return context.players;
          try {
            const playersAfterDice = processJokerDice(
              context.players,
              event.value
            );

            // ⚖️ INICIALIZAR PONTOS DO JUIZ se Coringa virou Juiz
            return playersAfterDice.map((player) => {
              if (
                player.role === "Juiz" &&
                player.originalRole === "Coringa" &&
                player.meta?.judgePoints === undefined
              ) {
                return {
                  ...player,
                  meta: {
                    ...player.meta,
                    judgePoints: 1, // Coringa que virou Juiz também começa com 1 ponto
                  },
                };
              }
              return player;
            });
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

          // ⚖️ VALIDAÇÃO CRÍTICA: Verificar se a ação é válida antes de registrar
          const validation = validateAction(
            event.action,
            context.players,
            context.actions
          );

          // Se a ação for inválida, não registrar
          if (!validation.valid) {
            return context.actions;
          }

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

          // ⚖️ VALIDAÇÃO CRÍTICA: Verificar se a ação é válida para mensagens
          const validation = validateAction(
            event.action,
            context.players,
            context.actions
          );

          // Se a ação for inválida, adicionar mensagem de erro
          if (!validation.valid) {
            const timestamp = new Date().toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            });

            const rejectionMessage: Message = {
              id: `rejection-${Date.now()}`,
              createdAt: Date.now(),
              level: "ELIMINATION",
              text: `[${timestamp}] ❌ AÇÃO REJEITADA — ${validation.reason}`,
            };

            return [...context.messages, rejectionMessage];
          }

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
        eliminatedBombPlayer: ({ context }) => {
          // Verificar se um Homem-bomba foi eliminado
          const result = processNight(context.actions, context.players);
          const bombPlayer = checkForBombExplosion(
            context.players,
            result.updatedPlayers
          );
          return bombPlayer || context.eliminatedBombPlayer;
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

      addDayStatusMessage: assign({
        messages: ({ context }) => {
          const alivePlayers = context.players.filter((p) => p.alive);
          const silencedPlayers = alivePlayers.filter(
            (p) => p.meta?.silenced === true
          );
          const paralyzedPlayers = alivePlayers.filter(
            (p) => p.meta?.paralyzed === true
          );

          const newMessages: Message[] = [];

          // Sempre adicionar uma mensagem indicando o início do dia
          newMessages.push({
            id: uuidv4(),
            level: "ACTION_VALID",
            text: `🌅 DIA ${context.round} INICIADO`,
            createdAt: Date.now(),
          });

          if (silencedPlayers.length > 0) {
            newMessages.push({
              id: uuidv4(),
              level: "INFO",
              text: `⚠️ Jogadores SILENCIADOS (não podem votar): ${silencedPlayers
                .map((p) => p.nick)
                .join(", ")}`,
              createdAt: Date.now(),
            });
          }

          if (paralyzedPlayers.length > 0) {
            newMessages.push({
              id: uuidv4(),
              level: "INFO",
              text: `⚠️ Jogadores PARALISADOS (não podem votar): ${paralyzedPlayers
                .map((p) => p.nick)
                .join(", ")}`,
              createdAt: Date.now(),
            });
          }

          // Mostrar informações sobre quem pode votar
          const affectedPlayers =
            silencedPlayers.length + paralyzedPlayers.length;
          if (affectedPlayers > 0) {
            const canVote = alivePlayers.length - affectedPlayers;
            newMessages.push({
              id: uuidv4(),
              level: "INFO",
              text: `📊 RESUMO DA VOTAÇÃO: ${canVote} jogadores podem votar (${affectedPlayers} não podem votar)`,
              createdAt: Date.now(),
            });
          }

          return [...context.messages, ...newMessages];
        },
      }),

      clearDayEffects: assign({
        players: ({ context }) => {
          return context.players.map((player) => {
            if (player.meta) {
              const newMeta = { ...player.meta };

              // Remover efeitos que duram apenas durante o dia
              if (player.meta.silenced) {
                delete newMeta.silenced;
              }
              if (player.meta.paralyzed) {
                delete newMeta.paralyzed;
              }

              return { ...player, meta: newMeta };
            }
            return player;
          });
        },
      }),

      checkVotingTie: assign({
        tiedPlayers: ({ context }) => {
          try {
            const { isTie, tiedPlayers } = processVotingResult(
              context.players,
              context.votes
            );
            return isTie ? tiedPlayers : [];
          } catch (error) {
            console.error("Erro ao verificar empate:", error);
            return [];
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
            console.error("Erro ao processar mensagens de empate:", error);
            return context.messages;
          }
        },
      }),

      addNoEliminationMessage: assign({
        messages: ({ context }) => {
          const newMessage: Message = {
            id: uuidv4(),
            createdAt: Date.now(),
            level: "INFO",
            text: "[VOTAÇÃO] Host escolheu continuar para próxima noite sem eliminação.",
          };
          return [...context.messages, newMessage];
        },
      }),

      processSpiritRevenge: assign({
        players: ({ context, event }) => {
          if (
            event.type !== "PROCESS_SPIRIT_REVENGE" ||
            !context.eliminatedSpiritPlayer
          )
            return context.players;

          // Eliminar o jogador escolhido para vingança
          const updatedPlayers = context.players.map((player) =>
            player.id === event.targetId ? { ...player, alive: false } : player
          );

          return updatedPlayers;
        },
        messages: ({ context, event }) => {
          if (
            event.type !== "PROCESS_SPIRIT_REVENGE" ||
            !context.eliminatedSpiritPlayer
          )
            return context.messages;

          const victim = context.players.find((p) => p.id === event.targetId);
          if (!victim) return context.messages;

          const newMessage: Message = {
            id: uuidv4(),
            createdAt: Date.now(),
            level: "ELIMINATION",
            text: `🔮 VINGANÇA — ${victim.nick} (${victim.role}) foi eliminado pela vingança de ${context.eliminatedSpiritPlayer.nick}`,
          };

          return [...context.messages, newMessage];
        },
        eliminatedSpiritPlayer: () => undefined, // Limpar após processar
      }),

      processBombExplosion: assign({
        players: ({ context, event }) => {
          if (
            event.type !== "PROCESS_BOMB_EXPLOSION" ||
            !context.eliminatedBombPlayer
          )
            return context.players;

          // Eliminar os jogadores escolhidos para explosão
          const targetIds = event.targetIds || [];
          const updatedPlayers = context.players.map((player) =>
            targetIds.includes(player.id) ? { ...player, alive: false } : player
          );

          return updatedPlayers;
        },
        messages: ({ context, event }) => {
          if (
            event.type !== "PROCESS_BOMB_EXPLOSION" ||
            !context.eliminatedBombPlayer
          )
            return context.messages;

          const targetIds = event.targetIds || [];
          const newMessages: Message[] = [];

          for (const targetId of targetIds) {
            const victim = context.players.find((p) => p.id === targetId);
            if (victim) {
              newMessages.push({
                id: uuidv4(),
                createdAt: Date.now(),
                level: "ELIMINATION",
                text: `💣 EXPLOSÃO — ${victim.nick} (${victim.role}) foi eliminado pela explosão de ${context.eliminatedBombPlayer.nick}`,
              });
            }
          }

          return [...context.messages, ...newMessages];
        },
        eliminatedBombPlayer: () => undefined, // Limpar após processar
      }),

      processBombExplosionWithSpirit: assign({
        players: ({ context, event }) => {
          if (
            event.type !== "PROCESS_BOMB_EXPLOSION" ||
            !context.eliminatedBombPlayer
          )
            return context.players;

          // Eliminar os jogadores escolhidos para explosão
          const targetIds = event.targetIds || [];
          const updatedPlayers = context.players.map((player) =>
            targetIds.includes(player.id) ? { ...player, alive: false } : player
          );

          return updatedPlayers;
        },
        eliminatedSpiritPlayer: ({ context, event }) => {
          if (
            event.type !== "PROCESS_BOMB_EXPLOSION" ||
            !context.eliminatedBombPlayer
          )
            return undefined;

          // Verificar se algum dos eliminados na explosão é Espírito Vingativo
          const targetIds = event.targetIds || [];
          const eliminatedSpirit = context.players.find(
            (p) => targetIds.includes(p.id) && p.role === "Espírito Vingativo"
          );

          return eliminatedSpirit || undefined;
        },
        messages: ({ context, event }) => {
          if (
            event.type !== "PROCESS_BOMB_EXPLOSION" ||
            !context.eliminatedBombPlayer
          )
            return context.messages;

          const targetIds = event.targetIds || [];
          const newMessages: Message[] = [];

          for (const targetId of targetIds) {
            const victim = context.players.find((p) => p.id === targetId);
            if (victim) {
              newMessages.push({
                id: uuidv4(),
                createdAt: Date.now(),
                level: "ELIMINATION",
                text: `💣 EXPLOSÃO — ${victim.nick} (${victim.role}) foi eliminado pela explosão de ${context.eliminatedBombPlayer.nick}`,
              });
            }
          }

          return [...context.messages, ...newMessages];
        },
        eliminatedBombPlayer: () => undefined, // Limpar após processar
      }),

      processEliminationWithSpirit: assign({
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
        eliminatedSpiritPlayer: ({ context }) => {
          try {
            const { eliminatedPlayer } = processVotingResult(
              context.players,
              context.votes
            );
            return eliminatedPlayer &&
              eliminatedPlayer.role === "Espírito Vingativo"
              ? eliminatedPlayer
              : undefined;
          } catch (error) {
            console.error("Erro ao identificar Espírito Vingativo:", error);
            return undefined;
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
      }),

      processEliminationWithBomb: assign({
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
        eliminatedBombPlayer: ({ context }) => {
          try {
            const { eliminatedPlayer } = processVotingResult(
              context.players,
              context.votes
            );
            return eliminatedPlayer && eliminatedPlayer.role === "Homem-bomba"
              ? eliminatedPlayer
              : undefined;
          } catch (error) {
            console.error("Erro ao identificar Homem-bomba:", error);
            return undefined;
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

      hasVotingTie: ({ context }) => {
        try {
          const { isTie } = processVotingResult(context.players, context.votes);
          return isTie;
        } catch (error) {
          console.error("Erro ao verificar empate:", error);
          return false;
        }
      },

      eliminatedSpiritVingativo: ({ context }) => {
        try {
          const { eliminatedPlayer, isTie } = processVotingResult(
            context.players,
            context.votes
          );
          return !isTie && eliminatedPlayer?.role === "Espírito Vingativo";
        } catch (error) {
          console.error("Erro ao verificar Espírito Vingativo:", error);
          return false;
        }
      },

      eliminatedBombVoting: ({ context }) => {
        try {
          const { eliminatedPlayer, isTie } = processVotingResult(
            context.players,
            context.votes
          );
          return !isTie && eliminatedPlayer?.role === "Homem-bomba";
        } catch (error) {
          console.error("Erro ao verificar Homem-bomba na votação:", error);
          return false;
        }
      },

      eliminatedSpiritInBombExplosion: ({ context, event }) => {
        if (event.type !== "PROCESS_BOMB_EXPLOSION") return false;

        try {
          // Verificar se algum dos alvos da explosão é Espírito Vingativo
          const targetIds = event.targetIds || [];
          return context.players.some(
            (p) => targetIds.includes(p.id) && p.role === "Espírito Vingativo"
          );
        } catch (error) {
          console.error(
            "Erro ao verificar Espírito Vingativo na explosão:",
            error
          );
          return false;
        }
      },

      hasBombExplosion: ({ context }) => {
        return context.eliminatedBombPlayer !== undefined;
      },

      isGameOverAfterBombExplosion: ({ context, event }) => {
        if (event.type !== "PROCESS_BOMB_EXPLOSION") return false;

        try {
          // Simular a eliminação dos alvos da explosão
          const targetIds = event.targetIds || [];
          const updatedPlayers = context.players.map((player) =>
            targetIds.includes(player.id) ? { ...player, alive: false } : player
          );

          const winConditions = checkWinConditions(updatedPlayers);
          return winConditions.gameOver;
        } catch (error) {
          console.error("Erro ao verificar fim de jogo após explosão:", error);
          return false;
        }
      },
    },
  }
);
