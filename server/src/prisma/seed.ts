import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── Permission Definitions ─────────────────────
const PERMISSIONS = [
  { name: 'create_project', description: 'Create new projects', resource: 'project', action: 'create' },
  { name: 'update_project', description: 'Update existing projects', resource: 'project', action: 'update' },
  { name: 'delete_project', description: 'Delete projects', resource: 'project', action: 'delete' },
  { name: 'manage_members', description: 'Add/remove project members', resource: 'project', action: 'manage_members' },
  { name: 'create_task', description: 'Create new tasks', resource: 'task', action: 'create' },
  { name: 'update_task', description: 'Update existing tasks', resource: 'task', action: 'update' },
  { name: 'move_task', description: 'Move task between statuses', resource: 'task', action: 'move' },
  { name: 'delete_task', description: 'Delete tasks', resource: 'task', action: 'delete' },
  { name: 'assign_task', description: 'Assign tasks to users', resource: 'task', action: 'assign' },
  { name: 'comment_task', description: 'Add comments on tasks', resource: 'task', action: 'comment' },
  { name: 'manage_users', description: 'Manage user accounts and roles', resource: 'user', action: 'manage' },
];

// ─── Role → Permission Mapping ──────────────────
const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: [
    'create_project',
    'update_project',
    'delete_project',
    'manage_members',
    'create_task',
    'update_task',
    'move_task',
    'delete_task',
    'assign_task',
    'comment_task',
    'manage_users',
  ],
  PROJECT_MANAGER: [
    'create_project',
    'update_project',
    'manage_members',
    'create_task',
    'update_task',
    'move_task',
    'delete_task',
    'assign_task',
    'comment_task',
  ],
  DEVELOPER: [
    'create_task',
    'update_task',
    'move_task',
    'assign_task',
    'comment_task',
  ],
  VIEWER: [
    'comment_task',
  ],
};

// ─── Role Descriptions ──────────────────────────
const ROLES = [
  { name: 'ADMIN', description: 'Full system access, can manage users, roles, and all resources' },
  { name: 'PROJECT_MANAGER', description: 'Can manage projects, tasks, and members' },
  { name: 'DEVELOPER', description: 'Can create and manage tasks, add comments' },
  { name: 'VIEWER', description: 'Read-only access with ability to comment' },
];

async function seed() {
  console.log('🌱 Starting database seed...\n');

  // ─── Create Permissions ────────────────────
  console.log('📋 Creating permissions...');
  const permissionMap = new Map<string, string>();

  for (const perm of PERMISSIONS) {
    const permission = await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description, resource: perm.resource, action: perm.action },
      create: perm,
    });
    permissionMap.set(perm.name, permission.id);
    console.log(`  ✅ ${perm.name}`);
  }

  // ─── Create Roles ─────────────────────────
  console.log('\n👥 Creating roles...');
  const roleMap = new Map<string, string>();

  for (const roleData of ROLES) {
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: { description: roleData.description },
      create: roleData,
    });
    roleMap.set(roleData.name, role.id);
    console.log(`  ✅ ${roleData.name}`);
  }

  // ─── Assign Permissions to Roles ──────────
  console.log('\n🔗 Assigning permissions to roles...');

  for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
    const roleId = roleMap.get(roleName)!;

    // Remove existing role permissions
    await prisma.rolePermission.deleteMany({ where: { roleId } });

    for (const permName of permissions) {
      const permissionId = permissionMap.get(permName)!;
      await prisma.rolePermission.create({
        data: { roleId, permissionId },
      });
    }
    console.log(`  ✅ ${roleName}: ${permissions.length} permissions`);
  }

  // ─── Create Admin User ────────────────────
  console.log('\n👤 Creating admin user...');

  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@projectmanager.com' },
    update: {},
    create: {
      email: 'admin@projectmanager.com',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Admin',
    },
  });

  // Assign ADMIN role
  const adminRoleId = roleMap.get('ADMIN')!;
  await prisma.userRole.upsert({
    where: {
      userId_roleId: { userId: adminUser.id, roleId: adminRoleId },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRoleId,
    },
  });

  console.log(`  ✅ Admin user created: admin@projectmanager.com / Admin@123`);

  // ─── Create Sample Users ──────────────────
  console.log('\n👤 Creating sample users...');

  const sampleUsers = [
    { email: 'digpalsingh9240@gmail.com', firstName: 'Digpal', lastName: 'Singh', role: 'PROJECT_MANAGER' },
    { email: 'dev@projectmanager.com', firstName: 'John', lastName: 'Developer', role: 'DEVELOPER' },
    { email: 'viewer@projectmanager.com', firstName: 'Jane', lastName: 'Viewer', role: 'VIEWER' },
  ];

  for (const userData of sampleUsers) {
    const password = await bcrypt.hash('User@123', 12);
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        password,
        firstName: userData.firstName,
        lastName: userData.lastName,
      },
    });

    const roleId = roleMap.get(userData.role)!;
    await prisma.userRole.upsert({
      where: {
        userId_roleId: { userId: user.id, roleId },
      },
      update: {},
      create: {
        userId: user.id,
        roleId,
      },
    });

    console.log(`  ✅ ${userData.email} (${userData.role}) / User@123`);
  }

  console.log('\n✨ Seed completed successfully!');
  console.log('\n📝 Login credentials:');
  console.log('  Admin:   admin@projectmanager.com / Admin@123');
  console.log('  PM:      pm@projectmanager.com / User@123');
  console.log('  Dev:     dev@projectmanager.com / User@123');
  console.log('  Viewer:  viewer@projectmanager.com / User@123');
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
