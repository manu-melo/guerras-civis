// src/components/VotingPanel.tsx
"use client";

import { useState } from "react";
import { Player } from "@/types/game";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus } from "lucide-react";

interface VotingPanelProps {
  players: Player[];
  votes: Record<string, number>;
  onVote: (targetId: string, votes: number) => void;
  onEndVoting: () => void;
  tiedPlayers?: Player[]; // Para votação de desempate
  protectedPlayerIds?: string[]; // Jogadores protegidos pelo Anjo
}

export function VotingPanel({
  players,
  votes,
  onVote,
  onEndVoting,
  tiedPlayers,
  protectedPlayerIds = [],
}: VotingPanelProps) {
  const [localVotes, setLocalVotes] = useState<Record<string, number>>({});

  // LÓGICA RIGOROSA PARA VOTAÇÃO DE DESEMPATE
  const validTiedPlayers =
    tiedPlayers && Array.isArray(tiedPlayers) && tiedPlayers.length > 1
      ? tiedPlayers
      : null;

  const isTieBreaker = validTiedPlayers !== null;

  // REGRA CRÍTICA: Se é votação de desempate, usar SOMENTE os jogadores empatados
  // Se é votação normal, usar todos os jogadores vivos
  let basePlayers: Player[];

  if (isTieBreaker && validTiedPlayers) {
    // DESEMPATE: usar APENAS os jogadores empatados
    basePlayers = validTiedPlayers;
  } else {
    // VOTAÇÃO NORMAL: usar todos os jogadores vivos
    basePlayers = players.filter((p) => p.alive);
  }

  // Filtrar jogadores protegidos pelo Anjo (proteção vale apenas no dia seguinte à noite da proteção)
  const votingPlayers = basePlayers.filter(
    (player) => !protectedPlayerIds.includes(player.id)
  );

  // Calcular total de votos já registrados
  const totalVotesRegistered = Object.values(votes).reduce(
    (sum, count) => sum + count,
    0
  );

  // Máximo de votos possíveis (todos os jogadores + aldeão com voto triplo)
  const maxPossibleVotes =
    players.length + players.filter((p) => p.role === "Aldeão").length * 2; // +2 porque aldeão já conta como 1

  const handleVoteChange = (playerId: string, change: number) => {
    const currentLocal = localVotes[playerId] || 0;
    const newValue = Math.max(0, currentLocal + change);

    // Verificar se não excede o limite total
    const newTotal =
      totalVotesRegistered +
      Object.values(localVotes).reduce((sum, count) => sum + count, 0) -
      currentLocal +
      newValue;

    if (newTotal <= maxPossibleVotes) {
      setLocalVotes((prev) => ({
        ...prev,
        [playerId]: newValue,
      }));
    }
  };

  const applyVotes = (playerId: string) => {
    const votesToAdd = localVotes[playerId] || 0;
    if (votesToAdd > 0) {
      onVote(playerId, votesToAdd);
      setLocalVotes((prev) => ({
        ...prev,
        [playerId]: 0,
      }));
    }
  };

  const getTotalVotesForPlayer = (playerId: string): number => {
    return (votes[playerId] || 0) + (localVotes[playerId] || 0);
  };

  const currentTotalVotes =
    totalVotesRegistered +
    Object.values(localVotes).reduce((sum, count) => sum + count, 0);
  const canAddMoreVotes = currentTotalVotes < maxPossibleVotes;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            {isTieBreaker ? "Votação de Desempate" : "Votação"}
            {isTieBreaker && (
              <span className="text-sm text-yellow-600 dark:text-yellow-400 ml-2">
                (apenas jogadores empatados)
              </span>
            )}
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Votos: {currentTotalVotes}/{maxPossibleVotes}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
          <p>
            <strong>Instruções:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Use os botões + e - para adicionar/remover votos</li>
            <li>Aldeão vale 3 votos (adicione +3 manualmente)</li>
            <li>Total máximo: {maxPossibleVotes} votos</li>
            <li>Em caso de empate, você pode repetir a votação</li>
          </ul>
        </div>

        <div className="grid gap-3">
          {votingPlayers.map((player) => {
            const totalVotes = getTotalVotesForPlayer(player.id);
            const localVoteCount = localVotes[player.id] || 0;

            return (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 bg-muted/20 rounded-md"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium">{player.nick}</div>
                    <div className="text-sm text-muted-foreground">
                      {player.role}
                      {player.role === "Aldeão" && (
                        <span className="text-blue-500 ml-1">
                          (voto triplo)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVoteChange(player.id, -1)}
                      disabled={localVoteCount <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>

                    <div className="text-center min-w-[60px]">
                      <div className="text-lg font-bold">{totalVotes}</div>
                      {localVoteCount > 0 && (
                        <div className="text-xs text-blue-500">
                          +{localVoteCount}
                        </div>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVoteChange(player.id, 1)}
                      disabled={!canAddMoreVotes}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {localVoteCount > 0 && (
                    <Button size="sm" onClick={() => applyVotes(player.id)}>
                      Aplicar
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Voting Summary */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Resultado Atual:</h4>
          <div className="space-y-1">
            {Object.entries(votes)
              .filter(([_playerId, voteCount]) => voteCount > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([playerId, voteCount]) => {
                const player = players.find((p) => p.id === playerId);
                return (
                  <div key={playerId} className="flex justify-between text-sm">
                    <span>{player?.nick}</span>
                    <Badge variant="outline">{voteCount} votos</Badge>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={onEndVoting}
            className="flex-1"
            disabled={Object.keys(votes).length === 0}
          >
            Encerrar Votação
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
