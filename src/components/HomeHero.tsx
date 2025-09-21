// src/components/HomeHero.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Swords, Users, Clock, Shield } from "lucide-react";
import Link from "next/link";

export function HomeHero() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 space-y-8">
      {/* Main CTA */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground">
          Guerras Civis
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          O jogo de estratégia e dedução mais emocionante. Civis contra Máfia em
          uma batalha épica pela sobrevivência.
        </p>

        <Link href="/jogo">
          <Button
            size="lg"
            className="text-lg px-8 py-6 bg-primary hover:bg-primary/90"
          >
            <Swords className="mr-2 h-5 w-5" />
            Iniciar Partida
          </Button>
        </Link>
      </div>

      {/* Game Description */}
      <div className="max-w-4xl mx-auto">
        <Card className="bg-card/50 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              Conhecendo o Guerras Civis
            </CardTitle>
            <CardDescription className="text-lg">
              Um jogo social de dedução e estratégia para 12-18 jogadores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <Users className="h-8 w-8 mx-auto text-blue-500" />
                <h3 className="font-semibold">Dois Times</h3>
                <p className="text-sm text-muted-foreground">
                  <span className="text-blue-500 font-medium">Civis</span> vs{" "}
                  <span className="text-red-500 font-medium">Máfia</span>. Cada
                  time com cargos únicos e habilidades especiais.
                </p>
              </div>

              <div className="text-center space-y-2">
                <Clock className="h-8 w-8 mx-auto text-purple-500" />
                <h3 className="font-semibold">Ciclos de Jogo</h3>
                <p className="text-sm text-muted-foreground">
                  Noites para ações secretas, dias para discussão e votação.
                  Estratégia e timing são essenciais.
                </p>
              </div>

              <div className="text-center space-y-2">
                <Shield className="h-8 w-8 mx-auto text-green-500" />
                <h3 className="font-semibold">Cargos Especiais</h3>
                <p className="text-sm text-muted-foreground">
                  18 cargos únicos com poderes especiais. De Assassinos a Anjos,
                  cada um muda o jogo.
                </p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="font-semibold mb-3 text-center">Como Funciona</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium text-blue-500 mb-2">
                    🏛️ Time Civil
                  </h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Objetivo: Eliminar toda a máfia</li>
                    <li>• Cargos defensivos e investigativos</li>
                    <li>• Aldeão tem voto triplo nas votações</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-red-500 mb-2">
                    🗡️ Time Máfia
                  </h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Objetivo: Dominar a cidade</li>
                    <li>• Cargos ofensivos e de sabotagem</li>
                    <li>• Agem coordenadamente nas noites</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                O host controla o jogo através desta interface. Os jogadores
                interagem no <span className="font-medium">Habbo Hotel</span>{" "}
                enquanto o host gerencia as regras aqui.
              </p>
              <Link href="/como-jogar">
                <Button variant="outline" className="mt-3">
                  Ver Regras Completas
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="text-center pt-8 pb-4 border-t border-border/40 w-full max-w-4xl">
        <p className="text-sm text-muted-foreground">
          Desenvolvido por Frisko. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
