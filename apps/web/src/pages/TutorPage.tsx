import * as React from 'react';
import { apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Bot,
  Send,
  Sparkles,
  HelpCircle,
  Lightbulb,
  Code2,
  CheckCircle2,
  User,
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  codeSnippet?: string;
  nextHint?: string;
  checkQuestion?: string;
}

export function TutorPage() {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'tutor',
      text: 'Olá! Sou seu Professor Particular de Programação no DevCareer AI. Minha missão não é te dar códigos prontos, mas sim te ajudar a dominar a lógica real para que você arrase nas entrevistas técnicas.',
      codeSnippet: '-- Exemplo inicial em SQL:\nSELECT cargo, salario FROM vagas WHERE ativo = true;',
      nextHint: 'Podemos começar revisando como o WHERE funciona ou tirando dúvidas de JavaScript e React!',
      checkQuestion: 'Qual dúvida técnica você gostaria de explorar hoje?',
    },
  ]);
  const [inputQuestion, setInputQuestion] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuestion.trim() || isLoading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: inputQuestion.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const res = await apiRequest<{
        success: boolean;
        reply: {
          explanation: string;
          codeSnippet?: string;
          nextHint?: string;
          checkQuestion?: string;
        };
      }>('/learning/tutor-chat', {
        method: 'POST',
        body: JSON.stringify({
          skill: 'SQL e Desenvolvimento Web',
          question: userMsg.text,
          userLevel: 'iniciante',
          history: messages.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            text: m.text,
          })),
        }),
      });

      const tutorMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'tutor',
        text: res.reply.explanation,
        codeSnippet: res.reply.codeSnippet,
        nextHint: res.reply.nextHint,
        checkQuestion: res.reply.checkQuestion,
      };

      setMessages((prev) => [...prev, tutorMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err`,
          sender: 'tutor',
          text: 'Puxa, tive uma breve oscilação na resposta. Pode repetir sua dúvida técnica?',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 enter">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-fg)] tracking-tight">
            Professor Particular com IA
          </h1>
          <Badge variant="primary">Metodologia Ativa</Badge>
        </div>
        <p className="text-sm text-[var(--color-fg-muted)]">
          Explicações passo a passo, dicas graduais e raciocínio estimulado sem respostas fáceis de copiar.
        </p>
      </div>

      {/* Caixa do Chat Pedagógico */}
      <Card className="bg-[var(--color-surface)] border-[var(--color-border)] shadow-md flex flex-col h-[600px] overflow-hidden">
        {/* Histórico de Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'tutor' && (
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-[#5c4ce6] flex items-center justify-center text-white shrink-0 mt-1">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                  msg.sender === 'user'
                    ? 'bg-[var(--color-accent)] text-white rounded-br-xs'
                    : 'bg-[var(--color-surface-2)] text-[var(--color-fg)] border border-[var(--color-border)] rounded-bl-xs'
                }`}
              >
                <p>{msg.text}</p>

                {msg.codeSnippet && (
                  <pre className="p-3 rounded-lg bg-black/70 text-emerald-400 font-mono text-[11px] overflow-x-auto border border-white/5">
                    <code>{msg.codeSnippet}</code>
                  </pre>
                )}

                {msg.nextHint && (
                  <div className="p-2.5 rounded-lg bg-[var(--color-surface-3)] border border-[var(--color-border)] flex items-start gap-2 text-[var(--color-warning)]">
                    <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
                    <span><strong>Pista Gradual:</strong> {msg.nextHint}</span>
                  </div>
                )}

                {msg.checkQuestion && (
                  <div className="p-2.5 rounded-lg bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/20 text-[var(--color-accent)] font-medium">
                    ❓ {msg.checkQuestion}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="h-8 w-8 rounded-lg bg-[var(--color-surface-3)] flex items-center justify-center text-[var(--color-fg-muted)] shrink-0 mt-1">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-[#5c4ce6] flex items-center justify-center text-white shrink-0">
                <Bot className="h-4 w-4 spin" />
              </div>
              <div className="p-3 rounded-xl bg-[var(--color-surface-2)] text-xs text-[var(--color-fg-muted)]">
                O Professor está elaborando uma dica pedagógica...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input de Pergunta */}
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              placeholder="Digite sua dúvida de código (ex: Por que usamos LEFT JOIN em vez de INNER JOIN?)"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" isLoading={isLoading} className="shrink-0 px-4">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
