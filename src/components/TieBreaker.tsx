// src/components/TieBreaker.tsx
"use client";

import { Player } from "@/types/game";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, RefreshCw, SkipForward } from "lucide-react";

interface TieBreakerProps {
  tiedPlayers: Player[];
  onRepeatVoting: () => void;
  onContinueToNight: () => void;
}

export function TieBreaker({
  tiedPlayers,
  onRepeatVoting,
  onContinueToNight,
}: TieBreakerProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-center">
          <Users className="h-6 w-6 text-yellow-500" />
          Empate na Votação
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Jogadores empatados */}
        <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3">
            Jogadores empatados:
          </h3>
          <div className="flex flex-wrap gap-2">
            {tiedPlayers.map((player) => (
              <Badge
                key={player.id}
                variant="outline"
                className="text-yellow-700 border-yellow-300 bg-yellow-100 dark:text-yellow-300 dark:border-yellow-600 dark:bg-yellow-900"
              >
                {player.nick} ({player.role})
              </Badge>
            ))}
          </div>
        </div>

        {/* Explicação */}
        <div className="text-center text-muted-foreground">
          <p className="mb-2">
            Houve empate na votação. O que você deseja fazer?
          </p>
          <ul className="text-sm space-y-1">
            <li>
              • <strong>Repetir votação:</strong> Nova votação apenas entre os
              jogadores empatados
            </li>
            <li>
              • <strong>Continuar:</strong> Ninguém é eliminado e o jogo segue
              para a próxima noite
            </li>
          </ul>
        </div>

        {/* Botões de ação */}
        <div className="grid md:grid-cols-2 gap-3">
          <Button
            onClick={onRepeatVoting}
            className="flex items-center gap-2"
            variant="default"
          >
            <RefreshCw className="h-4 w-4" />
            Repetir Votação
          </Button>

          <Button
            onClick={onContinueToNight}
            className="flex items-center gap-2"
            variant="outline"
          >
            <SkipForward className="h-4 w-4" />
            Continuar para Próxima Noite
          </Button>
        </div>

        {/* Dica */}
        <div className="text-xs text-muted-foreground text-center bg-muted/30 p-3 rounded">
          💡 <strong>Dica:</strong> Se repetir a votação várias vezes e
          continuar empatando, considere continuar para a próxima noite para
          manter o ritmo do jogo.
        </div>
      </CardContent>
    </Card>
  );
}
