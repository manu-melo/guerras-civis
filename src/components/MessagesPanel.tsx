// src/components/MessagesPanel.tsx
"use client";

import { Message, MessageLevel } from "@/types/game";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessagesPanelProps {
  messages: Message[];
  onClearMessages?: () => void;
}

export function MessagesPanel({
  messages,
  onClearMessages,
}: MessagesPanelProps) {
  const getMessageColor = (level: MessageLevel): string => {
    switch (level) {
      case "ACTION_VALID":
        return "text-green-600 dark:text-green-400";
      case "ACTION_ANULLED":
        return "text-yellow-600 dark:text-yellow-400";
      case "ELIMINATION":
        return "text-red-600 dark:text-red-400";
      case "NEUTRAL":
        return "text-gray-600 dark:text-gray-400";
      case "INFO":
      default:
        return "text-blue-600 dark:text-blue-400";
    }
  };

  const exportMessages = () => {
    const content = messages
      .map(
        (msg) =>
          `[${new Date(msg.createdAt).toLocaleString("pt-BR")}] ${msg.text}`
      )
      .join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `guerras-civis-log-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyMessages = async () => {
    const content = messages
      .map(
        (msg) =>
          `[${new Date(msg.createdAt).toLocaleString("pt-BR")}] ${msg.text}`
      )
      .join("\n");

    try {
      await navigator.clipboard.writeText(content);
      // Feedback visual poderia ser adicionado aqui
    } catch (err) {
      console.error("Falha ao copiar:", err);
    }
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(messages, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `guerras-civis-messages-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Feed de Mensagens</CardTitle>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyMessages}
            title="Copiar mensagens"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={exportMessages}
            title="Exportar como TXT"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={exportJSON}
            title="Exportar como JSON"
          >
            <Download className="h-4 w-4" />
            <span className="text-xs ml-1">JSON</span>
          </Button>
          {onClearMessages && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearMessages}
              title="Limpar mensagens"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <div className="h-full max-h-[600px] overflow-y-auto px-4 pb-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>Nenhuma mensagem ainda.</p>
              <p className="text-sm">As ações do jogo aparecerão aqui.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "p-2 rounded text-sm font-mono border-l-2 bg-muted/30",
                    getMessageColor(message.level)
                  )}
                  style={{
                    borderLeftColor: "currentColor",
                  }}
                >
                  <div className="break-words whitespace-pre-wrap">
                    {message.text}
                  </div>
                  {message.data && (
                    <div className="text-xs opacity-70 mt-1">
                      {JSON.stringify(message.data)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
