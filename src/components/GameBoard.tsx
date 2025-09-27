// src/components/GameBoard.tsx
"use client";

import { useState, useEffect } from "react";
import { useMachine } from "@xstate/react";
import { gameMachine } from "@/lib/gameMachine";
import { Player, Action, ActionType } from "@/types/game";
import {
  createPlayer,
  processJokerDice,
  getRoleAction,
  checkWinConditions,
  getPendingDiceActions,
  getAngelProtectedPlayers,
} from "@/lib/gameEngine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlayersList } from "./PlayersList";
import { MessagesPanel } from "./MessagesPanel";
import { VotingPanel } from "./VotingPanel";
import { TieBreaker } from "./TieBreaker";
import { SpiritRevenge } from "./SpiritRevenge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Eye, UserX, StopCircle, CheckCircle, Menu } from "lucide-react";

export function GameBoard() {
  const [state, send] = useMachine(gameMachine);
  const [hostNick, setHostNick] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedActor, setSelectedActor] = useState<string>("");
  const [selectedTarget, setSelectedTarget] = useState<string>("");
  const [jokerDiceValue, setJokerDiceValue] = useState<number>(1);
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [eliminatePlayerId, setEliminatePlayerId] = useState<string>("");
  const [selectedBombTargets, setSelectedBombTargets] = useState<string[]>([]);
  const [currentDiceAction, setCurrentDiceAction] = useState<Action | null>(
    null
  );
  const [diceValue, setDiceValue] = useState<number>(1);

  // Dados da UI
  const isSetupPhase =
    state.matches("setup") || state.matches("roleAssignment");
  const isNightPhase = state.matches("night");
  const isEventsPhase = state.matches("events");
  const isDayPhase = state.matches("day");
  const isVotingPhase = state.matches("voting");
  const isTieBreaker = state.matches("tieBreaker");
  const isTieVoting = state.matches("tieVoting");
  const isSpiritRevenge = state.matches("spiritRevenge");
  const isBombExplosion = state.matches("bombExplosion");
  const isGameOver = state.matches("gameOver");
  const needsJokerDice = state.matches("jokerDice");

  const alivePlayers = players.filter((p) => p.alive);
  const stats = calculateStats();

  // Sincronizar jogadores apenas quando necessário e sem causar loops
  useEffect(() => {
    // Apenas sincronizar do contexto da máquina para o estado local quando o jogo já começou
    // e há jogadores na máquina mas não no estado local
    if (
      state.context.gameStarted &&
      state.context.players.length > 0 &&
      players.length === 0
    ) {
      setPlayers(state.context.players);
    }
  }, [state.context.players, state.context.gameStarted, players.length]);

  // Verificar ações pendentes de dados
  const pendingDiceActions = isDayPhase
    ? getPendingDiceActions(state.context.actions)
    : [];
  const hasPendingDice = pendingDiceActions.length > 0;

  // Filtrar jogadores que ainda não agiram nesta noite
  const getAvailableActors = () => {
    if (!isNightPhase) return alivePlayers;

    // Obter IDs dos jogadores que já agiram nesta noite
    const actorsWhoActed = state.context.actions
      .filter(
        (action) => action.status === "VALID" || action.status === "ANULLED"
      )
      .map((action) => action.actorId);

    // Filtrar jogadores vivos que ainda não agiram
    return alivePlayers.filter((player) => !actorsWhoActed.includes(player.id));
  };

  const availableActors = getAvailableActors();

  useEffect(() => {
    // Sincronizar estado com a máquina
    if (state.context.players.length > 0) {
      setPlayers(state.context.players);
    }
    if (state.context.hostNick) {
      setHostNick(state.context.hostNick);
    }
  }, [state.context]);

  // Limpar seleção se o jogador selecionado não estiver mais disponível
  useEffect(() => {
    if (selectedActor && !availableActors.some((p) => p.id === selectedActor)) {
      setSelectedActor("");
    }
  }, [availableActors, selectedActor]);

  function calculateStats() {
    const alive = alivePlayers.length;
    if (alive === 0)
      return { civilPercentage: 0, mafiaPercentage: 0, aliveCount: 0 };

    const civilCount = alivePlayers.filter((p) => p.team === "CIVIL").length;
    const mafiaCount = alivePlayers.filter((p) => p.team === "MAFIA").length;

    return {
      civilPercentage: Math.round((civilCount / alive) * 100),
      mafiaPercentage: Math.round((mafiaCount / alive) * 100),
      aliveCount: alive,
    };
  }

  const handleAddPlayer = (nick: string) => {
    const newPlayer = createPlayer(nick);
    setPlayers((prev) => [...prev, newPlayer]);
  };

  const handleRemovePlayer = (playerId: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
  };

  const handleClearPlayers = () => {
    if (confirm("Tem certeza que deseja limpar todos os jogadores?")) {
      setPlayers([]);
    }
  };

  const handleStartGame = () => {
    if (!hostNick.trim() || players.length === 0) return;

    send({
      type: "START_GAME",
      hostNick: hostNick.trim(),
      players: players,
    });

    // Distribuir cargos via máquina de estados
    send({ type: "ASSIGN_ROLES" });
  };

  const handleJokerDice = () => {
    if (jokerDiceValue === 6) {
      alert("Valor 6 não é permitido. Re-role o dado!");
      return;
    }

    try {
      const updatedPlayers = processJokerDice(players, jokerDiceValue);
      setPlayers(updatedPlayers);
      send({ type: "SET_JOKER_DICE", value: jokerDiceValue });
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handleRecordAction = () => {
    if (!selectedActor || !selectedTarget) return;

    const actor = players.find((p) => p.id === selectedActor);
    const target = players.find((p) => p.id === selectedTarget);

    if (!actor || !target || !actor.role) return;

    // Determinar ação automaticamente baseada no cargo (considerando Coringa)
    const actionType = getRoleAction(actor);
    if (!actionType) {
      alert(`O cargo ${actor.role} não possui ação noturna.`);
      return;
    }

    send({
      type: "RECORD_ACTION",
      action: {
        actorId: selectedActor,
        actorRole: actor.role,
        targetId: selectedTarget,
        targetRole: target.role,
        type: actionType,
      },
    });

    // Reset selections
    setSelectedActor("");
    setSelectedTarget("");
  };

  const handleEliminateNow = () => {
    if (!eliminatePlayerId) return;

    send({ type: "ELIMINATE_PLAYER", playerId: eliminatePlayerId });
    setEliminatePlayerId("");
  };

  const handleProcessDice = () => {
    if (!currentDiceAction) return;

    send({
      type: "PROCESS_DICE",
      actionId: currentDiceAction.id,
      diceValue: diceValue,
    });

    // Reset estado dos dados
    setCurrentDiceAction(null);
    setDiceValue(1);
  };

  const handleBombExplosion = () => {
    send({
      type: "PROCESS_BOMB_EXPLOSION",
      targetIds: selectedBombTargets,
    });

    // Reset estado da explosão
    setSelectedBombTargets([]);
  };

  const toggleBombTarget = (playerId: string) => {
    setSelectedBombTargets((prev) => {
      if (prev.includes(playerId)) {
        return prev.filter((id) => id !== playerId);
      } else if (prev.length < 2) {
        // Máximo 2 alvos
        return [...prev, playerId];
      }
      return prev;
    });
  };

  const startDiceInput = (action: Action) => {
    setCurrentDiceAction(action);
    setDiceValue(1);
  };

  const getPhaseText = () => {
    const round = state.context.round;
    switch (state.value) {
      case "night":
        return `DURANTE A NOITE ${round}`;
      case "events":
        return `DURANTE OS ACONTECIMENTOS ${round}`;
      case "day":
        return `DURANTE O DIA ${round}`;
      case "voting":
        return `VOTAÇÃO DO DIA ${round}`;
      case "tieBreaker":
        return `EMPATE NA VOTAÇÃO - DIA ${round}`;
      case "tieVoting":
        return `VOTAÇÃO DE DESEMPATE - DIA ${round}`;
      case "spiritRevenge":
        return `VINGANÇA DO ESPÍRITO - DIA ${round}`;
      default:
        return "";
    }
  };

  if (isSetupPhase) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PlayersList
              hostNick={hostNick}
              players={players}
              onHostNickChange={setHostNick}
              onAddPlayer={handleAddPlayer}
              onRemovePlayer={handleRemovePlayer}
              onClearPlayers={handleClearPlayers}
              onStartGame={handleStartGame}
              gameStarted={false}
            />
          </div>
          <div>
            <MessagesPanel messages={state.context.messages} />
          </div>
        </div>
      </div>
    );
  }

  if (needsJokerDice) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>🃏 Dado do Coringa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Um jogador recebeu o cargo <strong>Coringa</strong>. Role um dado
              (1-6) para determinar seu cargo:
            </p>

            <div className="space-y-2">
              <Label>Resultado do dado</Label>
              <Select
                value={jokerDiceValue.toString()}
                onValueChange={(v) => setJokerDiceValue(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Assassino</SelectItem>
                  <SelectItem value="2">2 - Silenciador</SelectItem>
                  <SelectItem value="3">3 - Paralisador</SelectItem>
                  <SelectItem value="4">4 - Anjo</SelectItem>
                  <SelectItem value="5">5 - Detetive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleJokerDice} className="w-full">
              Confirmar Resultado
            </Button>

            <p className="text-sm text-muted-foreground">
              <strong>Importante:</strong> Se o resultado for 6, re-role o dado.
              Não registre o valor 6.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isBombExplosion) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl mx-auto shadow-lg border-2 border-red-500/20 dark:border-red-400/30">
          <CardHeader className="text-center bg-red-50 dark:bg-red-950/50 border-b border-red-200 dark:border-red-800">
            <CardTitle className="text-2xl font-bold text-red-700 dark:text-red-300 flex items-center justify-center gap-2">
              💣 Explosão do Homem-bomba
            </CardTitle>
            <p className="text-red-600 dark:text-red-400 mt-2">
              <strong className="text-lg">
                {state.context.eliminatedBombPlayer?.nick}
              </strong>{" "}
              (Homem-bomba) foi eliminado!
            </p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <p className="text-base text-foreground font-medium">
                Selecione de 0 a 2 jogadores para serem eliminados pela
                explosão:
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold text-foreground">
                Alvos da explosão (máximo 2 jogadores)
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                {alivePlayers.map((player) => (
                  <div
                    key={player.id}
                    className={`
                      flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer 
                      transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                      ${
                        selectedBombTargets.includes(player.id)
                          ? "bg-red-100 dark:bg-red-900/50 border-red-500 dark:border-red-400 shadow-md ring-2 ring-red-200 dark:ring-red-700"
                          : "bg-card hover:bg-muted/50 border-border hover:border-muted-foreground/20 shadow-sm"
                      }
                    `}
                    onClick={() => toggleBombTarget(player.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-lg text-foreground truncate">
                        {player.nick}
                      </div>
                      {player.role && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {player.role}
                        </div>
                      )}
                    </div>
                    {selectedBombTargets.includes(player.id) && (
                      <div className="ml-3 flex-shrink-0">
                        <div className="w-6 h-6 bg-red-500 dark:bg-red-400 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            ✓
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {selectedBombTargets.length > 0 && (
                <div className="text-center text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  <strong>{selectedBombTargets.length}</strong> jogador
                  {selectedBombTargets.length > 1 ? "es" : ""} selecionado
                  {selectedBombTargets.length > 1 ? "s" : ""} para eliminação
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleBombExplosion}
                className="flex-1 text-base font-semibold py-3 h-auto"
                variant={
                  selectedBombTargets.length === 0 ? "outline" : "destructive"
                }
                size="lg"
              >
                {selectedBombTargets.length === 0
                  ? "💥 Explosão sem vítimas"
                  : `💀 Confirmar eliminação de ${
                      selectedBombTargets.length
                    } jogador${selectedBombTargets.length > 1 ? "es" : ""}`}
              </Button>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg border border-muted-foreground/20">
              <p className="text-sm text-muted-foreground text-center">
                <strong>⚠️ Lembre-se:</strong> Você pode escolher de 0 a 2
                jogadores para serem eliminados junto com o Homem-bomba. Clique
                nos jogadores para selecioná-los ou deselecioná-los.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Game Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Game Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">{getPhaseText()}</h2>
                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="outline">
                      Civis: {stats.civilPercentage}%
                    </Badge>
                    <Badge variant="outline">
                      Máfia: {stats.mafiaPercentage}%
                    </Badge>
                    <Badge variant="outline">
                      Jogadores vivos: {stats.aliveCount}
                    </Badge>
                  </div>
                </div>

                {/* Botões - Desktop (telas grandes) */}
                <div className="hidden lg:flex gap-2">
                  <Dialog
                    open={showRolesModal}
                    onOpenChange={setShowRolesModal}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Cargos
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] max-w-[95vw] sm:max-w-md overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Cargos dos Jogadores</DialogTitle>
                      </DialogHeader>
                      <div className="overflow-y-auto max-h-[70vh]">
                        <PlayersList
                          hostNick={hostNick}
                          players={players}
                          onHostNickChange={() => {}}
                          onAddPlayer={() => {}}
                          onRemovePlayer={() => {}}
                          gameStarted={true}
                          showRoles={true}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <UserX className="h-4 w-4 mr-1" />
                        Eliminar agora
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Eliminar Jogador</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Select
                          value={eliminatePlayerId}
                          onValueChange={setEliminatePlayerId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar jogador..." />
                          </SelectTrigger>
                          <SelectContent>
                            {alivePlayers.map((player) => (
                              <SelectItem key={player.id} value={player.id}>
                                {player.nick} ({player.role})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={handleEliminateNow}
                          disabled={!eliminatePlayerId}
                          variant="destructive"
                          className="w-full"
                        >
                          Confirmar Eliminação
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => send({ type: "END_GAME" })}
                  >
                    <StopCircle className="h-4 w-4 mr-1" />
                    Encerrar agora
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Verificar vencedor usando função correta
                      const winCondition = checkWinConditions(players);

                      if (winCondition.gameOver) {
                        send({
                          type: "END_GAME",
                          winningTeam: winCondition.winningTeam,
                        });

                        // Adicionar mensagem explicativa
                        send({
                          type: "ADD_MESSAGE",
                          message: {
                            level: "INFO",
                            text: `JOGO ENCERRADO: ${winCondition.reason}`,
                          },
                        });
                      } else {
                        alert(winCondition.reason);
                      }
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Verificar vencedor
                  </Button>
                </div>

                {/* Menu Dropdown - Mobile e Tablet (telas médias e pequenas) */}
                <div className="lg:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Menu className="h-4 w-4 mr-1" />
                        Menu
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <Dialog
                        open={showRolesModal}
                        onOpenChange={setShowRolesModal}
                      >
                        <DialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="cursor-pointer"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Cargos
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] max-w-[95vw] sm:max-w-md overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Cargos dos Jogadores</DialogTitle>
                          </DialogHeader>
                          <div className="overflow-y-auto max-h-[70vh]">
                            <PlayersList
                              hostNick={hostNick}
                              players={players}
                              onHostNickChange={() => {}}
                              onAddPlayer={() => {}}
                              onRemovePlayer={() => {}}
                              gameStarted={true}
                              showRoles={true}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="cursor-pointer"
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Eliminar agora
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Eliminar Jogador</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Select
                              value={eliminatePlayerId}
                              onValueChange={setEliminatePlayerId}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecionar jogador..." />
                              </SelectTrigger>
                              <SelectContent>
                                {alivePlayers.map((player) => (
                                  <SelectItem key={player.id} value={player.id}>
                                    {player.nick} ({player.role})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              onClick={handleEliminateNow}
                              disabled={!eliminatePlayerId}
                              variant="destructive"
                              className="w-full"
                            >
                              Confirmar Eliminação
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <DropdownMenuItem
                        onClick={() => send({ type: "END_GAME" })}
                        className="cursor-pointer text-red-600 focus:text-red-600"
                      >
                        <StopCircle className="h-4 w-4 mr-2" />
                        Encerrar agora
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => {
                          // Verificar vencedor usando função correta
                          const winCondition = checkWinConditions(players);

                          if (winCondition.gameOver) {
                            send({
                              type: "END_GAME",
                              winningTeam: winCondition.winningTeam,
                            });

                            // Adicionar mensagem explicativa
                            send({
                              type: "ADD_MESSAGE",
                              message: {
                                level: "INFO",
                                text: `JOGO ENCERRADO: ${winCondition.reason}`,
                              },
                            });
                          } else {
                            alert(winCondition.reason);
                          }
                        }}
                        className="cursor-pointer text-green-600 focus:text-green-600"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verificar vencedor
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Night Actions */}
          {isNightPhase && (
            <Card>
              <CardHeader>
                <CardTitle>Ações da Noite</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Agir como:</Label>
                    <Select
                      value={selectedActor}
                      onValueChange={setSelectedActor}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar jogador..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableActors.map((player) => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.nick} ({player.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Contra:</Label>
                    <Select
                      value={selectedTarget}
                      onValueChange={setSelectedTarget}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar alvo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {alivePlayers
                          .filter((p) => p.id !== selectedActor)
                          .map((player) => (
                            <SelectItem key={player.id} value={player.id}>
                              {player.nick} ({player.role})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Mostrar ação automática baseada no cargo */}
                  {selectedActor && (
                    <div>
                      <Label>Ação automática:</Label>
                      <div className="text-sm text-muted-foreground p-2 border rounded">
                        {(() => {
                          const actor = players.find(
                            (p) => p.id === selectedActor
                          );
                          if (!actor?.role) return "Selecione um jogador";
                          const action = getRoleAction(actor);
                          if (!action)
                            return `${actor.role} não possui ação noturna`;

                          const actionNames: Record<ActionType, string> = {
                            ASSASSINAR: "Assassinar",
                            PROTEGER: "Proteger",
                            INVESTIGAR: "Investigar",
                            SILENCIAR: "Silenciar",
                            PARALISAR: "Paralisar",
                            FOTOGRAFAR: "Fotografar",
                            POSSUIR: "Possuir",
                            DEFENDER: "Defender",
                            EXECUTAR: "Executar",
                            PRENDER: "Prender",
                            FADAR: "Fadar",
                            PSICOPATIZAR: "Psicopatizar",
                          };

                          return actionNames[action] || action;
                        })()}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleRecordAction}
                    disabled={!selectedActor || !selectedTarget}
                  >
                    Registrar Ação
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => send({ type: "GO_TO_EVENTS" })}
                  >
                    Ir para os acontecimentos
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Events Phase */}
          {isEventsPhase && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Acontecimentos da Noite {state.context.round}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Ações processadas */}
                {state.context.actions.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Ações executadas:</h4>
                    {state.context.actions.map((action) => {
                      const actor = players.find(
                        (p) => p.id === action.actorId
                      );
                      const target = players.find(
                        (p) => p.id === action.targetId
                      );

                      return (
                        <div
                          key={action.id}
                          className="p-2 bg-muted rounded text-sm"
                        >
                          <span
                            className={`inline-block w-2 h-2 rounded-full mr-2 ${
                              action.status === "VALID"
                                ? "bg-green-500"
                                : action.status === "ANULLED"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                            }`}
                          ></span>
                          {actor?.role} ({actor?.nick}) → {action.type} →{" "}
                          {target?.nick}
                          {action.status === "ANULLED" && (
                            <div className="text-red-600 ml-2 mt-1 text-xs">
                              (ANULADA:{" "}
                              {(action.meta as { reason?: string })?.reason ||
                                "Motivo não especificado"}
                              )
                              {(action.meta as { reflectedTo?: string })
                                ?.reflectedTo && (
                                <div className="text-orange-600 font-semibold">
                                  ⚡ Ação refletida de volta para {actor?.nick}!
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Nenhuma ação foi executada durante a noite.
                  </p>
                )}

                <Button
                  onClick={() => send({ type: "GO_TO_DAY" })}
                  className="w-full"
                >
                  Avançar para o Dia
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Day Phase */}
          {isDayPhase && (
            <div className="space-y-4">
              {/* Dice Actions */}
              {hasPendingDice && (
                <Card>
                  <CardHeader>
                    <CardTitle>🎲 Resolução de Dados</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Há ações que requerem dados para serem resolvidas.
                      Processe-as antes da votação.
                    </div>

                    {pendingDiceActions.map((action) => {
                      const actor = players.find(
                        (p) => p.id === action.actorId
                      );
                      const target = players.find(
                        (p) => p.id === action.targetId
                      );

                      return (
                        <div
                          key={action.id}
                          className="p-4 border rounded-lg space-y-3"
                        >
                          <div className="font-medium">
                            {action.type === "FADAR"
                              ? "🧚‍♀️ Fada"
                              : "🔪 Psicopata"}
                            : {actor?.nick} → {target?.nick}
                          </div>

                          <div className="text-sm text-muted-foreground">
                            {action.type === "FADAR"
                              ? "Fada - 1: Paralisar, 2: Fotografar, 3: Matar, 4: Silenciar, 5: Investigar, 6: Matar"
                              : "Psicopata - 1,3,5: Matar | 2,4,6: Sobreviver"}
                          </div>

                          {currentDiceAction?.id === action.id ? (
                            <div className="space-y-3">
                              <div>
                                <Label>Resultado do dado (1-6)</Label>
                                <Select
                                  value={diceValue.toString()}
                                  onValueChange={(v) =>
                                    setDiceValue(parseInt(v))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[1, 2, 3, 4, 5, 6].map((num) => (
                                      <SelectItem
                                        key={num}
                                        value={num.toString()}
                                      >
                                        {num}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="flex gap-2">
                                <Button onClick={handleProcessDice}>
                                  Processar Resultado
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setCurrentDiceAction(null)}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button onClick={() => startDiceInput(action)}>
                              Inserir Resultado do Dado
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {/* Day Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Fase do Dia</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => send({ type: "START_VOTING" })}
                    disabled={hasPendingDice}
                  >
                    {hasPendingDice
                      ? "Resolva os dados primeiro"
                      : "Iniciar Votação"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Voting */}
          {isVotingPhase && (
            <VotingPanel
              players={alivePlayers}
              votes={state.context.votes}
              tiedPlayers={state.context.tiedPlayers}
              protectedPlayerIds={getAngelProtectedPlayers(
                state.context.actions
              )}
              onVote={(targetId: string, votes: number) => {
                send({
                  type: "REGISTER_VOTE",
                  playerId: "host",
                  targetId,
                  votes,
                });
              }}
              onEndVoting={() => send({ type: "END_VOTING" })}
            />
          )}

          {/* Tie Breaker */}
          {isTieBreaker && (
            <TieBreaker
              tiedPlayers={state.context.tiedPlayers || []}
              onRepeatVoting={() => send({ type: "REPEAT_VOTING" })}
              onContinueToNight={() => send({ type: "CONTINUE_TO_NIGHT" })}
            />
          )}

          {/* Tie Voting - Votação entre apenas os jogadores empatados */}
          {isTieVoting && (
            <VotingPanel
              players={alivePlayers}
              votes={state.context.votes}
              tiedPlayers={state.context.tiedPlayers}
              protectedPlayerIds={getAngelProtectedPlayers(
                state.context.actions
              )}
              onVote={(targetId: string, votes: number) => {
                send({
                  type: "REGISTER_VOTE",
                  playerId: "host",
                  targetId,
                  votes,
                });
              }}
              onEndVoting={() => send({ type: "END_VOTING" })}
            />
          )}

          {/* Spirit Revenge */}
          {isSpiritRevenge && state.context.eliminatedSpiritPlayer && (
            <SpiritRevenge
              eliminatedSpirit={state.context.eliminatedSpiritPlayer}
              alivePlayers={alivePlayers}
              onProcessRevenge={(targetId: string) =>
                send({ type: "PROCESS_SPIRIT_REVENGE", targetId })
              }
            />
          )}

          {/* Game Over */}
          {isGameOver && (
            <Card>
              <CardHeader>
                <CardTitle>Fim de Jogo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {state.context.winningTeam && (
                  <div className="text-center">
                    <h3 className="text-2xl font-bold">
                      Time{" "}
                      {state.context.winningTeam === "CIVIL"
                        ? "👑 Civil"
                        : "🗡️ Máfia"}{" "}
                      Venceu!
                    </h3>
                  </div>
                )}

                <Button
                  onClick={() => {
                    send({ type: "RESET_GAME" });
                    // Limpar jogadores locais explicitamente quando nova partida é iniciada
                    setPlayers([]);
                    setHostNick("");
                  }}
                  className="w-full"
                >
                  Nova Partida
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Messages Panel */}
        <div>
          <MessagesPanel
            messages={state.context.messages}
            onClearMessages={() => {
              // Implementar clear messages se necessário
            }}
          />
        </div>
      </div>
    </div>
  );
}
