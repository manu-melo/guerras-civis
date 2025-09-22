// src/components/SpiritRevenge.tsx
"use client";

import { useState } from "react";
import { Player } from "@/types/game";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Zap, Ghost } from "lucide-react";

interface SpiritRevengeProps {
  eliminatedSpirit: Player;
  alivePlayers: Player[];
  onProcessRevenge: (targetId: string) => void;
}

export function SpiritRevenge({
  eliminatedSpirit,
  alivePlayers,
  onProcessRevenge,
}: SpiritRevengeProps) {
  const [selectedTargetId, setSelectedTargetId] = useState<string>("");

  const handleConfirmRevenge = () => {
    if (selectedTargetId) {
      onProcessRevenge(selectedTargetId);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-center text-purple-600 dark:text-purple-400">
          <Ghost className="h-6 w-6" />
          Vingança do Espírito Vingativo
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Informação sobre o Espírito eliminado */}
        <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-semibold text-purple-800 dark:text-purple-200">
              Poder da Vingança Ativado
            </h3>
          </div>
          <p className="text-purple-700 dark:text-purple-300">
            <strong>{eliminatedSpirit.nick}</strong> foi eliminado e pode levar
            um jogador consigo para o além!
          </p>
        </div>

        {/* Seleção do alvo */}
        <div className="space-y-3">
          <Label htmlFor="revenge-target" className="text-base font-medium">
            Selecionar jogador para eliminar:
          </Label>
          <Select value={selectedTargetId} onValueChange={setSelectedTargetId}>
            <SelectTrigger id="revenge-target">
              <SelectValue placeholder="Escolha um jogador vivo..." />
            </SelectTrigger>
            <SelectContent>
              {alivePlayers.map((player) => (
                <SelectItem key={player.id} value={player.id}>
                  {player.nick} ({player.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Aviso */}
        <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-red-700 dark:text-red-300 text-sm">
            ⚠️ <strong>Atenção:</strong> Esta ação é irreversível. O jogador
            selecionado será eliminado imediatamente.
          </p>
        </div>

        {/* Botão de confirmação */}
        <Button
          onClick={handleConfirmRevenge}
          disabled={!selectedTargetId}
          variant="destructive"
          className="w-full"
          size="lg"
        >
          <Zap className="h-4 w-4 mr-2" />
          Confirmar Vingança
        </Button>

        {/* Informação adicional */}
        <div className="text-xs text-muted-foreground text-center bg-muted/30 p-3 rounded">
          💀 <strong>Regra:</strong> O Espírito Vingativo pode eliminar qualquer
          jogador vivo quando é eliminado por votação.
        </div>
      </CardContent>
    </Card>
  );
}
