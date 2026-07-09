import { PrismaClient, UserStatus } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  console.log("🌱 Seeding database...\n");

  // ==============================================================================
  // 1. Department — หน่วยงานหลัก
  // ==============================================================================
  const dept = await prisma.department.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "สำนักงานคณะนิติศาสตร์",
      contactEmail: "law@tu.ac.th",
      telephone: "02-613-2101",
      status: "active",
    },
  });
  console.log(`✅ Department: ${dept.name}`);

  // ==============================================================================
  // 2. Roles — 6 บทบาท (RBAC)
  // ==============================================================================
  const rolesData = [
    { roleCode: "super_admin",  nameTh: "ผู้ดูแลระบบสูงสุด" },
    { roleCode: "system_admin", nameTh: "ผู้ดูแลระบบ" },
    { roleCode: "dean",         nameTh: "คณบดี" },
    { roleCode: "dept_admin",   nameTh: "ผู้ดูแลหน่วยงาน" },
    { roleCode: "user",         nameTh: "ผู้ใช้งาน" },
    { roleCode: "viewer",       nameTh: "ผู้ดูข้อมูล" },
  ];

  const roleMap: Record<string, number> = {};
  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { roleCode: r.roleCode },
      update: { nameTh: r.nameTh },
      create: r,
    });
    roleMap[r.roleCode] = role.id;
    console.log(`✅ Role: ${role.nameTh} (${r.roleCode})`);
  }

  // ==============================================================================
  // 3. Users — 6 Role Accounts (all with password: TuLaw@2026!)
  // ==============================================================================
  const passwordHash = await bcrypt.hash("TuLaw@2026!", 12);

  const usersData = [
    { email: "admin@tulaw.ac.th", firstNameTh: "ผู้ดูแล", lastNameTh: "ระบบ", roleCode: "super_admin" },
    { email: "sysadmin@tulaw.ac.th", firstNameTh: "สมชาย", lastNameTh: "ใจดี", roleCode: "system_admin" },
    { email: "dean@tulaw.ac.th", firstNameTh: "สมศรี", lastNameTh: "รักเรียน", roleCode: "dean" },
    { email: "deptadmin@tulaw.ac.th", firstNameTh: "วิชัย", lastNameTh: "มั่นคง", roleCode: "dept_admin" },
    { email: "user@tulaw.ac.th", firstNameTh: "นภา", lastNameTh: "สดใส", roleCode: "user" },
    { email: "viewer@tulaw.ac.th", firstNameTh: "ธนา", lastNameTh: "ปัญญา", roleCode: "viewer" },
  ];

  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash, status: UserStatus.ACTIVE },
      create: {
        email: u.email,
        firstNameTh: u.firstNameTh,
        lastNameTh: u.lastNameTh,
        departmentId: dept.id,
        passwordHash,
        status: UserStatus.ACTIVE,
      },
    });
    console.log(`✅ User: ${u.email} (${u.firstNameTh} ${u.lastNameTh})`);

    // Assign role
    const existingRole = await prisma.userRole.findFirst({
      where: { userId: user.id, roleId: roleMap[u.roleCode] },
    });
    if (!existingRole) {
      await prisma.userRole.create({
        data: { userId: user.id, roleId: roleMap[u.roleCode], isActive: true },
      });
      console.log(`   ↳ Role: ${u.roleCode}`);
    } else {
      console.log(`   ↳ Role already assigned`);
    }
  }

  console.log("\n🎉 Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

