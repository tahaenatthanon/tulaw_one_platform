"use client";

import { Shield, Edit, Users } from "lucide-react";

const roles = [
  { code: "super_admin", name: "ผู้ดูแลระบบสูงสุด", level: 100, users: 1, desc: "เข้าถึงทุกระบบ จัดการ API Keys และผู้ใช้งาน" },
  { code: "system_admin", name: "ผู้ดูแลระบบ", level: 80, users: 2, desc: "ดูแลระบบ จัดการผู้ใช้ ซิงค์ AD ตรวจสอบบันทึก" },
  { code: "dean", name: "คณบดี", level: 70, users: 1, desc: "ดูแดชบอร์ด อนุมัติโครงการ รายงาน จองห้องประชุม" },
  { code: "dept_admin", name: "ผู้ดูแลหน่วยงาน", level: 50, users: 3, desc: "ดูแลภายในหน่วยงาน ประกาศ เอกสารหน่วยงาน" },
  { code: "user", name: "ผู้ใช้งาน", level: 30, users: 48, desc: "ใช้งานทั่วไป อัปโหลดเอกสาร จองห้อง ดูประกาศ" },
  { code: "viewer", name: "ผู้ดูข้อมูล", level: 10, users: 5, desc: "ดูอย่างเดียว แดชบอร์ด ประกาศ โครงการ เอกสาร" },
];

export default function RoleManagementPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-tu-text-primary">จัดการบทบาท</h1>
        <p className="text-tu-text-muted text-sm mt-1">กำหนดบทบาทและสิทธิ์ของระบบ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <div
            key={role.code}
            className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${role.level >= 70 ? "bg-tu-primary-soft" : "bg-tu-secondary-soft"}`}>
                <Shield size={20} className={role.level >= 70 ? "text-tu-primary" : "text-tu-secondary-active"} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-tu-text-primary">{role.name}</h3>
                <span className="text-xs text-tu-text-muted">{role.code}</span>
              </div>
            </div>
            <p className="text-sm text-tu-text-secondary mb-3">{role.desc}</p>
            <div className="flex items-center justify-between text-xs text-tu-text-muted">
              <span>ระดับ {role.level}</span>
              <span className="flex items-center gap-1">
                <Users size={14} /> {role.users} คน
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-tu-border">
              <button className="flex items-center gap-1.5 text-xs font-medium text-tu-primary hover:text-tu-primary-hover transition-colors">
                <Edit size={14} />
                แก้ไขสิทธิ์
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
