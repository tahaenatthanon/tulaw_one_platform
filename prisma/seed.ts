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
    { email: "admin@tulaw.ac.th", firstNameTh: "ผู้ดูแล", lastNameTh: "ระบบ", roleCode: "super_admin", authSource: "local" },
    { email: "sysadmin@tulaw.ac.th", firstNameTh: "สมชาย", lastNameTh: "ใจดี", roleCode: "system_admin", authSource: "ldap" },
    { email: "dean@tulaw.ac.th", firstNameTh: "สมศรี", lastNameTh: "รักเรียน", roleCode: "dean", authSource: "ldap" },
    { email: "deptadmin@tulaw.ac.th", firstNameTh: "วิชัย", lastNameTh: "มั่นคง", roleCode: "dept_admin", authSource: "ldap" },
    { email: "user@tulaw.ac.th", firstNameTh: "นภา", lastNameTh: "สดใส", roleCode: "user", authSource: "ldap" },
    { email: "viewer@tulaw.ac.th", firstNameTh: "ธนา", lastNameTh: "ปัญญา", roleCode: "viewer", authSource: "ldap" },
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
        authSource: u.authSource,
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
  // 4. Application Categories + Applications (for App Status in Settings & Hub)
  // ==============================================================================
  const appCats: Array<{ name: string }> = [
    { name: "ERP" },
    { name: "E-Office" },
    { name: "Document" },
    { name: "Academic" },
    { name: "HR" },
  ];

  const catMap: Record<string, number> = {};
  for (const cat of appCats) {
    const c = await prisma.applicationCategory.upsert({
      where: { id: appCats.indexOf(cat) + 1 },
      update: { name: cat.name },
      create: { id: appCats.indexOf(cat) + 1, name: cat.name },
    });
    catMap[cat.name] = c.id;
  }
  console.log(`✅ Application Categories: 5 รายการ`);

  const hubApps: Array<{ name: string; category: string }> = [
    { name: "ERP", category: "ERP" },
    { name: "E-Office", category: "E-Office" },
    { name: "จัดการเอกสาร", category: "Document" },
    { name: "งานวิชาการ", category: "Academic" },
    { name: "งานบุคคล", category: "HR" },
  ];

  for (const app of hubApps) {
    const existing = await prisma.application.findFirst({ where: { name: app.name, deletedAt: null } });
    if (!existing) {
      await prisma.application.create({
        data: { name: app.name, categoryId: catMap[app.category], status: "online" },
      });
    }
  }
  console.log(`✅ Applications: 5 รายการ (online)`);

  // ==============================================================================
  // 5. Dashboard Demo Data — 3 ฝ่าย + ผู้ใช้ + ประกาศ + การจอง + เอกสาร + โครงการ
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
  const projectTypeNames = ["วิชาการ", "หลักสูตร", "สัมมนา", "วิจัย", "IT", "งบประมาณ"];
  const projectTypeMap: Record<string, number> = {};
  for (const name of projectTypeNames) {
    const pt = await prisma.projectType.findFirst({ where: { name } });
    if (pt) { projectTypeMap[name] = pt.id; continue; }
    const created = await prisma.projectType.create({ data: { name } });
    projectTypeMap[name] = created.id;
  }

  const projectSeed: Array<{ name: string; type: string; ownerIdx: number; monthsAgo: number; status: string }> = [
    { name: "พัฒนาระบบจองห้องประชุมออนไลน์", type: "IT", ownerIdx: 0, monthsAgo: 0, status: "in_progress" },
    { name: "ปรับปรุงหลักสูตรกฎหมายธุรกิจ", type: "หลักสูตร", ownerIdx: 3, monthsAgo: 1, status: "in_progress" },
    { name: "โครงการวิจัยกฎหมายดิจิทัล", type: "วิจัย", ownerIdx: 4, monthsAgo: 2, status: "planning" },
    { name: "งานสัมมนากฎหมายระหว่างประเทศ", type: "สัมมนา", ownerIdx: 1, monthsAgo: 3, status: "completed" },
    { name: "จัดทำคู่มือซ่อมบำรุง", type: "งบประมาณ", ownerIdx: 7, monthsAgo: 4, status: "in_progress" },
    { name: "ศึกษาความพึงพอใจนักศึกษา", type: "วิชาการ", ownerIdx: 5, monthsAgo: 5, status: "planning" },
    { name: "ระบบแจ้งซ่อมออนไลน์", type: "IT", ownerIdx: 2, monthsAgo: 6, status: "in_progress" },
    { name: "โครงการทุนการศึกษา", type: "งบประมาณ", ownerIdx: 6, monthsAgo: 1, status: "planning" },
  ];
  let projCount = 0;
  for (const p of projectSeed) {
    const exists = await prisma.project.findFirst({ where: { name: p.name } });
    if (exists) continue;
    await prisma.project.create({
      data: {
        projectTypeId: projectTypeMap[p.type] ?? 1,
        name: p.name,
        description: `รายละเอียดโครงการ ${p.name}`,
        status: p.status,
        priority: "medium",
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

  // ==============================================================================
  // 6. Permissions — all 69 permission codes
  // ==============================================================================
  const permissionCodes: Array<{ code: string; nameTh: string; groupName: string }> = [
    // Dashboard
    { code: "DASHBOARD_VIEW", nameTh: "ดูแดชบอร์ด", groupName: "dashboard" },
    { code: "DASHBOARD_MANAGE", nameTh: "จัดการแดชบอร์ด", groupName: "dashboard" },
    // Application Hub
    { code: "APPLICATION_HUB_VIEW", nameTh: "ดูศูนย์กลางแอปพลิเคชัน", groupName: "application_hub" },
    { code: "APPLICATION_HUB_MANAGE", nameTh: "จัดการศูนย์กลางแอปพลิเคชัน", groupName: "application_hub" },
    { code: "APPLICATION_HUB_PIN", nameTh: "ปักหมุดแอปพลิเคชัน", groupName: "application_hub" },
    // Intranet
    { code: "INTRANET_VIEW", nameTh: "ดูอินทราเน็ต", groupName: "intranet" },
    { code: "INTRANET_CREATE", nameTh: "สร้างประกาศ", groupName: "intranet" },
    { code: "INTRANET_EDIT", nameTh: "แก้ไขประกาศ", groupName: "intranet" },
    { code: "INTRANET_DELETE", nameTh: "ลบประกาศ", groupName: "intranet" },
    { code: "INTRANET_PUBLISH", nameTh: "เผยแพร่ประกาศ", groupName: "intranet" },
    // Book Meeting
    { code: "BOOK_MEETING_VIEW", nameTh: "ดูการจองห้องประชุม", groupName: "book_meeting" },
    { code: "BOOK_MEETING_CREATE", nameTh: "จองห้องประชุม", groupName: "book_meeting" },
    { code: "BOOK_MEETING_EDIT", nameTh: "แก้ไขการจอง", groupName: "book_meeting" },
    { code: "BOOK_MEETING_DELETE", nameTh: "ลบการจอง", groupName: "book_meeting" },
    { code: "BOOK_MEETING_APPROVE", nameTh: "อนุมัติการจอง", groupName: "book_meeting" },
    // Documents
    { code: "DOCUMENTS_VIEW", nameTh: "ดูเอกสาร", groupName: "documents" },
    { code: "DOCUMENTS_UPLOAD", nameTh: "อัปโหลดเอกสาร", groupName: "documents" },
    { code: "DOCUMENTS_EDIT", nameTh: "แก้ไขเอกสาร", groupName: "documents" },
    { code: "DOCUMENTS_DELETE", nameTh: "ลบเอกสาร", groupName: "documents" },
    { code: "DOCUMENTS_SHARE", nameTh: "แชร์เอกสาร", groupName: "documents" },
    { code: "DOCUMENTS_MANAGE_POOL", nameTh: "จัดการพูลเอกสาร", groupName: "documents" },
    // Projects
    { code: "PROJECTS_VIEW", nameTh: "ดูโครงการ", groupName: "projects" },
    { code: "PROJECTS_CREATE", nameTh: "สร้างโครงการ", groupName: "projects" },
    { code: "PROJECTS_EDIT", nameTh: "แก้ไขโครงการ", groupName: "projects" },
    { code: "PROJECTS_DELETE", nameTh: "ลบโครงการ", groupName: "projects" },
    { code: "PROJECTS_APPROVE", nameTh: "อนุมัติโครงการ", groupName: "projects" },
    { code: "PROJECTS_MANAGE_ALL", nameTh: "จัดการทุกโครงการ", groupName: "projects" },
    // Users & Roles
    { code: "USERS_VIEW", nameTh: "ดูผู้ใช้", groupName: "users" },
    { code: "USERS_CREATE", nameTh: "สร้างผู้ใช้", groupName: "users" },
    { code: "USERS_EDIT", nameTh: "แก้ไขผู้ใช้", groupName: "users" },
    { code: "USERS_DELETE", nameTh: "ลบผู้ใช้", groupName: "users" },
    { code: "USERS_MANAGE_ROLES", nameTh: "จัดการ Role", groupName: "users" },
    { code: "USERS_MANAGE_PERMISSIONS", nameTh: "จัดการ Permission", groupName: "users" },
    { code: "USERS_AD_SYNC", nameTh: "ซิงค์ Active Directory", groupName: "users" },
    { code: "USERS_BULK_IMPORT", nameTh: "นำเข้า CSV", groupName: "users" },
    // Users & Roles — Bulk Actions (NEW)
    { code: "USERS_BULK_ASSIGN_ROLE", nameTh: "กำหนด Role หลายรายการ", groupName: "users" },
    { code: "USERS_BULK_ENABLE", nameTh: "เปิดใช้งานหลายรายการ", groupName: "users" },
    { code: "USERS_BULK_DISABLE", nameTh: "ปิดใช้งานหลายรายการ", groupName: "users" },
    { code: "USERS_UNLOCK_ACCOUNT", nameTh: "ปลดล็อกบัญชีผู้ใช้", groupName: "users" },
    { code: "USERS_RESET_MFA", nameTh: "รีเซ็ต MFA ผู้ใช้", groupName: "users" },
    { code: "USERS_EXPORT_SELECTED", nameTh: "ส่งออกผู้ใช้ที่เลือก", groupName: "users" },
    // Audit Log
    { code: "AUDIT_LOG_VIEW", nameTh: "ดูบันทึกความปลอดภัย", groupName: "audit_log" },
    { code: "AUDIT_LOG_EXPORT", nameTh: "ส่งออกบันทึก", groupName: "audit_log" },
    { code: "AUDIT_LOG_MANAGE", nameTh: "จัดการบันทึก", groupName: "audit_log" },
    // Settings
    { code: "SETTINGS_VIEW", nameTh: "ดูตั้งค่าระบบ", groupName: "settings" },
    { code: "SETTINGS_MANAGE", nameTh: "จัดการตั้งค่าระบบ", groupName: "settings" },
    { code: "SETTINGS_API_KEYS", nameTh: "จัดการ API Keys", groupName: "settings" },
    { code: "SETTINGS_BRANDING", nameTh: "จัดการแบรนด์", groupName: "settings" },
    { code: "SETTINGS_NOTIFICATION", nameTh: "จัดการการแจ้งเตือน", groupName: "settings" },
    { code: "SETTINGS_SSO", nameTh: "จัดการ SSO", groupName: "settings" },
    // ERP
    { code: "ERP_VIEW", nameTh: "ดู ERP", groupName: "erp" },
    { code: "ERP_MANAGE", nameTh: "จัดการ ERP", groupName: "erp" },
    { code: "ERP_APPROVE", nameTh: "อนุมัติ ERP", groupName: "erp" },
    { code: "ERP_REPORT", nameTh: "ดูรายงาน ERP", groupName: "erp" },
    // E-Office
    { code: "E_OFFICE_VIEW", nameTh: "ดูสารบรรณ", groupName: "e_office" },
    { code: "E_OFFICE_CREATE", nameTh: "สร้างสารบรรณ", groupName: "e_office" },
    { code: "E_OFFICE_APPROVE", nameTh: "อนุมัติสารบรรณ", groupName: "e_office" },
    { code: "E_OFFICE_MANAGE", nameTh: "จัดการสารบรรณ", groupName: "e_office" },
    // Document Management
    { code: "DOCUMENT_MANAGEMENT_VIEW", nameTh: "ดูระบบจัดการเอกสาร", groupName: "document_management" },
    { code: "DOCUMENT_MANAGEMENT_UPLOAD", nameTh: "อัปโหลดเอกสารระบบ", groupName: "document_management" },
    { code: "DOCUMENT_MANAGEMENT_MANAGE", nameTh: "จัดการระบบเอกสาร", groupName: "document_management" },
    { code: "DOCUMENT_MANAGEMENT_OCR", nameTh: "ค้นหา OCR", groupName: "document_management" },
    // Academic
    { code: "ACADEMIC_VIEW", nameTh: "ดูงานวิชาการ", groupName: "academic" },
    { code: "ACADEMIC_MANAGE", nameTh: "จัดการงานวิชาการ", groupName: "academic" },
    { code: "ACADEMIC_EXAM", nameTh: "จัดการสอบ", groupName: "academic" },
    // HR
    { code: "HR_VIEW", nameTh: "ดูข้อมูลบุคคล", groupName: "hr" },
    { code: "HR_MANAGE", nameTh: "จัดการข้อมูลบุคคล", groupName: "hr" },
    { code: "HR_PAYROLL", nameTh: "ดูเงินเดือน", groupName: "hr" },
    { code: "HR_ATTENDANCE", nameTh: "ดูเวลาเข้างาน", groupName: "hr" },
  ];

  const permMap: Record<string, number> = {};
  let permCount = 0;
  for (const p of permissionCodes) {
    const perm = await prisma.permission.upsert({
      where: { code: p.code },
      update: { nameTh: p.nameTh, groupName: p.groupName },
      create: p,
    });
    permMap[p.code] = perm.id;
    permCount++;
  }
  console.log(`✅ Permissions: ${permCount} รายการ`);

  // ==============================================================================
  // 6. Role-Permission Mappings
  // ==============================================================================
  const rolePermissionMap: Record<string, string[]> = {
    super_admin: permissionCodes.map(p => p.code),
    system_admin: permissionCodes.map(p => p.code),
    dean: [
      "DASHBOARD_VIEW", "DASHBOARD_MANAGE",
      "APPLICATION_HUB_VIEW", "APPLICATION_HUB_MANAGE", "APPLICATION_HUB_PIN",
      "INTRANET_VIEW", "INTRANET_CREATE", "INTRANET_EDIT", "INTRANET_PUBLISH",
      "BOOK_MEETING_VIEW", "BOOK_MEETING_CREATE", "BOOK_MEETING_APPROVE",
      "DOCUMENTS_VIEW", "DOCUMENTS_UPLOAD", "DOCUMENTS_EDIT",
      "PROJECTS_VIEW", "PROJECTS_APPROVE",
      "USERS_VIEW",
      "AUDIT_LOG_VIEW", "AUDIT_LOG_EXPORT",
      "ERP_VIEW", "ERP_MANAGE", "ERP_APPROVE", "ERP_REPORT",
      "E_OFFICE_VIEW", "E_OFFICE_CREATE", "E_OFFICE_APPROVE", "E_OFFICE_MANAGE",
      "DOCUMENT_MANAGEMENT_VIEW", "DOCUMENT_MANAGEMENT_UPLOAD", "DOCUMENT_MANAGEMENT_MANAGE", "DOCUMENT_MANAGEMENT_OCR",
      "ACADEMIC_VIEW", "ACADEMIC_MANAGE", "ACADEMIC_EXAM",
      "HR_VIEW", "HR_ATTENDANCE",
    ],
    dept_admin: [
      "DASHBOARD_VIEW", "DASHBOARD_MANAGE",
      "APPLICATION_HUB_VIEW", "APPLICATION_HUB_MANAGE", "APPLICATION_HUB_PIN",
      "INTRANET_VIEW", "INTRANET_CREATE", "INTRANET_EDIT", "INTRANET_DELETE", "INTRANET_PUBLISH",
      "BOOK_MEETING_VIEW", "BOOK_MEETING_CREATE", "BOOK_MEETING_EDIT", "BOOK_MEETING_DELETE", "BOOK_MEETING_APPROVE",
      "DOCUMENTS_VIEW", "DOCUMENTS_UPLOAD", "DOCUMENTS_EDIT", "DOCUMENTS_DELETE", "DOCUMENTS_SHARE", "DOCUMENTS_MANAGE_POOL",
      "PROJECTS_VIEW", "PROJECTS_CREATE", "PROJECTS_EDIT", "PROJECTS_DELETE", "PROJECTS_APPROVE",
      "USERS_VIEW", "USERS_CREATE", "USERS_EDIT",
      "USERS_BULK_ASSIGN_ROLE", "USERS_BULK_ENABLE", "USERS_BULK_DISABLE", "USERS_UNLOCK_ACCOUNT", "USERS_RESET_MFA",
      "AUDIT_LOG_VIEW", "AUDIT_LOG_EXPORT",
      "ERP_VIEW", "ERP_MANAGE", "ERP_REPORT",
      "E_OFFICE_VIEW", "E_OFFICE_CREATE", "E_OFFICE_APPROVE", "E_OFFICE_MANAGE",
      "DOCUMENT_MANAGEMENT_VIEW", "DOCUMENT_MANAGEMENT_UPLOAD", "DOCUMENT_MANAGEMENT_MANAGE",
      "ACADEMIC_VIEW", "ACADEMIC_MANAGE", "ACADEMIC_EXAM",
      "HR_VIEW", "HR_MANAGE", "HR_ATTENDANCE",
    ],
    user: [
      "DASHBOARD_VIEW", "DASHBOARD_MANAGE",
      "APPLICATION_HUB_VIEW", "APPLICATION_HUB_MANAGE", "APPLICATION_HUB_PIN",
      "INTRANET_VIEW", "INTRANET_CREATE", "INTRANET_EDIT", "INTRANET_DELETE",
      "BOOK_MEETING_VIEW", "BOOK_MEETING_CREATE", "BOOK_MEETING_DELETE",
      "DOCUMENTS_VIEW", "DOCUMENTS_UPLOAD", "DOCUMENTS_DELETE",
      "PROJECTS_VIEW", "PROJECTS_CREATE", "PROJECTS_EDIT",
      "ERP_VIEW",
      "E_OFFICE_VIEW", "E_OFFICE_CREATE",
      "DOCUMENT_MANAGEMENT_VIEW", "DOCUMENT_MANAGEMENT_UPLOAD", "DOCUMENT_MANAGEMENT_OCR",
      "ACADEMIC_VIEW",
      "HR_VIEW",
    ],
    viewer: [
      "DASHBOARD_VIEW",
      "APPLICATION_HUB_VIEW",
      "INTRANET_VIEW",
      "BOOK_MEETING_VIEW",
      "DOCUMENTS_VIEW",
      "PROJECTS_VIEW",
    ],
  };

  let rpCount = 0;
  for (const [roleCode, permissions] of Object.entries(rolePermissionMap)) {
    const roleId = roleMap[roleCode];
    for (const permCode of permissions) {
      const permId = permMap[permCode];
      if (!permId) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId, permissionId: permId } },
        update: {},
        create: { roleId, permissionId: permId },
      });
      rpCount++;
    }
  }
  console.log(`✅ RolePermissions: ${rpCount} รายการ`);

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

