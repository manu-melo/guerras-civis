// src/components/PlayersList.tsx
"use client";

import { useState } from "react";
import { Player, Role } from "@/types/game";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, User, Skull } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayersListProps {
  hostNick: string;
  players: Player[];
  onHostNickChange: (nick: string) => void;
  onAddPlayer: (nick: string) => void;
  onRemovePlayer: (playerId: string) => void;
  onStartGame?: () => void;
  gameStarted?: boolean;
  showRoles?: boolean;
}

export function PlayersList({
  hostNick,
  players,
  onHostNickChange,
  onAddPlayer,
  onRemovePlayer,
  onStartGame,
  gameStarted = false,
  showRoles = false,
}: PlayersListProps) {
  const [newPlayerNick, setNewPlayerNick] = useState("");

  const isValidPlayerCount = [12, 14, 16, 18].includes(players.length);
  const alivePlayers = players.filter((p) => p.alive);
  const deadPlayers = players.filter((p) => !p.alive);

  const handleAddPlayer = () => {
    if (newPlayerNick.trim() && !gameStarted) {
      onAddPlayer(newPlayerNick.trim());
      setNewPlayerNick("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddPlayer();
    }
  };

  const getRoleColor = (role?: Role): string => {
    if (!role) return "";

    // Civis em azul, Máfias em vermelho
    const civilRoles = [
      "Juiz",
      "Policial",
      "Anjo",
      "Detetive",
      "Aldeão",
      "Fada",
      "Espírito Vingativo",
      "Escudeiro",
      "Coringa",
    ];

    if (civilRoles.includes(role)) {
      return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950";
    } else {
      return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950";
    }
  };

  const civilPlayers = showRoles
    ? alivePlayers.filter((p) => p.team === "CIVIL")
    : [];
  const mafiaPlayers = showRoles
    ? alivePlayers.filter((p) => p.team === "MAFIA")
    : [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Jogadores ({players.length}/18)</span>
          {gameStarted && (
            <Badge variant={isValidPlayerCount ? "default" : "destructive"}>
              {alivePlayers.length} vivos
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Host Input */}
        {!gameStarted && (
          <div className="space-y-2">
            <Label htmlFor="hostNick">Nick do Host</Label>
            <Input
              id="hostNick"
              value={hostNick}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onHostNickChange(e.target.value)
              }
              placeholder="Digite seu nick de host..."
              className="w-full"
            />
          </div>
        )}

        {/* Add Player */}
        {!gameStarted && (
          <div className="space-y-2">
            <Label htmlFor="newPlayer">Adicionar Jogador</Label>
            <div className="flex gap-2">
              <Input
                id="newPlayer"
                value={newPlayerNick}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewPlayerNick(e.target.value)
                }
                onKeyPress={handleKeyPress}
                placeholder="Nick do jogador..."
                className="flex-1"
              />
              <Button
                onClick={handleAddPlayer}
                disabled={!newPlayerNick.trim()}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Jogadores válidos: 12, 14, 16 ou 18. Atual: {players.length}
            </p>
          </div>
        )}

        {/* Player Count Validation */}
        {!gameStarted && (
          <div
            className={cn(
              "p-3 rounded-md text-sm",
              isValidPlayerCount
                ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"
                : "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300"
            )}
          >
            {isValidPlayerCount
              ? "✓ Número de jogadores válido!"
              : "⚠ Número de jogadores inválido. Adicione mais jogadores."}
          </div>
        )}

        {/* Roles Display (when showing roles) */}
        {showRoles && gameStarted && (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-2">
                👑 Civis ({civilPlayers.length})
              </h4>
              <div className="space-y-1">
                {civilPlayers.map((player) => (
                  <Badge key={player.id} className={getRoleColor(player.role)}>
                    {player.role}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">
                🗡️ Máfias ({mafiaPlayers.length})
              </h4>
              <div className="space-y-1">
                {mafiaPlayers.map((player) => (
                  <Badge key={player.id} className={getRoleColor(player.role)}>
                    {player.role}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Players List */}
        {players.length > 0 && (
          <div className="space-y-3">
            {/* Alive Players */}
            {alivePlayers.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Jogadores Vivos ({alivePlayers.length})
                </h4>
                <div className="grid gap-2">
                  {alivePlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-2 bg-muted/30 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{player.nick}</span>
                        {showRoles && player.role && (
                          <Badge
                            variant="outline"
                            className={getRoleColor(player.role)}
                          >
                            {player.role}
                          </Badge>
                        )}
                      </div>
                      {!gameStarted && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemovePlayer(player.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dead Players */}
            {deadPlayers.length > 0 && gameStarted && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <Skull className="h-4 w-4" />
                  Jogadores Eliminados ({deadPlayers.length})
                </h4>
                <div className="grid gap-2">
                  {deadPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center gap-2 p-2 bg-muted/10 rounded-md opacity-60"
                    >
                      <span className="font-medium line-through">
                        {player.nick}
                      </span>
                      {showRoles && player.role && (
                        <Badge
                          variant="outline"
                          className={cn(
                            getRoleColor(player.role),
                            "opacity-60"
                          )}
                        >
                          {player.role}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Start Game Button */}
        {!gameStarted && onStartGame && (
          <Button
            onClick={onStartGame}
            disabled={!isValidPlayerCount || !hostNick.trim()}
            className="w-full"
            size="lg"
          >
            {!hostNick.trim()
              ? "Digite o nick do host"
              : !isValidPlayerCount
              ? "Número de jogadores inválido"
              : "🗡️ Guerrear"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
