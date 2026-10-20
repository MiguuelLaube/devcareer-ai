import { describe, expect, it } from 'vitest';
import {
  applyIdentity,
  applyEditOps,
  RESUME_TEMPLATE_DEV_INICIANTE,
  resumeContentSchema,
  type ResumeContent,
  type ResumeIdentity,
} from '../src/index.ts';

describe('@devcareer/shared', () => {
  it('validates a valid resume content schema', () => {
    const result = resumeContentSchema.safeParse(RESUME_TEMPLATE_DEV_INICIANTE);
    expect(result.success).toBe(true);
  });

  it('correctly applies identity to resume content without altering work history', () => {
    const customIdentity: ResumeIdentity = {
      fullName: 'Maria da Silva',
      email: 'maria@silva.dev',
      phone: '(11) 91234-5678',
      location: 'São Paulo, SP',
      linkedinUrl: 'https://linkedin.com/in/mariadasilva',
      githubUrl: 'https://github.com/mariadasilva',
      photoUrl: 'https://maria.dev/foto.jpg',
    };

    const merged = applyIdentity(RESUME_TEMPLATE_DEV_INICIANTE, customIdentity);
    expect(merged.fullName).toBe('Maria da Silva');
    expect(merged.email).toBe('maria@silva.dev');
    expect(merged.githubUrl).toBe('https://github.com/mariadasilva');
    expect(merged.experiences).toEqual(RESUME_TEMPLATE_DEV_INICIANTE.experiences);
  });

  it('applies edit ops while preserving other sections', () => {
    const initial: ResumeContent = {
      ...RESUME_TEMPLATE_DEV_INICIANTE,
    };

    const newSummary = 'Desenvolvedor com foco em React e Node.js.';
    const { content, applied } = applyEditOps(initial, [
      {
        op: 'set',
        path: 'summary',
        value: newSummary,
      },
    ]);

    expect(applied.length).toBe(1);
    expect(content.summary).toBe(newSummary);
    expect(content.education).toEqual(initial.education);
  });
});
