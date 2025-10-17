/**
 * Database seeding script
 * Seeds initial data: admin user, default roles, email templates
 */

import { sql, db } from '../src/client.js'
import { users } from '../src/schemas/auth.schema.js'
import { roles, userRoles } from '../src/schemas/permissions.schema.js'
import { emailTemplates } from '../src/schemas/email.schema.js'
import { eq } from 'drizzle-orm'

// Generate IDs (simple implementation, will use nanoid in production)
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

async function seed() {
  console.log('🌱 Starting database seeding...\n')

  try {
    // Step 1: Create default roles
    console.log('1️⃣  Creating default roles...')

    const defaultRoles = [
      {
        id: generateId(),
        name: 'super_admin',
        description: 'Super administrator with all permissions',
        permissions: ['*:*:*'], // Wildcard - all permissions
        isSystem: true,
      },
      {
        id: generateId(),
        name: 'admin',
        description: 'Administrator with most permissions',
        permissions: [
          'read:any:user',
          'create:any:user',
          'update:any:user',
          'delete:any:user',
          'read:any:role',
          'create:any:role',
          'update:any:role',
          'read:any:audit_log',
          'read:any:email',
          'create:any:email',
          'read:any:template',
          'create:any:template',
          'update:any:template',
        ],
        isSystem: true,
      },
      {
        id: generateId(),
        name: 'manager',
        description: 'Manager with limited administrative permissions',
        permissions: ['read:any:user', 'update:own:user', 'read:any:audit_log', 'read:any:email', 'create:any:email'],
        isSystem: true,
      },
      {
        id: generateId(),
        name: 'user',
        description: 'Regular user with basic permissions',
        permissions: ['read:own:profile', 'update:own:profile', 'read:own:audit_log'],
        isSystem: true,
      },
    ]

    for (const role of defaultRoles) {
      // Check if role already exists
      const existing = await db.select().from(roles).where(eq(roles.name, role.name))

      if (existing.length === 0) {
        await db.insert(roles).values(role)
        console.log(`   ✅ Created role: ${role.name}`)
      } else {
        console.log(`   ⏭️  Role already exists: ${role.name}`)
      }
    }

    console.log('✅ Roles seeded\n')

    // Step 2: Create admin user
    console.log('2️⃣  Creating admin user...')

    const adminEmail = 'admin@example.com'
    const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail))

    let adminUserId: string

    if (existingAdmin.length === 0) {
      const adminUser = {
        id: generateId(),
        email: adminEmail,
        name: 'Admin User',
        emailVerified: true,
        role: 'super_admin',
        isActive: true,
      }

      await db.insert(users).values(adminUser)
      adminUserId = adminUser.id

      console.log(`   ✅ Created admin user: ${adminEmail}`)
      console.log(`   ⚠️  Note: Set password via BetterAuth (default: Admin123!)`)
    } else {
      adminUserId = existingAdmin[0].id
      console.log(`   ⏭️  Admin user already exists: ${adminEmail}`)
    }

    console.log('✅ Admin user seeded\n')

    // Step 3: Assign super_admin role to admin user
    console.log('3️⃣  Assigning role to admin user...')

    const superAdminRole = await db.select().from(roles).where(eq(roles.name, 'super_admin'))

    if (superAdminRole.length > 0) {
      const existingAssignment = await db.select().from(userRoles).where(eq(userRoles.userId, adminUserId))

      if (existingAssignment.length === 0) {
        await db.insert(userRoles).values({
          userId: adminUserId,
          roleId: superAdminRole[0].id,
          grantedBy: null, // System grant
        })
        console.log('   ✅ Assigned super_admin role to admin user')
      } else {
        console.log('   ⏭️  Role assignment already exists')
      }
    }

    console.log('✅ Role assignment complete\n')

    // Step 4: Create default email templates
    console.log('4️⃣  Creating default email templates...')

    const defaultTemplates = [
      {
        id: generateId(),
        name: 'verification_email',
        subject: 'Verify your email address',
        mjml: `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text font-size="20px" font-weight="bold">
          Welcome, {{userName}}!
        </mj-text>
        <mj-text>
          Please verify your email address by clicking the button below:
        </mj-text>
        <mj-button href="{{verificationUrl}}">
          Verify Email
        </mj-button>
        <mj-text font-size="12px" color="#666">
          If you didn't create an account, you can safely ignore this email.
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`,
        variables: ['userName', 'verificationUrl'],
        locale: 'en',
        version: 1,
        isActive: true,
        description: 'Email verification template',
      },
      {
        id: generateId(),
        name: 'password_reset',
        subject: 'Reset your password',
        mjml: `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text font-size="20px" font-weight="bold">
          Password Reset Request
        </mj-text>
        <mj-text>
          Hi {{userName}}, we received a request to reset your password.
        </mj-text>
        <mj-button href="{{resetUrl}}">
          Reset Password
        </mj-button>
        <mj-text font-size="12px" color="#666">
          This link will expire in {{expiresIn}}.
        </mj-text>
        <mj-text font-size="12px" color="#666">
          If you didn't request this, please ignore this email.
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`,
        variables: ['userName', 'resetUrl', 'expiresIn'],
        locale: 'en',
        version: 1,
        isActive: true,
        description: 'Password reset template',
      },
      {
        id: generateId(),
        name: 'notification',
        subject: '{{subject}}',
        mjml: `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text font-size="20px" font-weight="bold">
          {{title}}
        </mj-text>
        <mj-text>
          {{message}}
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`,
        variables: ['subject', 'title', 'message'],
        locale: 'en',
        version: 1,
        isActive: true,
        description: 'Generic notification template',
      },
    ]

    for (const template of defaultTemplates) {
      const existing = await db.select().from(emailTemplates).where(eq(emailTemplates.name, template.name))

      if (existing.length === 0) {
        await db.insert(emailTemplates).values(template)
        console.log(`   ✅ Created template: ${template.name}`)
      } else {
        console.log(`   ⏭️  Template already exists: ${template.name}`)
      }
    }

    console.log('✅ Email templates seeded\n')

    console.log('🎉 Database seeding completed successfully!')
    console.log('\n📝 Summary:')
    console.log('   - 4 default roles created')
    console.log('   - 1 admin user created (admin@example.com)')
    console.log('   - 3 email templates created')
    console.log('\n⚠️  Remember to set the admin password via BetterAuth!')
  } catch (error) {
    console.error('\n❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

// Run seeding
seed()
