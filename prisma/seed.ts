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
    { roleCode: "super_admin",  nameTh: "ผู้ดูแลระบบสูงสุด", level: 100 },
    { roleCode: "system_admin", nameTh: "ผู้ดูแลระบบ",       level: 80 },
    { roleCode: "dean",         nameTh: "คณบดี",             level: 70 },
    { roleCode: "dept_admin",   nameTh: "ผู้ดูแลหน่วยงาน",    level: 50 },
    { roleCode: "user",         nameTh: "ผู้ใช้งาน",          level: 30 },
    { roleCode: "viewer",       nameTh: "ผู้ดูข้อมูล",        level: 10 },
  ];

  const roleMap: Record<string, number> = {};
  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { roleCode: r.roleCode },
      update: { nameTh: r.nameTh, level: r.level },
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

  // ==============================================================================
  // 4. Dashboard Demo Data — 3 ฝ่าย + ผู้ใช้ + ประกาศ + การจอง + เอกสาร + โครงการ
  // ==============================================================================
  const itDept = await prisma.department.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, name: "ฝ่ายเทคโนโลยีสารสนเทศ (IT)", contactEmail: "it.law@tu.ac.th", telephone: "02-613-2103", status: "active" },
  });
  const academicDept = await prisma.department.upsert({
    where: { id: 3 },
    update: {},
    create: { id: 3, name: "ฝ่ายวิชาการ", contactEmail: "academic.law@tu.ac.th", telephone: "02-613-2102", status: "active" },
  });
  const supportDept = await prisma.department.upsert({
    where: { id: 4 },
    update: {},
    create: { id: 4, name: "ฝ่ายสนับสนุน", contactEmail: "support.law@tu.ac.th", telephone: "02-613-2106", status: "active" },
  });
  console.log(`✅ Departments (dashboard): ${itDept.name}, ${academicDept.name}, ${supportDept.name}`);

  // ผู้ใช้ตัวอย่างแจกจ่ายใน 3 ฝ่าย
  const sampleUsers: Array<{ email: string; fn: string; ln: string; deptId: number; roleCode: string }> = [
    { email: "it1@tulaw.ac.th", fn: "อดิศร", ln: "วงศ์เทค", deptId: itDept.id, roleCode: "user" },
    { email: "it2@tulaw.ac.th", fn: "กฤษณา", ln: "คีย์บอร์ด", deptId: itDept.id, roleCode: "dept_admin" },
    { email: "it3@tulaw.ac.th", fn: "วิทยา", ln: "เซิร์ฟเวอร์", deptId: itDept.id, roleCode: "user" },
    { email: "ac1@tulaw.ac.th", fn: "ปาริชา", ln: "เปเปอร์", deptId: academicDept.id, roleCode: "user" },
    { email: "ac2@tulaw.ac.th", fn: "ชลธิชา", ln: "คอร์ส", deptId: academicDept.id, roleCode: "dept_admin" },
    { email: "ac3@tulaw.ac.th", fn: "กมล", ln: "เกรด", deptId: academicDept.id, roleCode: "user" },
    { email: "sp1@tulaw.ac.th", fn: "ศิริลักษณ์", ln: "ซัพพอร์ต", deptId: supportDept.id, roleCode: "user" },
    { email: "sp2@tulaw.ac.th", fn: "นรินทร์", ln: "เน็ตเวิร์ก", deptId: supportDept.id, roleCode: "user" },
    { email: "sp3@tulaw.ac.th", fn: "สุพจน์", ln: "ซ่อมบำรุง", deptId: supportDept.id, roleCode: "user" },
  ];

  const createdUserIds: string[] = [];
  for (const u of sampleUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash, status: UserStatus.ACTIVE, departmentId: u.deptId },
      create: {
        email: u.email,
        firstNameTh: u.fn,
        lastNameTh: u.ln,
        departmentId: u.deptId,
        passwordHash,
        status: UserStatus.ACTIVE,
      },
    });
    createdUserIds.push(user.id);
    const roleId = roleMap[u.roleCode];
    const existingRole = await prisma.userRole.findFirst({ where: { userId: user.id, roleId } });
    if (!existingRole) {
      await prisma.userRole.create({ data: { userId: user.id, roleId, isActive: true } });
    }
  }
  console.log(`✅ Sample users: ${sampleUsers.length} คน (กระจาย 3 ฝ่าย)`);

  // ─── Demo data (announcements, bookings, documents, projects) ───
  try {
  // หมวดหมู่ประกาศ (skip if already exists)
  const categoryNames = ["ประกาศด่วน", "เชิญชวน", "ประกาศผล", "นโยบาย"];
  const categoryMap: Record<string, number> = {};
  for (const name of categoryNames) {
    try {
      let cat = await prisma.announcementCategory.findFirst({ where: { name } });
      if (!cat) {
        cat = await prisma.announcementCategory.create({ data: { name, isActive: true } });
      }
      categoryMap[name] = cat.id;
    } catch { /* category may already exist from previous run */ }
  }
  // Fallback: if no categories created, use whatever exists
  if (Object.keys(categoryMap).length === 0) {
    const existing = await prisma.announcementCategory.findMany();
    existing.forEach((c) => { categoryMap[c.name] = c.id; });
  }
  console.log(`✅ Announcement categories: ${Object.keys(categoryMap).join(", ") || "(existing)"}`);

  const publisher = await prisma.user.findFirst({ where: { email: "deptadmin@tulaw.ac.th" } })
    ?? (await prisma.user.findFirst());
  const publisherId = publisher?.id ?? createdUserIds[0];

  // วันที่ช่วยคำนวณ
  const now = new Date();
  const monthsAgo = (n: number, day = 15): Date => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - n);
    d.setDate(day);
    d.setHours(10, 0, 0, 0);
    return d;
  };
  const weekStart = (() => {
    const d = new Date(now);
    const dow = d.getDay();
    const diff = dow === 0 ? -6 : 1 - dow;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  })();
  const dayThisWeek = (offset: number): Date => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + offset);
    d.setHours(10, 0, 0, 0);
    return d;
  };

  // ประกาศ (กระจาย publishDate ย้อนหลังหลายเดือน)
  const announcementSeed: Array<{ title: string; cat: string; deptId: number; monthsAgo: number }> = [
    { title: "ประกาศรายชื่อผู้มีสิทธิ์สอบข้อเขียน", cat: "ประกาศผล", deptId: academicDept.id, monthsAgo: 0 },
    { title: "ขอเชิญร่วมงานสัมมนาวิชาการประจำปี 2568", cat: "เชิญชวน", deptId: academicDept.id, monthsAgo: 1 },
    { title: "แจ้งกำหนดการลงทะเบียนเรียนภาค 1/2568", cat: "ประกาศด่วน", deptId: academicDept.id, monthsAgo: 2 },
    { title: "ปิดปรับปรุงระบบเครือข่ายคณะ วันอาทิตย์นี้", cat: "ประกาศด่วน", deptId: itDept.id, monthsAgo: 0 },
    { title: "อบรมใช้งานระบบ TULAW ONE PLATFORM", cat: "เชิญชวน", deptId: itDept.id, monthsAgo: 3 },
    { title: "นโยบายการใช้อาคารเรียนคณะนิติศาสตร์", cat: "นโยบาย", deptId: supportDept.id, monthsAgo: 4 },
    { title: "ขยายเวลารับสมัครทุนการศึกษาประจำปี 2568", cat: "เชิญชวน", deptId: supportDept.id, monthsAgo: 5 },
    { title: "แจ้งตารางซ่อมบำรุงคอมพิวเตอร์รวม", cat: "ประกาศด่วน", deptId: supportDept.id, monthsAgo: 1 },
  ];
  let annCount = 0;
  for (const a of announcementSeed) {
    const exists = await prisma.announcement.findFirst({ where: { title: a.title } });
    if (exists) continue;
    if (!categoryMap[a.cat]) continue; // skip if category not found
    await prisma.announcement.create({
      data: {
        title: a.title,
        content: `รายละเอียดของประกาศ "${a.title}"`,
        category: { connect: { id: categoryMap[a.cat] } },
        department: a.deptId ? { connect: { id: a.deptId } } : undefined,
        publisher: { connect: { id: publisherId } },
        publishDate: monthsAgo(a.monthsAgo),
        status: "published",
      },
    }).catch(() => { /* skip duplicates */ });
    annCount++;
  }
  console.log(`✅ Announcements: เพิ่ม ${annCount} รายการ`);

  // ห้องประชุม + การจอง
  const getOrCreateRoom = async (name: string, capacity: number) => {
    const existing = await prisma.meetingRoom.findFirst({ where: { name } });
    if (existing) return existing;
    return prisma.meetingRoom.create({ data: { name, capacity } });
  };
  const roomA = await getOrCreateRoom("ห้องประชุม 201", 20);
  const roomB = await getOrCreateRoom("ห้องประชุมใหญ่ ชั้น 3", 60);

  const bookingSeed: Array<{ title: string; roomId: string; userId: string; start: Date; attendee: number }> = [
    { title: "ประชุมทีม IT รายสัปดาห์", roomId: roomA.id, userId: createdUserIds[0], start: monthsAgo(0, 10), attendee: 8 },
    { title: "ประชุมฝ่ายวิชาการ", roomId: roomA.id, userId: createdUserIds[3], start: monthsAgo(0, 12), attendee: 12 },
    { title: "อบรมบุคลากร", roomId: roomB.id, userId: createdUserIds[6], start: monthsAgo(0, 14), attendee: 30 },
    { title: "สัมมนาวิชาการ", roomId: roomB.id, userId: createdUserIds[4], start: monthsAgo(1, 10), attendee: 45 },
    { title: "ประชุมคณะกรรมการ", roomId: roomB.id, userId: createdUserIds[1], start: monthsAgo(2, 12), attendee: 25 },
    { title: "พบนักศึกษา", roomId: roomA.id, userId: createdUserIds[5], start: monthsAgo(3, 8), attendee: 15 },
    { title: "ประชุมซ่อมบำรุง", roomId: roomA.id, userId: createdUserIds[7], start: monthsAgo(4, 14), attendee: 10 },
    { title: "เวิร์คชอประบบ", roomId: roomB.id, userId: createdUserIds[2], start: monthsAgo(5, 18), attendee: 20 },
    { title: "ประชุมวางแผน", roomId: roomA.id, userId: createdUserIds[8], start: monthsAgo(6, 9), attendee: 14 },
  ];
  let bookingCount = 0;
  for (const b of bookingSeed) {
    const exists = await prisma.roomBooking.findFirst({ where: { title: b.title, startTime: b.start } });
    if (exists) continue;
    const end = new Date(b.start);
    end.setHours(b.start.getHours() + 2);
    await prisma.roomBooking.create({
      data: {
        roomId: b.roomId,
        userId: b.userId,
        title: b.title,
        startTime: b.start,
        endTime: end,
        attendeeCount: b.attendee,
        status: "confirmed",
      },
    });
    bookingCount++;
  }
  console.log(`✅ Room bookings: เพิ่ม ${bookingCount} รายการ`);

  // เอกสาร (ต้องมี StorageFile ก่อน)
  const docSeed: Array<{ title: string; deptId: number; monthsAgo: number }> = [
    { title: "คู่มือการใช้งานระบบ TULAW ONE", deptId: itDept.id, monthsAgo: 0 },
    { title: "เกณฑ์การประเมินรายวิชา", deptId: academicDept.id, monthsAgo: 1 },
    { title: "รายงานการประชุมคณะ", deptId: supportDept.id, monthsAgo: 2 },
    { title: "แผนการเรียนภาค 1/2568", deptId: academicDept.id, monthsAgo: 3 },
    { title: "เอกสารประกอบการอบรม", deptId: itDept.id, monthsAgo: 4 },
    { title: "คู่มือซ่อมบำรุง", deptId: supportDept.id, monthsAgo: 5 },
    { title: "ข้อบังคับการศึกษา", deptId: academicDept.id, monthsAgo: 6 },
    { title: "สรุปงบประมาณฝ่าย IT", deptId: itDept.id, monthsAgo: 2 },
    { title: "บันทึกข้อความประสานงาน", deptId: supportDept.id, monthsAgo: 1 },
    { title: "แบบฟอร์มคำร้องทั่วไป", deptId: academicDept.id, monthsAgo: 0 },
  ];
  let docCount = 0;
  for (const d of docSeed) {
    const exists = await prisma.document.findFirst({ where: { title: d.title } });
    if (exists) continue;
    const storage = await prisma.storageFile.create({
      data: {
        fileName: `${d.title}.pdf`,
        fileSize: BigInt(1024 * (docCount + 1) * 50),
        mimeType: "application/pdf",
        storageProvider: "local",
        path: `/storage/${d.title}.pdf`,
      },
    });
    await prisma.document.create({
      data: {
        title: d.title,
        poolType: "department",
        storageFileId: storage.id,
        departmentId: d.deptId,
        ownerUserId: createdUserIds[docCount % createdUserIds.length],
        createdAt: monthsAgo(d.monthsAgo),
      },
    });
    docCount++;
  }
  console.log(`✅ Documents: เพิ่ม ${docCount} รายการ`);

  // ประเภทโครงการ + โครงการ
  const projectTypeNames = ["วิชาการ", "วิจัย", "ไอที", "งบประมาณ"];
  const projectTypeMap: Record<string, number> = {};
  for (const name of projectTypeNames) {
    const pt = await prisma.projectType.findFirst({ where: { name } });
    if (pt) { projectTypeMap[name] = pt.id; continue; }
    const created = await prisma.projectType.create({ data: { name } });
    projectTypeMap[name] = created.id;
  }

  const projectSeed: Array<{ name: string; type: string; ownerIdx: number; monthsAgo: number; status: string }> = [
    { name: "พัฒนาระบบจองห้องประชุมออนไลน์", type: "ไอที", ownerIdx: 0, monthsAgo: 0, status: "in_progress" },
    { name: "ปรับปรุงหลักสูตรกฎหมายธุรกิจ", type: "วิชาการ", ownerIdx: 3, monthsAgo: 1, status: "in_progress" },
    { name: "โครงการวิจัยกฎหมายดิจิทัล", type: "วิจัย", ownerIdx: 4, monthsAgo: 2, status: "planning" },
    { name: "ปรับปรุงระบบเครือข่ายคณะ", type: "ไอที", ownerIdx: 1, monthsAgo: 3, status: "completed" },
    { name: "จัดทำคู่มือซ่อมบำรุง", type: "งบประมาณ", ownerIdx: 7, monthsAgo: 4, status: "in_progress" },
    { name: "ศึกษาความพึงพอใจนักศึกษา", type: "วิชาการ", ownerIdx: 5, monthsAgo: 5, status: "planning" },
    { name: "ระบบแจ้งซ่อมออนไลน์", type: "ไอที", ownerIdx: 2, monthsAgo: 6, status: "in_progress" },
    { name: "โครงการทุนการศึกษา", type: "งบประมาณ", ownerIdx: 6, monthsAgo: 1, status: "planning" },
  ];
  let projCount = 0;
  for (const p of projectSeed) {
    const exists = await prisma.project.findFirst({ where: { name: p.name } });
    if (exists) continue;
    await prisma.project.create({
      data: {
        projectTypeId: projectTypeMap[p.type],
        name: p.name,
        description: `รายละเอียดโครงการ ${p.name}`,
        status: p.status,
        ownerUserId: createdUserIds[p.ownerIdx % createdUserIds.length],
        createdAt: monthsAgo(p.monthsAgo),
      },
    });
    projCount++;
  }
  console.log(`✅ Projects: เพิ่ม ${projCount} รายการ`);
  } catch (e: unknown) {
    console.log(`⚠ Demo data partial: ${(e as Error)?.message?.slice(0, 80) ?? 'unknown'}... continuing`);
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

