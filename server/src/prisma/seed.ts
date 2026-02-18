import { PrismaClient, WorkspaceRole } from '@prisma/client';
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

// ─── Role → Permission Mapping (legacy, for backward compat) ──
const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: [
    'create_project', 'update_project', 'delete_project', 'manage_members',
    'create_task', 'update_task', 'move_task', 'delete_task', 'assign_task',
    'comment_task', 'manage_users',
  ],
  PROJECT_MANAGER: [
    'create_project', 'update_project', 'manage_members',
    'create_task', 'update_task', 'move_task', 'delete_task', 'assign_task',
    'comment_task',
  ],
  DEVELOPER: [
    'create_task', 'update_task', 'move_task', 'assign_task', 'comment_task',
  ],
  VIEWER: [
    'comment_task',
  ],
};

// ─── Role Descriptions (legacy) ─────────────────
const ROLES = [
  { name: 'ADMIN', description: 'Full system access, can manage users, roles, and all resources' },
  { name: 'PROJECT_MANAGER', description: 'Can manage projects, tasks, and members' },
  { name: 'DEVELOPER', description: 'Can create and manage tasks, add comments' },
  { name: 'VIEWER', description: 'Read-only access with ability to comment' },
];

async function seed() {
  console.log('🌱 Starting database seed...\n');

  // ─── Create Permissions (legacy) ──────────────
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

  // ─── Create Roles (legacy) ────────────────────
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

  // ─── Assign Permissions to Roles (legacy) ─────
  console.log('\n🔗 Assigning permissions to roles...');

  for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
    const roleId = roleMap.get(roleName)!;
    await prisma.rolePermission.deleteMany({ where: { roleId } });

    for (const permName of permissions) {
      const permissionId = permissionMap.get(permName)!;
      await prisma.rolePermission.create({
        data: { roleId, permissionId },
      });
    }
    console.log(`  ✅ ${roleName}: ${permissions.length} permissions`);
  }

  // ─── Create Admin User + Default Workspace ────
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

  // Assign ADMIN role (legacy)
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

  // Create default workspace for admin (OWNER)
  let adminWorkspace = await prisma.workspace.findFirst({
    where: { createdById: adminUser.id },
  });

  if (!adminWorkspace) {
    adminWorkspace = await prisma.workspace.create({
      data: {
        name: "Admin's Workspace",
        createdById: adminUser.id,
      },
    });

    await prisma.workspaceMember.create({
      data: {
        userId: adminUser.id,
        workspaceId: adminWorkspace.id,
        role: WorkspaceRole.OWNER,
      },
    });
  }

  console.log(`  ✅ Admin user created with workspace "${adminWorkspace.name}"`);

  // ─── Create Sample Users + Workspace Memberships ──
  console.log('\n👤 Creating sample users...');

  const sampleUsers = [
    { email: 'pm@projectmanager.com', firstName: 'Jane', lastName: 'Manager', legacyRole: 'PROJECT_MANAGER', workspaceRole: WorkspaceRole.PROJECT_MANAGER },
    { email: 'dev@projectmanager.com', firstName: 'John', lastName: 'Developer', legacyRole: 'DEVELOPER', workspaceRole: WorkspaceRole.DEVELOPER },
    { email: 'viewer@projectmanager.com', firstName: 'Jane', lastName: 'Viewer', legacyRole: 'VIEWER', workspaceRole: WorkspaceRole.VIEWER },
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

    // Assign legacy role
    const roleId = roleMap.get(userData.legacyRole)!;
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

    // Create personal workspace for user
    const existingWorkspace = await prisma.workspace.findFirst({
      where: { createdById: user.id },
    });

    if (!existingWorkspace) {
      const userWorkspace = await prisma.workspace.create({
        data: {
          name: `${userData.firstName}'s Workspace`,
          createdById: user.id,
        },
      });

      await prisma.workspaceMember.create({
        data: {
          userId: user.id,
          workspaceId: userWorkspace.id,
          role: WorkspaceRole.OWNER,
        },
      });
    }

    // Add user to admin's workspace with workspace role
    const existingMembership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId: user.id, workspaceId: adminWorkspace.id },
      },
    });

    if (!existingMembership) {
      await prisma.workspaceMember.create({
        data: {
          userId: user.id,
          workspaceId: adminWorkspace.id,
          role: userData.workspaceRole,
        },
      });
    }

    console.log(`  ✅ ${userData.email} (${userData.workspaceRole}) / User@123`);
  }

  // ─── Create Sample Project in Admin Workspace ──
  console.log('\n📦 Creating sample project...');

  const existingProject = await prisma.project.findFirst({
    where: {
      workspaceId: adminWorkspace.id,
      name: 'Demo Project',
    },
  });

  if (!existingProject) {
    const project = await prisma.project.create({
      data: {
        name: 'Demo Project',
        description: 'A sample project to demonstrate workspace-based project management',
        workspaceId: adminWorkspace.id,
        createdById: adminUser.id,
      },
    });

    // Add admin as project member
    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: adminUser.id,
      },
    });

    console.log(`  ✅ Demo Project created in "${adminWorkspace.name}"`);
  } else {
    console.log(`  ⏭️  Demo Project already exists`);
  }

  console.log('\n✨ Seed completed successfully!');
  console.log('\n📝 Login credentials:');
  console.log('  Admin:   admin@projectmanager.com / Admin@123');
  console.log('  PM:      pm@projectmanager.com / User@123');
  console.log('  Dev:     dev@projectmanager.com / User@123');
  console.log('  Viewer:  viewer@projectmanager.com / User@123');
  console.log(`\n🏢 Admin Workspace ID: ${adminWorkspace.id}`);
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
