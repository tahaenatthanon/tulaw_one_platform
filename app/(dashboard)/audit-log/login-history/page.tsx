"use client";

const mockLogins = [
  { id: "1", user: "ผู้ดูแล ระบบ", email: "admin@tulaw.ac.th", time: "2025-07-09 14:30", ip: "192.168.1.100", status: "success" },
  { id: "2", user: "สมชาย ใจดี", email: "somchai@tulaw.ac.th", time: "2025-07-09 13:40", ip: "192.168.1.101", status: "success" },
  { id: "3", user: "สมศรี รักเรียน", email: "somsri@tulaw.ac.th", time: "2025-07-09 13:20", ip: "192.168.1.102", status: "success" },
  { id: "4", user: "-", email: "unknown@test.com", time: "2025-07-09 13:00", ip: "10.0.0.55", status: "failed" },
  { id: "5", user: "ผู้ดูแล ระบบ", email: "admin@tulaw.ac.th", time: "2025-07-09 08:30", ip: "192.168.1.100", status: "success" },
  { id: "6", user: "-", email: "hacker@bad.com", time: "2025-07-09 03:15", ip: "45.33.32.156", status: "failed" },
];

export default function LoginHistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-[var(--tu-text-primary)]">ประวัติการเข้าสู่ระบบ</h2>
        <p className="text-[var(--tu-text-muted)] text-sm mt-1">บันทึกการเข้าสู่ระบบทั้งหมด</p>
      </div>

      <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-tu-bg border-b border-tu-border text-left">
              <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase">เวลา</th>
              <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase">ผู้ใช้</th>
              <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase hidden sm:table-cell">อีเมล</th>
              <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase hidden md:table-cell">IP</th>
              <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tu-border">
            {mockLogins.map((log) => (
              <tr key={log.id} className="hover:bg-tu-surface-hover transition-colors">
                <td className="px-4 py-3 text-sm text-tu-text-muted">{log.time}</td>
                <td className="px-4 py-3 text-sm font-medium text-tu-text-primary">{log.user}</td>
                <td className="px-4 py-3 text-sm text-tu-text-secondary hidden sm:table-cell">{log.email}</td>
                <td className="px-4 py-3 text-sm text-tu-text-muted hidden md:table-cell font-mono">{log.ip}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${log.status === "success" ? "bg-tu-success/10 text-tu-success" : "bg-tu-error/10 text-tu-error"}`}>
                    {log.status === "success" ? "สำเร็จ" : "ล้มเหลว"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
