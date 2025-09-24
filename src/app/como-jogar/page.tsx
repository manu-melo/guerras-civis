import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ComoJogarPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Como Jogar</h1>
          <p className="text-xl text-muted-foreground">
            Guia completo do Guerras Civis
          </p>
        </div>

        {/* Conhecendo o Guerras Civis */}
        <Card>
          <CardHeader>
            <CardTitle>Conhecendo o Guerras Civis</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none space-y-4">
            <p>
              Um jogo clássico do universo Habbo, ou seja, um jogo do jogo
              Habbo. Antigamente jogado totalmente de forma manual, anotações de
              todos os cargos, ações, momentos de jogo, tudo em um bloco de
              notas feito por um host do jogo. O host é a pessoa responsável
              pelo guerras civis, por fazer as anotações e repassar o que é
              necessário.
            </p>

            <p>
              Até hoje se tem hosts no Guerras Civis, mas já existem variações
              feitas 100% com wireds, ou seja, sem host. Além disso, temos
              também a variação de Guerras Civis com script dentro do próprio
              Habbo (ou melhor, do Habbo Pirata, já que não existe essa variação
              no Habbo original) mas essa variação com script ainda sim tem um
              host.
            </p>
          </CardContent>
        </Card>

        {/* Como jogar nas versões atuais */}
        <Card>
          <CardHeader>
            <CardTitle>Como jogar nas versões atuais?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              O Guerras Civis é um jogo multijogador, entre{" "}
              <strong>12, 14, 16 ou 18 jogadores</strong>, onde, ao iniciar a
              partida, metade recebe cargos de civis e a outra metade recebe
              cargos de máfia. Cada jogador receberá aleatoriamente um dos
              cargos.
            </p>

            <p>
              À noite, as luzes do quarto (no Habbo) se apagam, e os jogadores
              assumem seus papéis para executar suas respectivas ações. Todas as
              ações serão processadas e narradas em ordem de envio, tornando a
              velocidade e a precisão fatores essenciais para a sobrevivência no
              jogo.
            </p>

            <p>
              Durante o dia, a luz do quarto se acende, e as ações da noite
              serão narradas com detalhes. Em seguida, os jogadores votam em
              quem desejam eliminar da partida. O jogador mais votado será
              expulso do jogo.
            </p>

            <p>
              O jogo é vencido pelo grupo que conseguir eliminar todos os
              membros da equipe adversária ou alcançar uma vantagem
              irreversível, tornando impossível para o time perdedor reverter a
              situação dentro das regras da rodada.
            </p>
          </CardContent>
        </Card>

        {/* Nossa versão */}
        <Card>
          <CardHeader>
            <CardTitle>Como jogar a nossa versão?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Este site veio como uma alternativa entre o manual (super antigo)
              e o script dentro do Habbo (o mais atual), fazendo um meio termo,
              onde o responsável pelo controle do jogo continua sendo o host,
              que vai executar todas as ações por meio do site, com uma tela
              Picture-in-Picture (igual ao PiP do google meet).
            </p>

            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Fluxo do jogo:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  Host acessa o site e clica em &ldquo;Iniciar Partida&rdquo;
                </li>
                <li>
                  Sistema pede autorização para Picture-in-Picture (opcional)
                </li>
                <li>
                  Host adiciona seu nick e os jogadores (12, 14, 16 ou 18)
                </li>
                <li>Clica em &ldquo;Guerrear&rdquo; para iniciar a partida</li>
                <li>Sistema sorteia cargos automaticamente</li>
                <li>
                  Se houver Coringa, sistema pede o resultado do dado (1-5)
                </li>
                <li>
                  Jogo segue o ciclo: Noite → Acontecimentos → Dia → Votação
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Cargos Civis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className="bg-blue-500 text-white">👑 CARGOS CIVIS</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400">
                  Juiz
                </h4>
                <p className="text-sm">
                  Executa alguém uma vez só durante toda partida. Se executar
                  Assassino ou Aprendiz, pode executar novamente até que não
                  seja assassino ou aprendiz o alvo. Também executa mais uma vez
                  após a morte do Policial.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400">
                  Policial
                </h4>
                <p className="text-sm">
                  Tem o poder de saber todas as ações feitas contra ele. Pode
                  prender alguém por uma noite (somente uma vez durante toda a
                  partida), e a pessoa que for presa deve ficar sem agir por 1
                  noite.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400">
                  Anjo
                </h4>
                <p className="text-sm">
                  Pode proteger alguém toda noite, exceto a si mesmo. Quando
                  alguém tentar agir contra uma pessoa protegida a ação será
                  anulada.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400">
                  Detetive
                </h4>
                <p className="text-sm">
                  Pode descobrir secretamente o cargo de um jogador a cada
                  noite.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400">
                  Aldeão
                </h4>
                <p className="text-sm">
                  Sem ação noturna, mas seu voto durante o dia vale 3.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400">
                  Fada
                </h4>
                <p className="text-sm">
                  Tem o poder de &quot;fadar&quot; alguém através do dado. O
                  resultado determina a ação: 1. Paralisada, 2. Fotografada, 3.
                  Morta, 4. Silenciada, 5. Investigada, 6. Morta.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400">
                  Espírito Vingativo
                </h4>
                <p className="text-sm">
                  Ao morrer, leva alguém consigo por sua escolha (exceto se for
                  o último sobrevivente do time).
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400">
                  Escudeiro
                </h4>
                <p className="text-sm">
                  Pode proteger alguém refletindo as ações para quem as
                  proferiu. A proteção vale apenas na noite em que é aplicada.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400">
                  Coringa
                </h4>
                <p className="text-sm">
                  No início da partida, um dado determina qual cargo assumirá
                  (1-5): 1-Assassino, 2-Silenciador, 3-Paralisador, 4-Anjo, 5-Detetive.
                  Continua sendo civil.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cargos Máfia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className="bg-red-500 text-white">🗡️ CARGOS MÁFIA</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-red-600 dark:text-red-400">
                  Assassino
                </h4>
                <p className="text-sm">
                  Tem o poder de assassinar alguém toda noite. A vítima será
                  morta, exceto se estiver protegida pelo Anjo ou Escudeiro.
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-red-600 dark:text-red-400">
                  Aprendiz
                </h4>
                <p className="text-sm">
                  Herda o poder de assassinar apenas após a morte do Assassino.
                  Sempre haverá um Assassino no início, mas nem sempre um
                  Aprendiz.
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-red-600 dark:text-red-400">
                  Silenciador
                </h4>
                <p className="text-sm">
                  Tem o poder de silenciar alguém toda noite, impedindo o
                  silenciado de agir, votar e falar. Se falar, é eliminado.
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-red-600 dark:text-red-400">
                  Paralisador
                </h4>
                <p className="text-sm">
                  Tem o poder de paralisar alguém toda noite, impedindo o
                  paralisado de agir e votar (mas pode falar normalmente).
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-red-600 dark:text-red-400">
                  Bruxa
                </h4>
                <p className="text-sm">
                  Cria um feitiço (palavra proibida) no início do jogo. Quem
                  falar a palavra é eliminado automaticamente.
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-red-600 dark:text-red-400">
                  Paparazzi
                </h4>
                <p className="text-sm">
                  Fotografa alguém toda noite, revelando o cargo para todos.
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-red-600 dark:text-red-400">
                  Homem-bomba
                </h4>
                <p className="text-sm">
                  Ao morrer, pode levar os jogadores à direita e esquerda
                  consigo (até 2 jogadores).
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-red-600 dark:text-red-400">
                  Psicopata
                </h4>
                <p className="text-sm">
                  Tem o poder de &quot;psicopatiar&quot; alguém. Resultado do
                  dado: 1,3,5 = Morta; 2,4,6 = Salva.
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-red-600 dark:text-red-400">
                  Demônio
                </h4>
                <p className="text-sm">
                  Pode possuir alguém toda noite e exercer o cargo na próxima
                  noite. Continua sendo máfia mesmo possuindo cargos civis.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exceções */}
        <Card>
          <CardHeader>
            <CardTitle>Exceções Importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border-l-4 border-yellow-500">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Cargos que podem agir independentemente:
              </h4>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-blue-600 dark:text-blue-400 mb-1">
                    Civis:
                  </h5>
                  <ul className="text-sm space-y-1">
                    <li>• Policial</li>
                    <li>• Detetive</li>
                    <li>• Fada</li>
                    <li>• Escudeiro</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium text-red-600 dark:text-red-400 mb-1">
                    Máfias:
                  </h5>
                  <ul className="text-sm space-y-1">
                    <li>• Paralisador</li>
                    <li>• Paparazzi</li>
                    <li>• Demônio</li>
                  </ul>
                </div>
              </div>

              <p className="text-sm mt-3 text-yellow-800 dark:text-yellow-200">
                <strong>Regra:</strong> Se for ação de outro cargo (que não
                esses), a ação será anulada pois 2 ações não podem ser
                executadas contra o mesmo jogador alvo na mesma noite.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Condições de Vitória */}
        <Card>
          <CardHeader>
            <CardTitle>Condições de Vitória</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  👑 Civis Vencem:
                </h4>
                <ul className="text-sm space-y-1">
                  <li>• Eliminando toda a máfia</li>
                  <li>• Representando &gt;70% dos jogadores vivos</li>
                </ul>
              </div>

              <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                  🗡️ Máfia Vence:
                </h4>
                <ul className="text-sm space-y-1">
                  <li>• Eliminando todos os civis</li>
                  <li>• Representando &gt;70% dos jogadores vivos</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="text-center pt-8 pb-4 border-t border-border/40">
        <p className="text-sm text-muted-foreground">
          Desenvolvido por Frisko. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
