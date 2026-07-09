import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
});

export const userSchema = z.object({
  email: z.string().email(),
  firstNameTh: z.string().min(1, "กรุณากรอกชื่อ"),
  lastNameTh: z.string().min(1, "กรุณากรอกนามสกุล"),
  departmentId: z.number().int().positive(),
  roleCode: z.enum(["super_admin", "system_admin", "dean", "dept_admin", "user", "viewer"]),
  status: z.enum(["ACTIVE", "INACTIVE", "MFA_PENDING"]).default("ACTIVE"),
});

export const announcementSchema = z.object({
  title: z.string().min(1, "กรุณากรอกหัวข้อ"),
  content: z.string().optional(),
  categoryId: z.number().int().positive(),
  departmentId: z.number().int().positive().optional(),
  publishDate: z.string().optional(),
  expireDate: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export const projectSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อโครงการ"),
  description: z.string().optional(),
  projectTypeId: z.number().int().positive(),
  status: z.enum(["planning", "in_progress", "pending_approval", "completed"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  progress: z.number().min(0).max(100).default(0),
});

export const roomBookingSchema = z.object({
  roomId: z.string().uuid(),
  title: z.string().min(1, "กรุณากรอกหัวข้อการประชุม"),
  startTime: z.string(),
  endTime: z.string(),
  attendeeCount: z.number().int().positive().optional(),
  remark: z.string().optional(),
});

export const documentSchema = z.object({
  title: z.string().min(1, "กรุณากรอกชื่อเอกสาร"),
  poolType: z.enum(["central", "dept", "personal"]),
  departmentId: z.number().int().positive().optional(),
});

export const apiKeySchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ API Client"),
});

export const systemConfigSchema = z.object({
  sessionMaxAge: z.number().int().min(60).optional(),
  jwtExpiry: z.number().int().min(60).optional(),
  maxLoginAttempts: z.number().int().min(1).max(10).optional(),
  mfaEnabled: z.boolean().optional(),
  storageQuotaMb: z.number().int().min(100).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type AnnouncementInput = z.infer<typeof announcementSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type RoomBookingInput = z.infer<typeof roomBookingSchema>;
export type DocumentInput = z.infer<typeof documentSchema>;
export type ApiKeyInput = z.infer<typeof apiKeySchema>;
export type SystemConfigInput = z.infer<typeof systemConfigSchema>;
