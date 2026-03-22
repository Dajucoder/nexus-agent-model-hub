import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'primary' },
    update: {},
    create: {
      name: 'Primary Workspace',
      slug: 'primary',
      description: 'Bootstrap workspace for local validation and operator onboarding',
      plan: 'community'
    }
  });

  await prisma.role.upsert({
    where: {
      tenantId_name: {
        tenantId: tenant.id,
        name: 'owner'
      }
    },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'owner',
      description: 'Tenant owner',
      permissions: ['*'],
      isSystem: true
    }
  });

  const passwordHash = await bcrypt.hash('ChangeMe123!', 12);

  const owner = await prisma.user.upsert({
    where: {
      tenant_email: {
        tenantId: tenant.id,
        email: 'owner@primary.local'
      }
    },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'owner@primary.local',
      passwordHash,
      displayName: 'Bootstrap Admin',
      locale: 'zh-CN',
      role: UserRole.OWNER,
      isEmailVerified: true
    }
  });

  const member = await prisma.user.upsert({
    where: {
      tenant_email: {
        tenantId: tenant.id,
        email: 'member@primary.local'
      }
    },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'member@primary.local',
      passwordHash,
      displayName: 'Workspace Member',
      locale: 'en-US',
      role: UserRole.MEMBER,
      isEmailVerified: true
    }
  });

  const rawApiKey = 'nxa_primary_local_only_key';
  const keyHash = crypto.createHash('sha256').update(rawApiKey).digest('hex');

  await prisma.apiKey.upsert({
    where: { keyHash },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Bootstrap API Key',
      keyHash,
      keyPrefix: rawApiKey.slice(0, 8),
      permissions: ['agents:read', 'agents:call']
    }
  });

  await prisma.auditLog.create({
    data: {
      tenantId: tenant.id,
      userId: owner.id,
      action: 'seed.completed',
      details: {
        ownerUserId: owner.id,
        memberUserId: member.id
      }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
