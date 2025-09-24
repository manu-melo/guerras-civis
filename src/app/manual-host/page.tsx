// src/app/manual-host/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Info, Users, Crown, Eye, Target } from "lucide-react";

export default function ManualHostPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Manual do Host</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Guia completo para conduzir partidas de Guerras Civis
          </p>
        </div>

        {/* O papel do Host */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />O Papel do Host no
              Guerras Civis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              O Host é a pessoa que conduz as partidas do Guerras Civis para que
              as informações sensíveis sejam controladas e expostas da forma
              certa e no momento certo da partida. O Host não participa da
              partida como jogador, ele faz o papel de controlar o ritmo de
              jogo. <strong>Um Host deve ser sempre imparcial</strong>.
            </p>
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Responsabilidades do Host:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Adicionar os jogadores à partida</li>
                <li>• Receber ações dos jogadores por sussurro</li>
                <li>• Transmitir informações para os jogadores</li>
                <li>
                  • Definir cada tempo de jogo entre a Noite, os Acontecimentos
                  e o Dia
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Posicionamento e Controle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Posicionamento do Host e o Controle da Entrada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              O Host fica separado dos jogadores da partida, mas perto o
              suficiente para que consiga ter acesso fácil às mensagens dos
              jogadores e para que consiga se comunicar bem também. A área do
              Host costuma ser uma cadeira isolada, ou seja, não dá para acessar
              andando pelo quarto, o acesso geralmente é feito por comando de
              voz com wired.
            </p>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Importante</AlertTitle>
              <AlertDescription>
                O Host vai controlar a porta de entrada dos jogadores, abrindo e
                fechando por wired.
                <strong>
                  {" "}
                  O Host só deve começar a partida com 12, 14, 16 ou 18
                  jogadores
                </strong>{" "}
                devidamente sentados nos bancos.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Controle da Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-500" />
              Controle da Interface de Jogo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                📊 Fluxo Básico do Jogo (Visão do Host):
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700 dark:text-blue-300">
                <li>
                  Host acessa o site, clica em Iniciar Partida na página Home
                </li>
                <li>
                  Host adiciona os jogadores de acordo com o nick de cada um no
                  Habbo
                </li>
                <li>Host clica em Guerrear em seguida</li>
                <li>
                  <em>
                    Sistema sorteia os cargos e distribui por nome
                    automaticamente
                  </em>
                </li>
                <li>Host repassa os cargos de cada jogador</li>
                <li>
                  O jogo começa à Noite, depois segue para os Acontecimentos, em
                  seguida para o Dia e o ciclo se repete
                </li>
              </ol>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Detalhamento por Fase:</h4>

              <div className="grid gap-4">
                <div className="bg-gray-900 text-white p-4 rounded-lg">
                  <h5 className="font-semibold text-blue-300 mb-2">🌙 NOITE</h5>
                  <ul className="space-y-1 text-sm">
                    <li>
                      • Após o sorteio dos cargos pelo sistema, o Host informa
                      os cargos sussurrando para cada jogador
                    </li>
                    <li>
                      • Se houver um <strong>Coringa</strong>, o Host deve
                      informar que o dado será rolado para definir o cargo
                    </li>
                    <li>
                      • Host escurece o quarto em azul ou vermelho para
                      sinalizar a noite
                    </li>
                    <li>
                      • Host informa que os jogadores já podem agir enviando uma
                      mensagem para todos no quarto
                    </li>
                    <li>
                      • Jogadores sussurram suas ações → Host registra na ordem
                      que foram enviadas
                    </li>
                    <li>
                      • Host clica para avançar para os acontecimentos da noite
                    </li>
                  </ul>
                </div>

                <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg">
                  <h5 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                    ⚡ ACONTECIMENTOS
                  </h5>
                  <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                    <li>
                      • Host deve trocar a iluminação do quarto para um amarelo
                      escuro
                    </li>
                    <li>
                      • Host diz informações válidas{" "}
                      <strong>sem informar quem agiu</strong>, apenas a ação e o
                      alvo
                    </li>
                    <li>
                      • Exemplo: Jogador Y fotografado (se apareceu Jogador X
                      fotografar Jogador Y)
                    </li>
                    <li>
                      • No caso de eliminação: primeiro dizer Houve morte,
                      depois detalhar e eliminar no Habbo
                    </li>
                    <li>• Host clica para prosseguir para o próximo Dia</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                  <h5 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
                    ☀️ DIA
                  </h5>
                  <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                    <li>• As luzes do quarto voltam ao normal</li>
                    <li>
                      • Momento de rolar os dados para ações válidas da Noite
                      que necessitam de dados
                    </li>
                    <li>
                      • Host informa: Jogador X [ação]. Atenção ao dado:
                      [informações sobre os números]
                    </li>
                    <li>
                      • Host rola o dado no Habbo e registra o número na
                      interface
                    </li>
                    <li>
                      • Após todos os dados, aparecerá o momento da votação
                    </li>
                    <li>
                      • Host informa Podem votar e recebe votos por sussurro
                    </li>
                    <li>
                      • Ao encerrar votação com eliminado, Host elimina também
                      do Habbo
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Sistema de Cores das Ações</AlertTitle>
              <AlertDescription>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Badge variant="secondary">Neutras: Cinza</Badge>
                  <Badge className="bg-green-500">Válidas: Verde</Badge>
                  <Badge className="bg-yellow-500">Anuladas: Amarelo</Badge>
                  <Badge variant="destructive">Eliminações: Vermelho</Badge>
                </div>
              </AlertDescription>
            </Alert>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Condição de Vitória</AlertTitle>
              <AlertDescription>
                O jogo termina quando um time atinge{" "}
                <strong>70% dos jogadores vivos</strong>. O Host deve sempre
                estar atento aos dados do jogo para Verificar vencedor quando a
                porcentagem exibir mais de 70% dos jogadores em 1 dos times.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Dados e Botões */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              Dados e Botões do Jogo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  📊 Dados Disponíveis:
                </h4>
                <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                  <li>
                    • <strong>Civis: X%</strong> (porcentagem atual dos Civis)
                  </li>
                  <li>
                    • <strong>Máfia: X%</strong> (porcentagem atual dos Máfias)
                  </li>
                  <li>
                    • <strong>Jogadores vivos: X</strong> (total de jogadores na
                    partida)
                  </li>
                </ul>
              </div>

              <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                  🎮 Botões Disponíveis:
                </h4>
                <ul className="space-y-1 text-sm text-purple-700 dark:text-purple-300">
                  <li>
                    • <strong>Cargos</strong> (Exibe todos os jogadores e
                    cargos, vivos e mortos)
                  </li>
                  <li>
                    • <strong>Eliminar agora</strong> (Eliminar por
                    desistência/feitiço)
                  </li>
                  <li>
                    • <strong>Encerrar agora</strong> (Encerra sem ganhador)
                  </li>
                  <li>
                    • <strong>Verificar vencedor</strong> (Verifica condição
                    70%)
                  </li>
                </ul>
              </div>
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
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400">
                  Juiz
                </h4>
                <p className="text-sm">
                  Executa alguém uma vez só durante toda partida, se executar
                  Assassino ou Aprendiz, pode executar novamente até que não
                  seja assassino ou aprendiz o alvo, também executa mais uma vez
                  após a morte do Policial.{" "}
                  <em>Tudo isso o sistema já está pronto para processar</em>.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400">
                  Policial
                </h4>
                <p className="text-sm">
                  <strong>
                    Tem o poder de saber todas as ações feitas contra ele
                  </strong>{" "}
                  - sempre que alguma ação noturna válida for feita contra o
                  Policial o Host deve informar por sussurro quem agiu e qual
                  ação contra ele. Além disso, pode prender alguém por uma noite
                  (somente uma vez durante toda a partida), e a pessoa que for
                  presa deve ficar sem agir por 1 noite, podendo agir durante o
                  dia normalmente (votando).
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400">
                  Anjo
                </h4>
                <p className="text-sm">
                  Pode proteger alguém toda noite, exceto a si mesmo. Quando
                  alguém tentar agir contra uma pessoa protegida a ação será
                  anulada e aparecerá na seção de mensagens da direita a ação
                  anulada e o motivo da anulação.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400">
                  Detetive
                </h4>
                <p className="text-sm">
                  Pode descobrir secretamente o cargo de um jogador a cada
                  noite.{" "}
                  <strong>
                    O Host deve estar atento à ação do Detetive para informá-lo
                    o nome e o cargo do jogador que ele investigou
                  </strong>{" "}
                  durante a noite.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400">
                  Aldeão
                </h4>
                <p className="text-sm">
                  Sem ação noturna, mas{" "}
                  <strong>seu voto durante o dia vale 3</strong>. O Host deve
                  estar atento ao registrar o voto do Aldeão durante o dia, deve
                  usar como suporte o botão Cargos para visualizar quem está com
                  cargo de Aldeão, se houver Aldeão na partida.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400">
                  Fada
                </h4>
                <p className="text-sm">
                  Tem o poder de fadar alguém através do dado (acionado no
                  Habbo). O Host gira o dado e a pessoa fadada sofrerá a ação de
                  acordo com os números:{" "}
                  <strong>
                    1. Paralisada, 2. Fotografada, 3. Morta, 4. Silenciada, 5.
                    Investigada, 6. Morta
                  </strong>{" "}
                  - essa mensagem deve ser repassada com uma mensagem para todos
                  no quarto no momento de rolar o dado da ação da fada.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400">
                  Espírito Vingativo
                </h4>
                <p className="text-sm">
                  Ao morrer, leva alguém consigo por sua escolha. Quando um
                  espírito vingativo for eliminado da partida deve aparecer a
                  opção de tirar outra pessoa por conta de sua morte,{" "}
                  <strong>
                    exceto quando o Espírito Vingativo for o último eliminado do
                    time civil
                  </strong>
                  . O Host deve perguntar, com uma mensagem para todos no
                  quarto, quem o Espírito Vingativo vai levar junto na sua
                  eliminação.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400">
                  Escudeiro
                </h4>
                <p className="text-sm">
                  Pode proteger alguém{" "}
                  <strong>refletindo as ações para quem as proferiu</strong>.
                  Por exemplo, se o jogador A é Escudeiro e protege o jogador B,
                  se o jogador C que é assassino agir depois contra o jogador B,
                  o jogador C morrerá. A ação do Escudeiro passa a valer no
                  momento que é aplicada, ou seja, na mesma noite.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400">
                  Coringa
                </h4>
                <p className="text-sm">
                  Tem o poder de realizar uma ação aleatória dos seguintes
                  cargos:{" "}
                  <strong>
                    Assassino, Silenciador, Paralisador, Anjo ou Detetive
                  </strong>
                  . A ação específica é definida por meio do giro do dado, que
                  determinará qual habilidade será ativada e seguirá por toda a
                  partida (isso acontece no início da partida).
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
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-red-600 dark:text-red-400">
                  Assassino
                </h4>
                <p className="text-sm">
                  Tem o poder de assassinar alguém toda noite. A vítima, ao não
                  ser que esteja salva pelo Anjo, ou seja o protegido do
                  Escudeiro (se as ações do anjo ou do Escudeiro forem
                  executadas antes da ação do assassino), será morta.{" "}
                  <em>O sistema processa automaticamente as exceções</em>.
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-red-600 dark:text-red-400">
                  Aprendiz
                </h4>
                <p className="text-sm">
                  Tem o poder de assassinar alguém toda noite,{" "}
                  <strong>apenas após a morte do Assassino</strong>
                  ele adquire essa habilidade.{" "}
                  <em>
                    Nota: sempre deverá haver um assassino ao iniciar a partida,
                    mas nem sempre terá um aprendiz
                  </em>
                  .
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-red-600 dark:text-red-400">
                  Silenciador
                </h4>
                <p className="text-sm">
                  Tem o poder de silenciar alguém toda noite,{" "}
                  <strong>impedindo o silenciado de agir, votar e falar</strong>
                  (se o silenciado falar, é eliminado). Isso vale a partir do
                  momento que a ação é válida e perde o efeito na próxima noite.
                  Quando o silenciado tentar agir aparecerá como ação anulada na
                  seção de mensagens.
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-red-600 dark:text-red-400">
                  Paralisador
                </h4>
                <p className="text-sm">
                  Tem o poder de paralisar alguém toda noite,{" "}
                  <strong>impedindo o paralisado de agir e votar</strong>
                  (basicamente quase tudo igual ao cargo Silenciador, exceto
                  pela proibição de fala que não existe no paralisador).
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-red-600 dark:text-red-400">
                  Bruxa
                </h4>
                <p className="text-sm">
                  Tem o poder de criar um feitiço pelo wired, esse feitiço é
                  basicamente uma{" "}
                  <strong>
                    proibição de falar a palavra determinada pela bruxa
                  </strong>
                  . Ao iniciar a partida a bruxa será solicitada de repassar a
                  palavra do feitiço para o Host no Habbo.{" "}
                  <strong>O feitiço (senha) não pode ser:</strong> risadas,
                  nicknames, palavras com menos de quatro letras, nomes, times e
                  cargos do Guerras Civis.
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-red-600 dark:text-red-400">
                  Paparazzi
                </h4>
                <p className="text-sm">
                  Fotografa alguém toda noite,{" "}
                  <strong>revelando o cargo para todos</strong>. Quando a ação
                  do paparazzi for válida, revele o Cargo do jogador X para
                  todos, sendo o X o jogador alvo.
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-red-600 dark:text-red-400">
                  Homem-bomba
                </h4>
                <p className="text-sm">
                  Ao morrer,{" "}
                  <strong>
                    leva os jogadores à direita e esquerda consigo
                  </strong>
                  . Ao haver uma eliminação de homem-bomba, aparecerá na
                  interface Selecione os jogadores da direita e da esquerda para
                  eliminar e será possível selecionar até 2, mas pode acontecer
                  de não ter jogadores dos dois lados.
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-red-600 dark:text-red-400">
                  Psicopata
                </h4>
                <p className="text-sm">
                  Tem o poder de psicopatizar alguém. A pessoa psicopatizada
                  sofrerá a ação de acordo com os números no dado:{" "}
                  <strong>1, 3 e 5 Morta ou 2, 4 e 6 Salva</strong> (o Host deve
                  informar isso antes de rolar o dado para uma ação do
                  psicopata).
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-red-600 dark:text-red-400">
                  Demônio
                </h4>
                <p className="text-sm">
                  Tem o poder de{" "}
                  <strong>
                    possuir alguém a noite e exercerá o cargo na mesma noite
                  </strong>
                  . O Demônio deve sussurrar ao Host toda noite quem ele quer
                  possuir. Por exemplo, se ele possuir o Anjo, poderá proteger
                  alguém na próxima noite.{" "}
                  <strong>
                    O Host deverá informar ao demônio o cargo de quem ele
                    possuiu na mesma hora
                  </strong>
                  .
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center pt-8 border-t">
          <p className="text-muted-foreground text-sm mb-2">
            Manual do Host - Guerras Civis | Versão 2025
          </p>
          <p className="text-muted-foreground text-xs">
            Desenvolvido por Frisko. Todos os direitos reservados.
          </p>
        </div>
      </main>
    </div>
  );
}
