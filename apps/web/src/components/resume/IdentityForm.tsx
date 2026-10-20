import * as React from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { useIdentityStore } from '@/store/useIdentityStore';
import type { ResumeIdentity } from '@devcareer/shared';

const FIELDS: { key: Exclude<keyof ResumeIdentity, 'photoUrl'>; label: string; placeholder: string; type?: string }[] = [
  { key: 'fullName', label: 'Nome completo', placeholder: 'Ex.: Ana Souza' },
  { key: 'email', label: 'E-mail', placeholder: 'voce@email.com', type: 'email' },
  { key: 'phone', label: 'Telefone', placeholder: '(11) 90000-0000', type: 'tel' },
  { key: 'location', label: 'Endereço / Cidade', placeholder: 'São Paulo, SP - Remoto / Híbrido' },
  { key: 'githubUrl', label: 'Perfil do GitHub', placeholder: 'https://github.com/seuperfil' },
  { key: 'linkedinUrl', label: 'Perfil do LinkedIn', placeholder: 'https://linkedin.com/in/seuperfil' },
];

/** Reduz a foto para 320px (JPEG) — cabe no localStorage e não pesa o PDF. */
async function toSmallDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const size = 320;
  const scale = Math.max(size / bitmap.width, size / bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const w = bitmap.width * scale;
  const h = bitmap.height * scale;
  ctx.drawImage(bitmap, (size - w) / 2, (size - h) / 2, w, h);
  return canvas.toDataURL('image/jpeg', 0.85);
}

export function IdentityForm() {
  const { identity, setIdentity, syncFromProfile } = useIdentityStore();
  const fileRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
        <span className="text-xs text-[var(--color-fg-muted)]">Puxar do Perfil do Aluno:</span>
        <button
          type="button"
          onClick={() => syncFromProfile()}
          className="text-xs text-[var(--color-accent)] font-semibold hover:underline cursor-pointer"
        >
          Sincronizar dados do Perfil
        </button>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          id="identity-photo-button"
          onClick={() => fileRef.current?.click()}
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] grid place-items-center cursor-pointer pressable"
          aria-label="Enviar foto de perfil"
        >
          {identity.photoUrl ? (
            <img src={identity.photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <Camera className="h-5 w-5 text-[var(--color-fg-muted)]" />
          )}
        </button>
        <div className="text-xs text-[var(--color-fg-muted)] space-y-1">
          <p>Foto de perfil (opcional). Sem foto, o cabeçalho fica igual ao modelo.</p>
          {identity.photoUrl && (
            <button
              type="button"
              id="identity-photo-remove"
              onClick={() => setIdentity({ photoUrl: '' })}
              className="inline-flex items-center gap-1 text-[var(--color-danger)] cursor-pointer"
            >
              <Trash2 className="h-3 w-3" /> Remover foto
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) setIdentity({ photoUrl: await toSmallDataUrl(f) });
            e.target.value = '';
          }}
        />
      </div>

      {FIELDS.map((f) => (
        <div key={f.key} className="space-y-1">
          <label htmlFor={`identity-${f.key}`} className="block text-[11px] font-semibold text-[var(--color-fg-muted)]">
            {f.label}
          </label>
          <Input
            id={`identity-${f.key}`}
            type={f.type ?? 'text'}
            value={identity[f.key] ?? ''}
            placeholder={f.placeholder}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIdentity({ [f.key]: e.target.value })}
          />
        </div>
      ))}
    </div>
  );
}
