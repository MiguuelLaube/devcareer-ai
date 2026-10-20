import * as React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Bot, ArrowLeft } from 'lucide-react';

interface AuthPageProps {
  onSuccess: () => void;
  onBack: () => void;
}

export function AuthPage({ onSuccess, onBack }: AuthPageProps) {
  const { login, signup } = useAuthStore();
  const [mode, setMode] = React.useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      if (mode === 'signup') {
        await signup(email, fullName, password);
        onSuccess();
      } else if (mode === 'login') {
        await login(email, password);
        onSuccess();
      } else {
        setMessage('Enviamos um link de recuperação para o seu e-mail caso ele exista.');
      }
    } catch (err: any) {
      setMessage(err.message || 'Erro ao processar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 enter">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] pressable cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para início
        </button>

        <Card className="border-[var(--color-border)] shadow-md bg-[var(--color-surface)]">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[#5c4ce6] mb-3">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-xl">
              {mode === 'login' && 'Entrar no DevCareer AI'}
              {mode === 'signup' && 'Criar Conta de Desenvolvedor'}
              {mode === 'forgot' && 'Recuperar Senha'}
            </CardTitle>
            <CardDescription>
              {mode === 'login' && 'Acesse seus diagnósticos de vagas e trilhas de estudo'}
              {mode === 'signup' && 'Prepare-se para o mercado com inteligência artificial'}
              {mode === 'forgot' && 'Informe seu e-mail para receber as instruções'}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <Input
                  label="Nome Completo"
                  placeholder="Ex: Ana Silva"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              )}

              <Input
                label="E-mail"
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {mode !== 'forgot' && (
                <Input
                  label="Senha"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              )}

              {message && (
                <div className="p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-[var(--color-fg)]">
                  {message}
                </div>
              )}

              <Button type="submit" className="w-full" isLoading={isLoading}>
                {mode === 'login' && 'Entrar na Plataforma'}
                {mode === 'signup' && 'Criar Minha Conta'}
                {mode === 'forgot' && 'Enviar Instruções'}
              </Button>
            </form>

            <div className="mt-6 flex flex-col items-center gap-2 text-xs text-[var(--color-fg-muted)]">
              {mode === 'login' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="hover:underline hover:text-[var(--color-fg)]"
                  >
                    Esqueceu sua senha?
                  </button>
                  <p>
                    Não tem uma conta?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="font-semibold text-[var(--color-accent)] hover:underline"
                    >
                      Cadastre-se grátis
                    </button>
                  </p>
                </>
              ) : (
                <p>
                  Já possui cadastro?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="font-semibold text-[var(--color-accent)] hover:underline"
                  >
                    Fazer login
                  </button>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
