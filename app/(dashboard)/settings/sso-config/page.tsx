"use client";

export default function SsoConfigPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-tu-text-primary">ตั้งค่า Microsoft SSO</h1>
        <p className="text-tu-text-muted text-sm mt-1">เชื่อมต่อกับ Azure AD ของมหาวิทยาลัยธรรมศาสตร์</p>
      </div>

      <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-tu-text-secondary mb-1">LDAP URL</label>
          <input
            type="text"
            readOnly
            value="ldap://ad.tu.ac.th"
            className="w-full rounded-[--radius-input] border border-tu-border bg-tu-bg px-3 py-2.5 text-sm text-tu-text-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-tu-text-secondary mb-1">Base DN</label>
          <input
            type="text"
            readOnly
            value="dc=tu,dc=ac,dc=th"
            className="w-full rounded-[--radius-input] border border-tu-border bg-tu-bg px-3 py-2.5 text-sm text-tu-text-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-tu-text-secondary mb-1">Domain</label>
          <input
            type="text"
            readOnly
            value="tu.ac.th"
            className="w-full rounded-[--radius-input] border border-tu-border bg-tu-bg px-3 py-2.5 text-sm text-tu-text-primary"
          />
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-tu-text-secondary">เปิดใช้งาน LDAP</span>
          <span className="text-sm font-medium text-tu-error">✗ ปิด (Dev Mode)</span>
        </div>
      </div>
    </div>
  );
}
