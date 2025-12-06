import {
  isUserAllowedToEditProjectSchema,
  isUserAllowedToReadProject,
} from '@/server/common/authorization';
import { ApiTokenResource } from '@/server/data/api-token.types';
import { db } from '@/server/data';
import { ApiTokenRepo } from '@/server/data/repo/api-token';
import { createServerFn, json } from '@tanstack/react-start';
import { createHash, randomBytes } from 'crypto';
import * as z from 'zod';
import { subDays } from 'date-fns';
import { $serverAuthenticated } from '../_middlewares/auth';

const resourceSchema = z.object({
  projectId: z.string().min(1),
  branchId: z.string().min(1).nullable().optional(),
  scopes: z
    .array(z.enum(['read', 'write']))
    .min(1, 'At least one scope is required'),
});

const createApiTokenInputValidator = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  resources: z
    .array(resourceSchema)
    .min(1, 'At least one resource is required'),
  expiresAt: z.coerce
    .date()
    .refine((date) => date.getTime() > Date.now(), {
      message: 'Expiration must be in the future',
    })
    .refine(
      (date) => {
        const max = new Date();
        max.setFullYear(max.getFullYear() + 2);
        return date <= max;
      },
      {
        message: 'Expiration cannot exceed 2 years',
      },
    ),
});

const hashToken = (token: string) =>
  createHash('sha256').update(token, 'utf8').digest('hex');

const generateToken = () => `rpt_${randomBytes(32).toString('hex')}`;

export const serverCreateApiToken = createServerFn()
  .middleware([$serverAuthenticated()])
  .inputValidator(createApiTokenInputValidator)
  .handler(async ({ data, context }) => {
    // Enforce per-user unique name
    const existing = await ApiTokenRepo.query.findByNameForUser({
      name: data.name,
      userId: context.user.id,
    });

    if (existing) {
      throw json('token_name_already_used', { status: 409 });
    }

    // Authorization and existence checks per resource
    for (const res of data.resources) {
      const branchId = res.branchId ?? null;

      const canReadProject = isUserAllowedToReadProject(
        context.user,
        res.projectId,
      );

      if (!canReadProject) {
        throw json('unauthorized', { status: 403 });
      }

      if (
        res.scopes.includes('write') &&
        !isUserAllowedToEditProjectSchema(context.user, res.projectId)
      ) {
        throw json('unauthorized', { status: 403 });
      }

      // Ensure project exists
      const project = await db
        .selectFrom('project')
        .select('id')
        .where('id', '=', res.projectId)
        .where('archived_at', 'is', null)
        .executeTakeFirst();

      if (!project) {
        throw json('project_not_found', { status: 404 });
      }

      if (branchId) {
        const branch = await db
          .selectFrom('project_wording_branch')
          .select('id')
          .where('id', '=', branchId)
          .where('project_id', '=', res.projectId)
          .where('archived_at', 'is', null)
          .executeTakeFirst();

        if (!branch) {
          throw json('branch_not_found', { status: 404 });
        }
      }
    }

    const rawToken = generateToken();
    const tokenHash = hashToken(rawToken);

    const created = await ApiTokenRepo.mutate.create({
      name: data.name,
      tokenHash,
      resources: data.resources.map<ApiTokenResource>((res) => ({
        project_id: res.projectId,
        branch_id: res.branchId ?? null,
        scopes: res.scopes,
      })),
      createdByUserId: context.user.id,
      expiresAt: data.expiresAt,
    });

    return {
      token: rawToken,
      tokenId: created.id,
      name: created.name,
      expiresAt: created.expires_at,
      createdAt: created.created_at,
    };
  });

export const serverListApiTokens = createServerFn()
  .middleware([$serverAuthenticated()])
  .handler(async ({ context }) => {
    const tokens = await ApiTokenRepo.query.listByUser(context.user.id);
    const cutoff = subDays(new Date(), 7);

    return {
      tokens: tokens
        .filter((t) => !t.revoked_at || t.revoked_at > cutoff)
        .map((t) => ({
          id: t.id,
          name: t.name,
          expiresAt: t.expires_at,
          revokedAt: t.revoked_at,
          lastUsedAt: t.last_used_at,
          createdAt: t.created_at,
        })),
    };
  });

const revokeTokenValidator = z.object({ tokenId: z.string().min(1) });

export const serverRevokeApiToken = createServerFn()
  .middleware([$serverAuthenticated()])
  .inputValidator(revokeTokenValidator)
  .handler(async ({ data, context }) => {
    const token = await ApiTokenRepo.query.findById(data.tokenId);

    if (!token || token.created_by_user_id !== context.user.id) {
      throw json('not_found', { status: 404 });
    }

    await ApiTokenRepo.mutate.revoke(token.id);

    return { success: true };
  });
