import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { adaptResume, editResumeWithInstruction, syncGithubProjects } from '../services/ai.ts';
import { requireAuth } from '../middleware/auth.ts';
import { HttpError } from '../lib/errors.ts';
import { resumeContentSchema, resumeIdentitySchema } from '@devcareer/shared';

export const resumesRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
    const isDocx = file.mimetype.includes('word') || file.originalname.toLowerCase().endsWith('.docx');
    if (isPdf || isDocx) {
      cb(null, true);
    } else {
      cb(new HttpError(400, 'invalid_file_type', 'Formato não suportado. Envie um arquivo PDF ou DOCX de até 5MB.'));
    }
  },
});

// Upload de currículo (PDF/DOCX) com extração de texto e salvamento no Supabase Storage
resumesRouter.post('/upload', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) throw new HttpError(400, 'file_required', 'Nenhum arquivo enviado.');

    const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
    let extractedText = '';

    if (isPdf) {
      const parser = new (PDFParse as any)({ data: file.buffer });
      const pdfData = await parser.getText();
      extractedText = (pdfData?.text || '').trim();
      if (typeof parser.destroy === 'function') await parser.destroy();
    } else {
      const docxData = await mammoth.extractRawText({ buffer: file.buffer });
      extractedText = (docxData?.value || '').trim();
    }

    if (!extractedText || extractedText.length < 20) {
      throw new HttpError(422, 'parsing_failed', 'Não foi possível extrair o texto do arquivo. Verifique se o arquivo não é uma imagem digitalizada.');
    }

    // Salva o arquivo no bucket privado 'documents' do usuário logado
    const db = req.db!;
    const user = req.user!;
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${user.id}/${Date.now()}-${cleanName}`;

    try {
      await db.storage.from('documents').upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });
    } catch (storageErr) {
      console.warn('[resumes] Aviso: não foi possível salvar cópia no Supabase Storage:', storageErr);
    }

    res.json({
      success: true,
      fileName: file.originalname,
      extractedText,
      storagePath,
    });
  } catch (err) {
    next(err);
  }
});

// Listar currículos do usuário logado
resumesRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const db = req.db!;
    const { data: resumes, error } = await db
      .from('resumes')
      .select('*, resume_versions(*)')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, resumes: resumes || [] });
  } catch (err) {
    next(err);
  }
});

// Salvar / persistir currículo e versão no banco
resumesRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const bodySchema = z.object({
      title: z.string().default('Currículo Principal'),
      content: resumeContentSchema,
      targetRole: z.string().optional(),
    });

    const { title, content, targetRole } = bodySchema.parse(req.body);
    const db = req.db!;
    const user = req.user!;

    // Cria ou atualiza o registro de currículo
    const { data: resumeRow, error: resumeErr } = await db
      .from('resumes')
      .insert({
        user_id: user.id,
        title,
        target_role: targetRole || content.headline || 'Desenvolvedor',
      })
      .select()
      .single();

    if (resumeErr) throw resumeErr;

    // Cria a versão correspondente
    const { data: versionRow, error: versionErr } = await db
      .from('resume_versions')
      .insert({
        user_id: user.id,
        resume_id: resumeRow.id,
        version_number: 1,
        name: 'Versão Inicial',
        content,
      })
      .select()
      .single();

    if (versionErr) throw versionErr;

    res.json({
      success: true,
      resume: resumeRow,
      version: versionRow,
    });
  } catch (err) {
    next(err);
  }
});

// Adaptação de currículo por IA
resumesRouter.post('/adapt', requireAuth, async (req, res, next) => {
  try {
    const bodySchema = z.object({
      baseResume: resumeContentSchema,
      jobAnalysis: z.any(),
      mode: z.enum(['immediate', 'preparation', 'post_training']).default('immediate'),
    });

    const { baseResume, jobAnalysis, mode } = bodySchema.parse(req.body);
    const result = await adaptResume(baseResume, jobAnalysis, mode);

    res.json({
      success: true,
      adaptedContent: result.adaptedContent,
      suggestions: result.suggestions,
      mode,
    });
  } catch (err) {
    next(err);
  }
});

// Edição pontual por instrução, preservando layout e dados pessoais
resumesRouter.post('/edit', requireAuth, async (req, res, next) => {
  try {
    const bodySchema = z.object({
      content: resumeContentSchema,
      instruction: z.string().trim().min(3, 'Descreva a alteração desejada.').max(2000),
      identity: resumeIdentitySchema.partial().default({}),
    });
    const { content, instruction, identity } = bodySchema.parse(req.body);
    const result = await editResumeWithInstruction(content, instruction, identity);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

// Sincronizar e analisar projetos reais do GitHub do aluno
resumesRouter.post('/sync-github', requireAuth, async (req, res, next) => {
  try {
    const bodySchema = z.object({
      githubUrl: z.string().min(1, 'Informe o perfil ou URL do GitHub.'),
      currentResume: resumeContentSchema,
    });
    const { githubUrl, currentResume } = bodySchema.parse(req.body);
    const result = await syncGithubProjects(githubUrl, currentResume);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});
