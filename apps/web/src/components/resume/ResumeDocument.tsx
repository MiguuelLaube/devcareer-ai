import * as React from 'react';
import { RESUME_LAYOUT, type ResumeContent, type ResumeEditOp } from '@devcareer/shared';
import './resume.css';

interface EditableProps {
  value: string;
  onCommit?: (v: string) => void;
  className?: string;
  placeholder?: string;
  as?: 'span' | 'p' | 'h1' | 'strong';
  multiline?: boolean;
}

/** Texto editável no lugar, sem alterar a tipografia/caixa do bloco. */
function Editable({ value, onCommit, className = '', placeholder, as = 'span', multiline }: EditableProps) {
  const ref = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) ref.current.textContent = value;
  }, [value]);
  const Tag = as as any;
  const editable = Boolean(onCommit);
  return (
    <Tag
      ref={ref}
      contentEditable={editable}
      suppressContentEditableWarning
      spellCheck={false}
      data-placeholder={placeholder}
      className={`${className} ${editable ? 'cv-editable' : ''}`}
      onKeyDown={(e: React.KeyboardEvent) => {
        e.stopPropagation();
        if (e.key === 'Enter' && !multiline) {
          e.preventDefault();
          (e.target as HTMLElement).blur();
        }
      }}
      onPaste={(e: React.ClipboardEvent) => {
        e.preventDefault();
        document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
      }}
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        const next = (e.currentTarget.textContent || '').replace(/\s+/g, ' ').trim();
        if (next !== value) onCommit?.(next);
      }}
    />
  );
}

interface ResumeDocumentProps {
  content: ResumeContent;
  /** Edição inline de blocos de conteúdo. */
  onEdit?: (ops: ResumeEditOp[]) => void;
  /** Edição inline de dados do perfil / cabeçalho. */
  onIdentityChange?: (patch: Record<string, string>) => void;
  /** Destaca blocos alterados pela última edição. */
  highlightPaths?: string[];
}

const sectionTitle = (id: string) => RESUME_LAYOUT.find((b) => b.id === id)?.title ?? '';

/**
 * Renderização fiel do modelo "DEV INICIANTE". A ordem e a forma dos blocos
 * vêm de RESUME_LAYOUT e não dependem do conteúdo — trocar textos nunca
 * muda a estrutura.
 */
export function ResumeDocument({ content, onEdit, onIdentityChange, highlightPaths = [] }: ResumeDocumentProps) {
  const edit = (path: string) => (value: string | string[]) => onEdit?.([{ path, value }]);
  const hl = (prefix: string) => (highlightPaths.some((p) => p === prefix || p.startsWith(prefix + '.')) ? 'cv-changed' : '');
  const contacts: { key: string; value: string; placeholder: string }[] = [
    { key: 'email', value: content.email, placeholder: 'email@devcareer.ai' },
    { key: 'phone', value: content.phone, placeholder: '(00) 00000-0000' },
    { key: 'location', value: content.location, placeholder: 'Cidade, UF' },
  ];

  return (
    <article id="resume-document" className="cv-sheet">
      {/* ── Cabeçalho ───────────────────────────── */}
      <header className="cv-header">
        <div className={`cv-photo ${content.photoUrl ? '' : 'cv-photo--empty'}`} aria-label="Foto de perfil">
          {content.photoUrl && <img src={content.photoUrl} alt={content.fullName || 'Foto de perfil'} />}
        </div>
        <div className="cv-header-text">
          <Editable
            as="h1"
            className="cv-name"
            value={content.fullName}
            placeholder="Nome Completo"
            onCommit={onIdentityChange ? (v) => onIdentityChange({ fullName: v }) : undefined}
          />
          <Editable
            as="p"
            className={`cv-headline ${hl('headline')}`}
            value={content.headline}
            placeholder="Cargo | Foco"
            onCommit={onEdit && edit('headline')}
          />
          <p className="cv-contacts">
            {contacts.map((c, i) => (
              <React.Fragment key={c.key}>
                {i > 0 && contacts.slice(0, i).some((prev) => prev.value) && c.value && <span className="cv-dot">•</span>}
                <Editable
                  as="span"
                  value={c.value}
                  placeholder={c.placeholder}
                  onCommit={onIdentityChange ? (v) => onIdentityChange({ [c.key]: v }) : undefined}
                />
              </React.Fragment>
            ))}
            {content.githubUrl && (
              <>
                <span className="cv-dot">•</span>
                <a href={content.githubUrl.startsWith('http') ? content.githubUrl : `https://${content.githubUrl}`} target="_blank" rel="noreferrer" className="cv-header-link">
                  {content.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//i, 'github.com/')}
                </a>
              </>
            )}
            {content.linkedinUrl && (
              <>
                <span className="cv-dot">•</span>
                <a href={content.linkedinUrl.startsWith('http') ? content.linkedinUrl : `https://${content.linkedinUrl}`} target="_blank" rel="noreferrer" className="cv-header-link">
                  {content.linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, 'linkedin.com/in/')}
                </a>
              </>
            )}
          </p>
        </div>
      </header>

      {/* ── Resumo ──────────────────────────────── */}
      <section className="cv-section">
        <h2 className="cv-title">{sectionTitle('summary')}</h2>
        <Editable
          as="p"
          multiline
          className={`cv-paragraph ${hl('summary')}`}
          value={content.summary}
          onCommit={onEdit && edit('summary')}
        />
      </section>

      {/* ── Competências ────────────────────────── */}
      <section className="cv-section">
        <h2 className="cv-title">{sectionTitle('skills')}</h2>
        <div className={`cv-chips ${hl('skills')}`}>
          {content.skills.map((s, i) => (
            <Editable key={`${i}-${s}`} className="cv-chip" value={s} onCommit={onEdit && edit(`skills.${i}`)} />
          ))}
        </div>
      </section>

      {/* ── Projetos ────────────────────────────── */}
      <section className="cv-section">
        <h2 className="cv-title">{sectionTitle('projects')}</h2>
        <div className="cv-entries">
          {content.projects.map((p, i) => (
            <div key={i} className={`cv-project ${hl(`projects.${i}`)}`}>
              <div className="cv-row">
                <Editable as="strong" className="cv-entry-title" value={p.name} onCommit={onEdit && edit(`projects.${i}.name`)} />
                <Editable className="cv-link" value={p.link ?? ''} placeholder="link" onCommit={onEdit && edit(`projects.${i}.link`)} />
              </div>
              <Editable
                as="p"
                multiline
                className="cv-entry-desc"
                value={p.description}
                onCommit={onEdit && edit(`projects.${i}.description`)}
              />
              <p className="cv-entry-meta">
                Tecnologias:{' '}
                <Editable
                  value={p.technologies.join(', ')}
                  onCommit={
                    onEdit &&
                    ((v) => edit(`projects.${i}.technologies`)(v.split(',').map((t) => t.trim()).filter(Boolean)))
                  }
                />
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Formação ────────────────────────────── */}
      <section className="cv-section">
        <h2 className="cv-title">{sectionTitle('education')}</h2>
        {content.education.map((e, i) => (
          <div key={i} className={`cv-row cv-edu ${hl(`education.${i}`)}`}>
            <span>
              <Editable as="strong" value={e.degree} onCommit={onEdit && edit(`education.${i}.degree`)} />
              {' — '}
              <Editable value={e.institution} onCommit={onEdit && edit(`education.${i}.institution`)} />
            </span>
            <Editable className="cv-muted" value={e.period} onCommit={onEdit && edit(`education.${i}.period`)} />
          </div>
        ))}
      </section>
    </article>
  );
}
