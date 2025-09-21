// src/hooks/useLocalStorage.ts
"use client";

import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  // State para armazenar nosso valor
  // Passar valor inicial da função para useState para que a função seja executada apenas uma vez
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      // Obter do local storage por chave
      const item = window.localStorage.getItem(key);
      // Analisar JSON armazenado ou, se não houver, retornar initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Se erro, retornar valor inicial
      console.log(error);
      return initialValue;
    }
  });

  // Retornar uma versão wrapped da função setter useState que persiste o novo valor no localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permitir que value seja uma função para que tenhamos a mesma API que useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      // Salvar no state
      setStoredValue(valueToStore);

      // Salvar no local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // Um caso de uso mais avançado seria lidar com os casos de erro também.
      console.log(error);
    }
  };

  return [storedValue, setValue] as const;
}

// Hook específico para o estado do jogo
export function useGameStorage() {
  const [gameState, setGameState] = useLocalStorage<any>(
    "guerras-civis-game-state",
    null
  );

  const saveGameState = (state: any) => {
    const stateToSave = {
      ...state,
      savedAt: new Date().toISOString(),
    };
    setGameState(stateToSave);
  };

  const loadGameState = () => {
    return gameState;
  };

  const clearGameState = () => {
    setGameState(null);
  };

  const hasStoredGame = () => {
    return gameState !== null;
  };

  return {
    gameState,
    saveGameState,
    loadGameState,
    clearGameState,
    hasStoredGame,
  };
}
