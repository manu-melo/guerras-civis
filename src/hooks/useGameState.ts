// src/hooks/useGameState.ts
"use client";

import { useMachine } from "@xstate/react";
import { useEffect } from "react";
import { gameMachine } from "@/lib/gameMachine";
import { useGameStorage } from "./useLocalStorage";

interface StoredGameState {
  context: {
    hostNick: string;
    players: unknown[];
    gameStarted: boolean;
  };
}

export function useGameState() {
  const [state, send] = useMachine(gameMachine);
  const {
    gameState: storedState,
    saveGameState,
    clearGameState,
    hasStoredGame,
  } = useGameStorage();

  // Auto-save do estado quando houver mudanças
  useEffect(() => {
    if (state.context.gameStarted) {
      saveGameState({
        context: state.context,
        value: state.value,
      });
    }
  }, [state.context, state.value, saveGameState]);

  // Função para restaurar jogo salvo
  const restoreGame = () => {
    if (storedState && (storedState as unknown as StoredGameState).context) {
      // Enviar eventos para restaurar o estado
      send({
        type: "START_GAME",
        hostNick: (storedState as unknown as StoredGameState).context.hostNick,
        players: (storedState as unknown as StoredGameState).context.players,
      });

      // Adicionar lógica adicional para restaurar o estado completo
      // Isso pode envolver múltiplos eventos dependendo do estado salvo
    }
  };

  // Função para iniciar novo jogo (limpa storage)
  const startNewGame = () => {
    clearGameState();
    send({ type: "RESET_GAME" });
  };

  // Função para exportar estado do jogo
  const exportGame = () => {
    const exportData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      gameState: {
        context: state.context,
        value: state.value,
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `guerras-civis-save-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Função para importar estado do jogo
  const importGame = (file: File) => {
    return new Promise<boolean>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);

          if (importedData.gameState && importedData.gameState.context) {
            // Validar estrutura básica
            const context = importedData.gameState.context;

            if (context.hostNick && Array.isArray(context.players)) {
              saveGameState(importedData.gameState);
              restoreGame();
              resolve(true);
            } else {
              reject(new Error("Formato de arquivo inválido"));
            }
          } else {
            reject(new Error("Arquivo não contém dados válidos de jogo"));
          }
        } catch (_error) {
          reject(new Error("Erro ao processar arquivo JSON"));
        }
      };

      reader.onerror = () => {
        reject(new Error("Erro ao ler arquivo"));
      };

      reader.readAsText(file);
    });
  };

  // Função para obter estatísticas do jogo
  const getGameStats = () => {
    const context = state.context;
    const alivePlayers = context.players.filter((p) => p.alive);
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
  };

  // Função para verificar se jogo pode ser restaurado
  const canRestoreGame = () => {
    return (
      hasStoredGame() &&
      (storedState as unknown as StoredGameState)?.context?.gameStarted
    );
  };

  return {
    // Estado da máquina
    state,
    send,

    // Persistência
    restoreGame,
    startNewGame,
    exportGame,
    importGame,
    canRestoreGame,

    // Utilitários
    getGameStats,

    // Estados derivados
    isSetupPhase: state.matches("setup") || state.matches("roleAssignment"),
    isNightPhase: state.matches("night"),
    isEventsPhase: state.matches("events"),
    isDayPhase: state.matches("day"),
    isVotingPhase: state.matches("voting"),
    isGameOver: state.matches("gameOver"),
    needsJokerDice: state.matches("jokerDice"),

    // Dados do contexto
    gameStarted: state.context.gameStarted,
    players: state.context.players,
    messages: state.context.messages,
    actions: state.context.actions,
    round: state.context.round,
    phase: state.context.phase,
    votes: state.context.votes,
    hostNick: state.context.hostNick,
    winningTeam: state.context.winningTeam,
  };
}
