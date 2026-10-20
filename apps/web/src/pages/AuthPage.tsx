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
  const { login, signup, loginWithGoogle, resetPassword } = useAuthStore();
  const [mode, setMode] = React.useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const [message, setMessage] = React.useState<{ text: string; type: 'error' | 'success' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      if (mode === 'signup') {
        const ok = await signup(email, fullName, password);
        if (ok) {
          setMessage({ text: 'Conta criada com sucesso! Verifique seu e-mail ou faça login.', type: 'success' });
          onSuccess();
        }
      } else if (mode === 'login') {
        const ok = await login(email, password);
        if (ok) onSuccess();
      } else {
        await resetPassword(email);
        setMessage({ text: 'Enviamos um link de recuperação para o seu e-mail.', type: 'success' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Erro ao processar autenticação.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setIsGoogleLoading(true);
    setMessage(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setMessage({ text: err.message || 'Erro ao autenticar com o Google.', type: 'error' });
      setIsGoogleLoading(false);
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
            {mode !== 'forgot' && (
              <div className="mb-4">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full flex items-center justify-center gap-2 border-[var(--color-border)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)]"
                  onClick={handleGoogle}
                  isLoading={isGoogleLoading}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.54 0 2.93.56 4.02 1.48l3.01-3.01C17.21 1.76 14.77 1 12 1 7.5 1 3.67 3.56 1.77 7.28l3.66 2.84C6.31 7.15 8.9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.49 12.28c0-.79-.07-1.54-.19-2.28H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.72 2.89c2.18-2.01 3.7-4.97 3.7-8.7z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.43 14.88c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28L1.77 7.48C.64 9.74 0 12.28 0 15s.64 5.26 1.77 7.52l3.66-2.84z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.72-2.89c-1.07.72-2.45 1.16-4.21 1.16-3.1 0-5.69-2.15-6.57-5.12L1.77 16.08C3.67 20.44 7.5 23 12 23z"
                    />
                  </svg>
                  Continuar com Google
                </Button>

                <div className="relative my-4 flex items-center justify-center">
                  <div className="w-full border-t border-[var(--color-border)]" />
                  <span className="absolute bg-[var(--color-surface)] px-2 text-[11px] text-[var(--color-fg-muted)] uppercase tracking-wider">
                    ou com e-mail
                  </span>
                </div>
              </div>
            )}

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
                  placeholder="•••••••• (mínimo 6 caracteres)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              )}

              {message && (
                <div
                  className={`p-3 rounded-lg text-xs border ${
                    message.type === 'success'
                      ? 'bg-[var(--color-success-soft)] border-[var(--color-success)]/30 text-[var(--color-success)]'
                      : 'bg-[var(--color-danger-soft)] border-[var(--color-danger)]/30 text-[var(--color-danger)]'
                  }`}
                >
                  {message.text}
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
                    onClick={() => {
                      setMode('forgot');
                      setMessage(null);
                    }}
                    className="hover:underline hover:text-[var(--color-fg)]"
                  >
                    Esqueceu sua senha?
                  </button>
                  <p>
                    Não tem uma conta?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signup');
                        setMessage(null);
                      }}
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
                    onClick={() => {
                      setMode('login');
                      setMessage(null);
                    }}
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
