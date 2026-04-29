import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.warn('🌱 Seeding database...');

  const tenant = await prisma.tenant.upsert({
    where: { id: 'demo-tenant-001' },
    update: {},
    create: {
      id: 'demo-tenant-001',
      companyName: 'Demo Generator Co.',
    },
  });
  console.warn(`✅ Tenant: ${tenant.companyName} (${tenant.id})`);

  const passwordHash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { id: 'demo-admin-001' },
    update: {},
    create: {
      id: 'demo-admin-001',
      tenantId: tenant.id,
      email: 'admin@demo.com',
      passwordHash,
      name: 'Admin User',
      role: 'TENANT_ADMIN',
    },
  });
  console.warn(`✅ Admin: ${admin.email} (password: admin123)`);

  const opPasswordHash = await bcrypt.hash('operator123', 12);
  const operator = await prisma.user.upsert({
    where: { id: 'demo-operator-001' },
    update: {},
    create: {
      id: 'demo-operator-001',
      tenantId: tenant.id,
      email: 'operator@demo.com',
      passwordHash: opPasswordHash,
      name: 'Field Operator',
      role: 'OPERATOR',
    },
  });
  console.warn(`✅ Operator: ${operator.email} (password: operator123)`);

  const fixedRule = await prisma.pricingRule.upsert({
    where: { id: 'demo-pricing-fixed-001' },
    update: {},
    create: {
      id: 'demo-pricing-fixed-001',
      tenantId: tenant.id,
      name: 'Standard Monthly',
      type: 'FIXED',
      basePrice: 500,
    },
  });
  console.warn(`✅ Pricing rule: ${fixedRule.name}`);

  const ampereRule = await prisma.pricingRule.upsert({
    where: { id: 'demo-pricing-ampere-001' },
    update: {},
    create: {
      id: 'demo-pricing-ampere-001',
      tenantId: tenant.id,
      name: 'Ampere-Based Plan',
      type: 'AMPERE_BASED',
      basePrice: 100,
      pricePerAmpere: 10,
    },
  });
  console.warn(`✅ Pricing rule: ${ampereRule.name}`);

  const customer1 = await prisma.customer.upsert({
    where: { id: 'demo-customer-001' },
    update: {},
    create: {
      id: 'demo-customer-001',
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
    where: { id: 'demo-customer-002' },
    update: {},
    create: {
      id: 'demo-customer-002',
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
      id: 'demo-sub-001',
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
    where: { id: 'demo-sub-002' },
    update: {},
    create: {
      id: 'demo-sub-002',
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
