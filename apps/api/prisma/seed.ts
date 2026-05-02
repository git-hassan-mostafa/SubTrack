import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.warn('🌱 Seeding database...');

  const tenant = await prisma.tenant.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      companyName: 'Generator',
    },
  });
  console.warn(`✅ Tenant: ${tenant.companyName} (${tenant.id})`);

  const passwordHash = await bcrypt.hash('admin123$', 12);
  const admin = await prisma.user.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      tenantId: tenant.id,
      email: 'admin@demo.com',
      passwordHash,
      name: 'Admin',
      role: 'TENANT_ADMIN',
    },
  });
  console.warn(`✅ Admin: ${admin.email} (password: admin123$)`);

  const opPasswordHash = await bcrypt.hash('operator123$', 12);
  const operator = await prisma.user.upsert({
    where: { id: '2' },
    update: {},
    create: {
      id: '2',
      tenantId: tenant.id,
      email: 'operator@demo.com',
      passwordHash: opPasswordHash,
      name: 'Operator',
      role: 'OPERATOR',
    },
  });
  console.warn(`✅ Operator: ${operator.email} (password: operator123$)`);

  const fixedRule = await prisma.pricingRule.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      tenantId: tenant.id,
      name: 'Standard Monthly',
      type: 'FIXED',
      basePrice: 500,
    },
  });
  console.warn(`✅ Pricing rule: ${fixedRule.name}`);

  const ampereRule = await prisma.pricingRule.upsert({
    where: { id: '2' },
    update: {},
    create: {
      id: '2',
      tenantId: tenant.id,
      name: 'Ampere-Based Plan',
      type: 'AMPERE_BASED',
      basePrice: 100,
      pricePerAmpere: 10,
    },
  });
  console.warn(`✅ Pricing rule: ${ampereRule.name}`);

  const customer1 = await prisma.customer.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      tenantId: tenant.id,
      name: 'Ahmed Electronics',
      phone: '+201234567890',
      address: '123 Main Street, Cairo',
      latitude: 30.0444,
      longitude: 31.2357,
      locationAccuracy: 10,
      status: 'ACTIVE',
    },
  });
  console.warn(`✅ Customer: ${customer1.name}`);

  const customer2 = await prisma.customer.upsert({
    where: { id: '2' },
    update: {},
    create: {
      id: '2',
      tenantId: tenant.id,
      name: 'Cairo Factory Hub',
      phone: '+201098765432',
      address: '456 Industrial Zone, Giza',
      status: 'ACTIVE',
    },
  });
  console.warn(`✅ Customer: ${customer2.name}`);

  const sub1 = await prisma.subscription.upsert({
    where: { id: 'demo-sub-001' },
    update: {},
    create: {
      id: '1',
      tenantId: tenant.id,
      customerId: customer1.id,
      planName: 'Standard Monthly Plan',
      pricingRuleId: fixedRule.id,
      startDate: new Date('2024-01-01'),
      status: 'ACTIVE',
    },
  });
  console.warn(`✅ Subscription: ${sub1.planName} for ${customer1.name}`);

  const sub2 = await prisma.subscription.upsert({
    where: { id: '2' },
    update: {},
    create: {
      id: '2',
      tenantId: tenant.id,
      customerId: customer2.id,
      planName: 'Industrial Ampere Plan',
      pricingRuleId: ampereRule.id,
      startDate: new Date('2024-03-01'),
      status: 'ACTIVE',
      amperes: 150,
    },
  });
  console.warn(`✅ Subscription: ${sub2.planName} for ${customer2.name}`);

  console.warn('\n🎉 Seed complete! Login: admin@demo.com / admin123');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
