@AGENTS.md

> ⚠️ **Critical Rule:** ห้ามลบไฟล์ `tor.txt`, `plan.txt`, `claude.md` ไม่ว่ากรณีใดๆ ทั้งสิ้น

# TULAW ONE PLATFORM

## Project Identity

-   **Name:** TULAW ONE PLATFORM (TOP)
-   **Description:** ระบบศูนย์กลางดิจิทัลสำหรับคณะนิติศาสตร์ มหาวิทยาลัยธรรมศาสตร์
    (Digital Central Platform for Faculty of Law, Thammasat University)
-   **Goal:** รวมระบบทั้งหมดไว้ในแพลตฟอร์มเดียว ลดการ Login หลายระบบ
    เพิ่มประสิทธิภาพการทำงาน รองรับ Real-time และเพิ่มความปลอดภัยของข้อมูล

------------------------------------------------------------------------

## Technology Stack

  Layer             Technology
  ----------------- -------------------------------------
  Frontend          Next.js 16+ (App Router, Turbopack)
  Language          TypeScript 5 (strict mode)
  UI Framework      shadcn/ui + Tailwind CSS 4
  Backend           Next.js Route Handler
  Authentication    NextAuth.js 5 (Credentials + JWT)
  ORM               Prisma ORM 7
  Database          PostgreSQL
  API               REST API
  Package Manager   npm
  Version Control   Git + GitHub

------------------------------------------------------------------------

## Project Structure

    tulaw-oneplatform/
    ├── app/                              # Next.js App Router
    │   ├── (auth)/                       # Auth route group (public)
    │   │   └── login/                    #   Login page
    │   ├── (dashboard)/                  # Protected route group (authenticated)
    │   │   │
    │   │   ├── dashboard/                # Module 1: ศูนย์รวมข้อมูล
    │   │   │
    │   │   ├── application-hub/          # Module 2: ศูนย์กลางแอปพลิเคชัน
    │   │   │   ├── erp/                  #   ERP → Budget, Finance, Procurement, Asset, Reports
    │   │   │   ├── e-office/             #   E-Office → Incoming/Outgoing/Circular Docs, Approval, Meetings
    │   │   │   ├── document-management/  #   Document Management → Central/Dept/Personal Pool, Version, OCR
    │   │   │   ├── academic-management/  #   Academic → Curriculum, Courses, Schedule, Exams, Student Requests
    │   │   │   ├── hr-management/        #   HR → Personnel, Leave, Attendance, Evaluation, Training, Payroll
    │   │   │   ├── research-management/  #   Research → Projects, Grants, Publications, IP, Reports
    │   │   │   ├── legal-clinic/         #   Legal Clinic → Cases, Clients, Appointments, Consultation, Reports
    │   │   │   ├── book-meeting/         #   Book Meeting → Room Booking, Calendar
    │   │   │   └── support-services/     #   Support → Helpdesk, Library
    │   │   │
    │   │   ├── intranet/                 # Module 3: อินทราเน็ตคณะ
    │   │   │
    │   │   ├── book-meeting/             # Module 4: จองห้องประชุม (direct booking)
    │   │   │
    │   │   ├── documents/                # Module 5: จัดการเอกสาร
    │   │   │
    │   │   ├── projects/                 # Module 6: การจัดการโครงการ
    │   │   │
    │   │   ├── users/                    # Module 7: ผู้ใช้งานและสิทธิ์
    │   │   │   ├── user-management/      #   User Management
    │   │   │   ├── role-management/      #   Role Management
    │   │   │   ├── permission-management/#   Permission Management
    │   │   │   └── ad-sync/              #   Active Directory Synchronization
    │   │   │
    │   │   ├── audit-log/                # Module 8: บันทึกความปลอดภัย
    │   │   │   ├── activity-log/         #   Activity Log
    │   │   │   ├── login-history/        #   Login History
    │   │   │   ├── security-events/      #   Security Events
    │   │   │   └── export-logs/          #   Export Logs
    │   │   │
    │   │   └── settings/                 # Module 9: ตั้งค่าระบบ
    │   │       ├── auth-settings/        #   Authentication Settings
    │   │       ├── sso-config/           #   Microsoft SSO Configuration
    │   │       ├── security-settings/    #   Security Settings
    │   │       ├── api-integration/      #   API Integration
    │   │       ├── system-branding/      #   System Branding
    │   │       └── notification-settings/#   Notification Settings
    │   │
    │   ├── api/                          # Route Handlers (REST API)
    │   ├── layout.tsx                    # Root layout
    │   ├── page.tsx                      # Root page (redirect)
    │   └── globals.css                   # Global styles
    │
    ├── components/                       # UI Components
    │   ├── ui/                           #   shadcn/ui components
    │   ├── layouts/                      #   Layout components (Header, Sidebar, etc.)
    │   ├── forms/                        #   Form components
    │   └── shared/                       #   Shared/reusable components
    │
    ├── lib/                              # Utility functions
    │   ├── auth.ts                       #   NextAuth configuration (planned)
    │   ├── prisma.ts                     #   Prisma client singleton (planned)
    │   ├── validations.ts                #   Zod schemas (planned)
    │   └── utils.ts                      #   Helper functions (planned)
    │
    ├── hooks/                            # Custom React hooks
    ├── types/                            # TypeScript type definitions
    │
    ├── prisma/
    │   └── schema.prisma                 # Database schema
    │
    ├── public/                           # Static assets
    │
    ├── middleware.ts                      # Next.js Middleware (auth guard) (planned)
    ├── package.json
    ├── package-lock.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── postcss.config.mjs
    ├── prisma.config.ts
    ├── eslint.config.mjs
    ├── .env                              # Environment variables
    └── .gitignore

------------------------------------------------------------------------

## Conventions & Rules

### TypeScript

-   Strict mode is ON --- no `any` unless absolutely necessary
-   Use `type` for simple unions/intersections, `interface` for object
    shapes
-   All function parameters and return types must be explicitly typed
-   Prefer `const` over `let`; never use `var`

### React / Next.js

-   Use **Server Components** by default; opt into `"use client"` only
    when needed (interactivity, hooks, browser APIs)
-   Use **Route Handlers** (`app/api/`) for all API endpoints --- no
    external backend
-   Use **middleware.ts** for authentication gating
-   Use **React Server Actions** only for mutations where it simplifies
    the data flow; prefer Route Handlers for complex APIs

### File Naming

-   Files: `kebab-case.tsx`, `kebab-case.ts`
-   Components: `PascalCase` (filename matches component name)
-   Route folders: `kebab-case`
-   API routes: `app/api/[resource]/route.ts`

### Styling

-   Tailwind CSS 3 utility classes only --- no inline styles
-   Use shadcn/ui components for consistent design
-   Support Thai language (font: prompt)

------------------------------------------------------------------------

## Modules (9 Modules Total)

### 1. Dashboard

-   Real-time statistics & charts
-   Real-time organizational summary with last sync date/time
-   Support 5 views: Overview, Weekly, Trend, Proportion, Comparison
-   Department-specific dashboards for 3 departments: IT, Academic, Support
-   Advanced Search: keyword, date range, category filters
-   Latest important announcements with link to view all
-   Role-based data visibility

### 2. Application Hub

-   Aggregated application links
-   4 real-time statistics: Total systems, Active users, Online systems, Systems under maintenance
-   Online/offline status indicators on each application icon
-   Pin/unpin favorites per user
-   Instant search with filter
-   Toggle between Grid View and List View

### 3. Intranet

-   News & announcements (CRUD)
-   Display 4 organizational statistics: Personnel, Curriculum, Research, Students
-   Department contact directory: name, phone, email, location
-   Organization calendar (Monthly + Color Coding for 5 categories: Meeting, Seminar, Exam, Holiday, Deadline)
-   Subscribe to announcements by category/department with new announcement notifications

### 4. Book Meeting

-   Room booking with calendar view
-   Double-booking prevention (automatic check + alerts)
-   Microsoft Teams Integration (auto-generate online meeting link)
-   Real-time room availability status
-   Confirm/cancel bookings with automatic notifications

### 5. Documents

-   Three-tier storage: Central Pool, Department Pool, Personal Pool (5 GB per user)
-   Support 6 file types for upload: PDF, XLSX, PPTX, DOCX, PNG, JPG
-   Real-time Storage Progress Bar showing remaining space
-   Upload/download with permission control
-   Full audit trail

### 6. Projects

-   Kanban Board with 4 columns (Planning, In Progress, Pending Approval, Completed) + Drag & Drop
-   6 Project Types: Academic, Curriculum, Seminar, Research, IT, Budget
-   Approval Workflow: Dept Admin+ approve/reject with reason
-   Progress tracking with milestones + Progress Bar

### 7. Users & Roles

-   RBAC with 6 roles
-   Support 300+ concurrent users without performance degradation
-   Automatic Active Directory Sync (≤ 15 minute interval)
-   CSV bulk import/export
-   Filter by status: Active, Inactive, MFA Pending

### 8. Audit Log

-   Immutable activity log — data cannot be deleted or modified once recorded
-   Export CSV with filters by date, event type, user, IP address
-   Filterable by user, action, module, date
-   Retain data for at least 1 year

### 9. System Configuration

-   Auth Settings: Session Timeout, JWT Expiry, Max Login Attempts, MFA
-   MFA enforced for System Admin and above
-   Branding (logo, colors)
-   Maximum storage quota per user
-   API key management
-   LDAP/AD Configuration

------------------------------------------------------------------------

## User Roles (RBAC)

### Role Hierarchy

  Role         Level   Description
  ------------ ------- ---------------------------------------------------
  Super Admin  100     Full system access, all modules, API keys, user
                       management, system configuration

  System Admin 80      System care, user management, AD Sync, audit,
                       documents management

  Dean         70      Dashboard, reports, project approval, chat,
                       room booking

  Dept Admin   50      Department dashboard, announcements, chat rooms,
                       department documents

  User         30      Dashboard, chat, meeting book, document upload,
                       projects, personal tools

  Viewer       10      Read-only: dashboard, announcements, projects,
                       documents
  ------------- ------- ---------------------------------------------------

---

### Permission Matrix (✅ = มีสิทธิ์ | ⬜ = ไม่มีสิทธิ์)

#### Module 1: Dashboard (ศูนย์รวมข้อมูล)

  Permission Code      Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  -------------------- ------------- -------------- ------ ------------ ------ --------
  `DASHBOARD_VIEW`     ✅            ✅             ✅     ✅           ✅     ✅
  `DASHBOARD_MANAGE`   ✅            ✅             ⬜     ⬜           ⬜     ⬜

#### Module 2: Application Hub (ศูนย์กลางแอปพลิเคชัน)

  Permission Code             Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  --------------------------- ------------- -------------- ------ ------------ ------ --------
  `APPLICATION_HUB_VIEW`      ✅            ✅             ✅     ✅           ✅     ✅
  `APPLICATION_HUB_MANAGE`    ✅            ✅             ⬜     ⬜           ⬜     ⬜
  `APPLICATION_HUB_PIN`       ✅            ✅             ✅     ✅           ✅     ⬜

#### Module 3: Intranet (อินทราเน็ตคณะ)

  Permission Code        Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  ---------------------- ------------- -------------- ------ ------------ ------ --------
  `INTRANET_VIEW`        ✅            ✅             ✅     ✅           ✅     ✅
  `INTRANET_CREATE`      ✅            ✅             ⬜     ✅           ⬜     ⬜
  `INTRANET_EDIT`        ✅            ✅             ⬜     ✅           ⬜     ⬜
  `INTRANET_DELETE`      ✅            ✅             ⬜     ⬜           ⬜     ⬜
  `INTRANET_PUBLISH`     ✅            ✅             ⬜     ✅           ⬜     ⬜

#### Module 4: Book Meeting (จองห้องประชุม)

  Permission Code           Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  ------------------------- ------------- -------------- ------ ------------ ------ --------
  `BOOK_MEETING_VIEW`       ✅            ✅             ✅     ✅           ✅     ✅
  `BOOK_MEETING_CREATE`     ✅            ✅             ✅     ✅           ✅     ⬜
  `BOOK_MEETING_EDIT`       ✅            ✅             ✅     ✅           ✅     ⬜
  `BOOK_MEETING_DELETE`     ✅            ✅             ✅     ⬜           ⬜     ⬜
  `BOOK_MEETING_APPROVE`    ✅            ✅             ✅     ⬜           ⬜     ⬜

#### Module 5: Documents (จัดการเอกสาร)

  Permission Code            Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  -------------------------- ------------- -------------- ------ ------------ ------ --------
  `DOCUMENTS_VIEW`           ✅            ✅             ✅     ✅           ✅     ✅
  `DOCUMENTS_UPLOAD`         ✅            ✅             ✅     ✅           ✅     ⬜
  `DOCUMENTS_EDIT`           ✅            ✅             ⬜     ✅           ✅     ⬜
  `DOCUMENTS_DELETE`         ✅            ✅             ⬜     ⬜           ⬜     ⬜
  `DOCUMENTS_SHARE`          ✅            ✅             ✅     ✅           ✅     ⬜
  `DOCUMENTS_MANAGE_POOL`    ✅            ✅             ⬜     ✅           ⬜     ⬜

#### Module 6: Projects (การจัดการโครงการ)

  Permission Code          Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  ------------------------ ------------- -------------- ------ ------------ ------ --------
  `PROJECTS_VIEW`          ✅            ✅             ✅     ✅           ✅     ✅
  `PROJECTS_CREATE`        ✅            ✅             ✅     ✅           ✅     ⬜
  `PROJECTS_EDIT`          ✅            ✅             ⬜     ⬜           ✅     ⬜
  `PROJECTS_DELETE`        ✅            ✅             ⬜     ⬜           ⬜     ⬜
  `PROJECTS_APPROVE`       ✅            ✅             ✅     ⬜           ⬜     ⬜
  `PROJECTS_MANAGE_ALL`    ✅            ✅             ⬜     ⬜           ⬜     ⬜

#### Module 7: Users & Roles (ผู้ใช้งานและสิทธิ์)

  Permission Code               Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  ----------------------------- ------------- -------------- ------ ------------ ------ --------
  `USERS_VIEW`                  ✅            ✅             ⬜     ⬜           ⬜     ⬜
  `USERS_CREATE`                ✅            ✅             ⬜     ⬜           ⬜     ⬜
  `USERS_EDIT`                  ✅            ✅             ⬜     ⬜           ⬜     ⬜
  `USERS_DELETE`                ✅            ✅             ⬜     ⬜           ⬜     ⬜
  `USERS_MANAGE_ROLES`          ✅            ⬜             ⬜     ⬜           ⬜     ⬜
  `USERS_MANAGE_PERMISSIONS`    ✅            ⬜             ⬜     ⬜           ⬜     ⬜
  `USERS_AD_SYNC`               ✅            ✅             ⬜     ⬜           ⬜     ⬜
  `USERS_BULK_IMPORT`           ✅            ✅             ⬜     ⬜           ⬜     ⬜

#### Module 8: Audit Log (บันทึกความปลอดภัย)

  Permission Code        Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  ---------------------- ------------- -------------- ------ ------------ ------ --------
  `AUDIT_LOG_VIEW`       ✅            ✅             ✅     ⬜           ⬜     ⬜
  `AUDIT_LOG_EXPORT`     ✅            ✅             ⬜     ⬜           ⬜     ⬜
  `AUDIT_LOG_MANAGE`     ✅            ⬜             ⬜     ⬜           ⬜     ⬜

#### Module 9: Settings (ตั้งค่าระบบ)

  Permission Code            Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  -------------------------- ------------- -------------- ------ ------------ ------ --------
  `SETTINGS_VIEW`            ✅            ✅             ⬜     ⬜           ⬜     ⬜
  `SETTINGS_MANAGE`          ✅            ✅             ⬜     ⬜           ⬜     ⬜
  `SETTINGS_API_KEYS`        ✅            ⬜             ⬜     ⬜           ⬜     ⬜
  `SETTINGS_BRANDING`        ✅            ✅             ⬜     ⬜           ⬜     ⬜
  `SETTINGS_NOTIFICATION`    ✅            ✅             ⬜     ⬜           ⬜     ⬜
  `SETTINGS_SSO`             ✅            ⬜             ⬜     ⬜           ⬜     ⬜

#### Sub-Application: ERP (ระบบบริหารทรัพยากรองค์กร)

  Permission Code    Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  ------------------ ------------- -------------- ------ ------------ ------ --------
  `ERP_VIEW`         ✅            ✅             ✅     ✅           ⬜     ⬜
  `ERP_MANAGE`       ✅            ✅             ⬜     ⬜           ⬜     ⬜
  `ERP_APPROVE`      ✅            ✅             ✅     ⬜           ⬜     ⬜
  `ERP_REPORT`       ✅            ✅             ✅     ⬜           ⬜     ⬜

#### Sub-Application: E-Office (ระบบสารบรรณอิเล็กทรอนิกส์)

  Permission Code       Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  --------------------- ------------- -------------- ------ ------------ ------ --------
  `E_OFFICE_VIEW`       ✅            ✅             ✅     ✅           ✅     ✅
  `E_OFFICE_CREATE`     ✅            ✅             ✅     ✅           ✅     ⬜
  `E_OFFICE_APPROVE`    ✅            ✅             ✅     ⬜           ⬜     ⬜
  `E_OFFICE_MANAGE`     ✅            ✅             ⬜     ⬜           ⬜     ⬜

#### Sub-Application: Document Management (ระบบจัดการเอกสาร)

  Permission Code                 Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  ------------------------------- ------------- -------------- ------ ------------ ------ --------
  `DOCUMENT_MANAGEMENT_VIEW`      ✅            ✅             ⬜     ✅           ✅     ⬜
  `DOCUMENT_MANAGEMENT_UPLOAD`    ✅            ✅             ⬜     ✅           ✅     ⬜
  `DOCUMENT_MANAGEMENT_MANAGE`    ✅            ✅             ⬜     ⬜           ⬜     ⬜
  `DOCUMENT_MANAGEMENT_OCR`       ✅            ✅             ⬜     ⬜           ⬜     ⬜

#### Sub-Application: Academic Management (ระบบงานวิชาการ)

  Permission Code     Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  ------------------- ------------- -------------- ------ ------------ ------ --------
  `ACADEMIC_VIEW`     ✅            ✅             ✅     ✅           ✅     ✅
  `ACADEMIC_MANAGE`   ✅            ✅             ⬜     ⬜           ⬜     ⬜
  `ACADEMIC_EXAM`     ✅            ✅             ✅     ⬜           ⬜     ⬜

#### Sub-Application: HR Management (ระบบงานบุคคล)

  Permission Code    Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  ------------------ ------------- -------------- ------ ------------ ------ --------
  `HR_VIEW`          ✅            ✅             ✅     ✅           ✅     ✅
  `HR_MANAGE`        ✅            ✅             ⬜     ⬜           ⬜     ⬜
  `HR_PAYROLL`       ✅            ✅             ⬜     ⬜           ⬜     ⬜
  `HR_ATTENDANCE`    ✅            ✅             ⬜     ✅           ⬜     ⬜

#### Sub-Application: Research Management (ระบบงานวิจัย)

  Permission Code       Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  --------------------- ------------- -------------- ------ ------------ ------ --------
  `RESEARCH_VIEW`       ✅            ✅             ✅     ✅           ✅     ✅
  `RESEARCH_MANAGE`     ✅            ✅             ⬜     ⬜           ⬜     ⬜
  `RESEARCH_APPROVE`    ✅            ✅             ✅     ⬜           ⬜     ⬜

#### Sub-Application: Legal Clinic (คลินิกกฎหมาย)

  Permission Code          Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  ------------------------ ------------- -------------- ------ ------------ ------ --------
  `LEGAL_CLINIC_VIEW`      ✅            ✅             ✅     ✅           ✅     ✅
  `LEGAL_CLINIC_MANAGE`    ✅            ✅             ⬜     ⬜           ⬜     ⬜
  `LEGAL_CLINIC_APPROVE`   ✅            ✅             ✅     ⬜           ⬜     ⬜

#### Sub-Application: Support Services (บริการสนับสนุน)

  Permission Code     Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  ------------------- ------------- -------------- ------ ------------ ------ --------
  `SUPPORT_VIEW`      ✅            ✅             ✅     ✅           ✅     ✅
  `SUPPORT_MANAGE`    ✅            ✅             ⬜     ⬜           ⬜     ⬜

---

### สรุปจำนวนสิทธิ์ต่อ Role

  Role          จำนวนสิทธิ์   หมายเหตุ
  ------------- ------------- ----------------------------------------
  Super Admin   58            ทุกสิทธิ์ (FULL ACCESS)
  System Admin  50            เกินกว่า Super Admin ที่ API Keys, SSO,
                              จัดการ Roles/Permissions, Audit Manage
  Dean          25            ดู + อนุมัติเป็นหลัก
  Dept Admin    23            จัดการภายในหน่วยงาน
  User          19            ดู + สร้าง + แก้ไขของตนเอง
  Viewer        12            ดูอย่างเดียว (READ-ONLY)
  ------------- ------------- ----------------------------------------

**Implementation:** Store roles in JWT. Protect API routes with
role-check middleware. Protect pages with layout-level auth checks.
Permission codes are stored in DB (`permissions` table) and mapped
to roles via `role_permissions` join table.

------------------------------------------------------------------------

## Authentication & Security

-   **Primary Auth:** Microsoft SSO via Azure AD
-   **Fallback:** Credentials Provider with hashed passwords
    (Argon2/Bcrypt)
-   **MFA:** Enforced for System Admin and above
-   **Session:** JWT with configurable timeout
-   **API Security:** JWT validation on every API route
-   **Encryption:** TLS/HTTPS only in production
-   **Audit:** Immutable log --- append-only, no deletes

------------------------------------------------------------------------

## Database Principles

-   Primary key: `id` as UUID (`@default(uuid())`)
-   Timestamps on every table: `createdAt`, `updatedAt`
-   Soft delete where appropriate (`deletedAt`)
-   Audit fields: `createdBy`, `updatedBy`
-   Use Prisma enums for fixed sets (roles, statuses, etc.)
-   Index on frequently queried columns

------------------------------------------------------------------------

## API Design

``` typescript
// Standard success response
{ success: true, data: T, meta?: { total, page, limit } }

// Standard error response
{ success: false, error: { code: string, message: string } }
```

-   Pagination via `?page=&limit=` query params
-   Rate limiting on auth endpoints
-   All mutations return the updated resource

------------------------------------------------------------------------

## Development Workflow

``` bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run lint     # ESLint check
npx prisma generate   # Generate Prisma client
npx prisma db push    # Push schema to DB
```

### Before Coding

1.  Read the official Next.js documentation for breaking changes.
2.  Read relevant shadcn/ui component docs
3.  Ensure Prisma schema is up-to-date

------------------------------------------------------------------------

## Non-Functional Requirements

  Metric             Target
  ------------------ --------------------------------------------
  Response Time      \< 3 seconds
  Concurrent Users   ≥ 300
  SLA                ≥ 99.5%
  Server Location    Thailand (data sovereignty)
  MFA                Required for Admin+
  AD Sync Interval   ≤ 15 minutes
  Warranty           1 year (Critical: ≤3 days, Other: ≤7 days)

# Layout Structure

TULAW ONE Platform uses a consistent layout across all authenticated
modules, consisting of a Header, Left Sidebar, Main Content, and Right
Sidebar.

## Header (Top Bar)

Provides global navigation and user account access.

**Components:** 
- System Logo / Title 
- Global Search 
- Notifications 
- User Profile 
- User Menu

------------------------------------------------------------------------

## Left Sidebar (Navigation)

Provides navigation to platform modules and administrative modules based
on user permissions.

**Platform Modules:** 
- Dashboard 
- Application Hub 
- Intranet

**Administrative Modules (RBAC):** 
- Users & Roles 
- Audit Log 
- System Configuration

**Global Actions:** 
- Settings 
- Logout

------------------------------------------------------------------------

## Main Content (Workspace)

Primary workspace for displaying application content and user
interactions.

**Components:** 
- Page Header 
- Toolbar 
- Search &
Filters 
- Module Content 
- Forms 
- Tables 
- Cards 
- Charts 
- Reports 
- Actions 
- Pagination

### Application Structure

TULAW ONE Platform provides a centralized **Application Hub** that
integrates all business applications into a single platform. All
business applications are accessed through the Application Hub and are
designed to support future expansion by allowing new applications and
submodules to be added without affecting the overall platform
architecture.

#### ERP

**Submodules:** 
- Budget 
- Finance 
- Procurement 
- Asset Management 
- Reports

#### E-Office

**Submodules:** 
- Incoming Documents 
- Outgoing Documents 
- Circular Documents 
- Approval Workflow 
- Meetings

#### Document Management

**Submodules:** 
- Central Pool 
- Department Pool 
- Personal Pool 
- Version Control 
- OCR Search

#### Academic Management

**Submodules:** 
- Curriculum 
- Courses 
- Class Schedule 
- Examination Schedule 
- Student Requests

#### Human Resource Management

**Submodules:** 
- Personnel Profile 
- Leave Management 
- Attendance 
- Performance Evaluation 
- Training 
- Payroll

#### Research Management

**Submodules:** 
- Research Projects 
- Research Grants 
- Publications 
- Intellectual Property 
- Research Reports

#### Legal Clinic

**Submodules:** 
- Case Management 
- Client Registry 
- Appointment 
- Legal Consultation 
- Case Reports

#### Book Meeting

**Submodules:** 
- Meeting Room Booking 
- Booking Calendar

#### Support Services

**Submodules:** 
- Helpdesk 
- Library

------------------------------------------------------------------------

### Administrative Modules

Administrative modules are available only to users with the appropriate
permissions based on Role-Based Access Control (RBAC).

#### Users & Roles

**Submodules:** 
- User Management 
- Role Management 
- Permission Management 
- Active Directory Synchronization

#### Audit Log

**Submodules:** 
- Activity Log 
- Login History 
- Security Events 
- Export Logs

#### System Configuration

**Submodules:** 
- Authentication Settings 
- Microsoft SSO Configuration 
- Security Settings 
- API Integration 
- System Branding 
- Notification Settings

------------------------------------------------------------------------

## Right Sidebar (Context Panel)

Displays contextual information and productivity tools shared across the
platform.

**Components:** 
- Calendar 
- Upcoming Events 
- Announcements 
- Activity Summary

## Development Rules

-   Never remove existing features.

-   Follow RBAC strictly.

-   All APIs must be authenticated.

-   TypeScript strict mode.

-   Prisma schema first.

-   Reuse existing components.

-   Responsive by default.

-   ## Accessibility (WCAG AA).

# Design System

TULAW ONE Platform shall follow the official visual identity of
Thammasat University and the Faculty of Law.

## Design Principles

-   Enterprise-first
-   Clean and minimal
-   Professional academic appearance
-   Consistent across all modules
-   Accessibility first (WCAG AA)
-   Mobile-first
-   Responsive by default
-   Design Token based
-   Never hardcode colors
-   Light theme is the default

## Color Distribution (60-30-10)

-   60% Neutral backgrounds and surfaces
-   30% Faculty of Law Red
-   10% Thammasat University Yellow

Status colors are excluded from this ratio.

## Brand Tokens

  Role               Variable                  Hex
  ------------------ ------------------------- -----------
  Primary            `--tu-primary`            `#A31D1D`
  Primary Hover      `--tu-primary-hover`      `#8B1515`
  Primary Active     `--tu-primary-active`     `#731111`
  Primary Soft       `--tu-primary-soft`       `#FCEAEA`
  Secondary          `--tu-secondary`          `#FDB813`
  Secondary Hover    `--tu-secondary-hover`    `#E5A800`
  Secondary Active   `--tu-secondary-active`   `#C99200`
  Secondary Soft     `--tu-secondary-soft`     `#FFF7DE`

## Semantic Tokens

  Token            Variable
  ---------------- -----------------------
  Background       `--tu-bg`
  Surface          `--tu-surface`
  Surface Hover    `--tu-surface-hover`
  Border           `--tu-border`
  Focus Ring       `--tu-border-focus`
  Text Primary     `--tu-text-primary`
  Text Secondary   `--tu-text-secondary`
  Text Muted       `--tu-text-muted`
  Text Inverse     `--tu-text-inverse`

## Status Colors

-   Success: `--tu-success`
-   Warning: `--tu-warning`
-   Error: `--tu-error`
-   Info: `--tu-info`

## Component Standards

### Header

-   Background: `--tu-primary`
-   Text: `--tu-text-inverse`

### Sidebar

-   Background: `--tu-primary-active`
-   Active Menu: `--tu-secondary`
-   Active Text: `--tu-text-primary`

### Primary Button

-   Background: `--tu-primary`
-   Text: `--tu-text-inverse`
-   Hover: `--tu-primary-hover`

### Secondary Button

-   Background: `--tu-secondary`
-   Text: `--tu-text-primary`

### Outline Button

-   Border: `--tu-primary`
-   Text: `--tu-primary`

### Cards

-   Background: `--tu-bg`
-   Border: `--tu-border`

### Inputs

-   Border: `--tu-border`
-   Focus: `--tu-border-focus`

### Tables

-   Header: `--tu-surface`
-   Hover: `--tu-secondary-soft`
-   Selected: `--tu-primary-soft`

## Typography

Primary Font 
- Prompt

Fallback 
- Inter 
- system
- ui 
- sans-serif

  Role      Size
  --------- ------
  H1        32px
  H2        28px
  H3        24px
  H4        20px
  Body      16px
  Small     14px
  Caption   12px

## Spacing

Use 8px spacing system.

## Border Radius

-   Button: 10px
-   Input: 10px
-   Card: 12px
-   Dialog: 16px

## Accessibility

-   WCAG AA
-   Keyboard navigation
-   Minimum touch target 44×44px

## Design Token Rules

-   Always use CSS variables.
-   Never use raw hex values inside components.
-   Never use Tailwind palette colors for brand colors.
-   Define tokens only in globals.css.
-   All new UI must follow this design system.

# UI/UX Principles

These principles define the standard user experience across the entire platform.
All modules, pages, components, and future features must follow these principles.

---

## 1. Consistency First

Consistency is mandatory across the platform.

Rules

- Same action = Same wording
- Same component = Same appearance
- Same interaction = Same behavior
- Same layout = Same structure

Never create different UI patterns for identical functionality.

Example

✅ Save

❌ Save Changes
❌ Save Data
❌ Confirm Save

Always use

✅ Save

---

## 2. Standard Action Naming

Use these labels consistently throughout the system.

| Action | Label |
|---------|-------|
| Save | บันทึก |
| Edit | แก้ไข |
| Delete | ลบ |
| Cancel | ยกเลิก |
| Search | ค้นหา |
| Add | เพิ่ม |
| View | ดูรายละเอียด |
| Back | กลับ |
| Confirm | ยืนยัน |
| Submit | ส่งข้อมูล |
| Download | ดาวน์โหลด |
| Upload | อัปโหลด |
| Print | พิมพ์ |

Never use different wording for identical actions.

---

## 3. Component Reuse Policy

Always reuse existing components before creating new ones.

Reusable Components

- Button
- Input
- Textarea
- Select
- Table
- Card
- Modal
- Dialog
- Drawer
- Tooltip
- Badge
- Alert
- Toast

Creating a new component requires a clear business justification.

---

## 4. Button Hierarchy

Each page should have only ONE Primary Action.

Priority

1. Primary
2. Secondary
3. Outline
4. Ghost
5. Link
6. Destructive

Never display multiple primary buttons simultaneously.

Correct

[Save]     Primary

[Cancel]   Secondary

Incorrect

[Save]

[Submit]

[Confirm]

All as Primary

---

## 5. Color Usage

Always use semantic colors.

Primary

Faculty of Law Brand

Success

Green

Warning

Yellow / Orange

Danger

Red

Info

Blue

Never communicate status by color alone.

Every status should contain

- Icon
- Text
- Color

---

## 6. Form Standard

Every form must contain

- Label
- Required Indicator (*)
- Helper Text (if needed)
- Validation
- Inline Error
- Loading State
- Disabled State
- Readonly State

Validation messages must appear next to the corresponding field.

---

## 7. Table Standard

Every data table must support

Required

- Search
- Sort
- Pagination
- Loading
- Empty State

Recommended

- Filter
- Column Visibility
- Bulk Action
- Export
- Sticky Header

---

## 8. Feedback Standard

Every user action must provide feedback.

Success

✅ บันทึกข้อมูลสำเร็จ

Error

❌ ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง

Warning

⚠ กรุณาตรวจสอบข้อมูล

Loading

Show loading indicator until the process completes.

Never leave users without system feedback.

---

## 9. Accessibility Standard

Minimum requirements

- WCAG AA
- Keyboard Navigation
- Focus Visible
- Screen Reader Support
- ARIA Labels
- Minimum Touch Target 44×44 px
- Color Contrast Compliance

Accessibility is mandatory.

---

## 10. Standard Layout

Every page should follow the same layout.

1. Page Title
2. Toolbar / Actions
3. Search / Filters
4. Main Content
5. Footer Actions

Do not change this order without a valid reason.

---

## 11. Information Hierarchy

Visual hierarchy

Page Title

↓

Section Title

↓

Card Title

↓

Field Label

↓

Content

Avoid excessive bold text and unnecessary colors.

---

## 12. University Context

This platform is designed for

- Faculty Members
- Administrative Staff
- Executives

Design Goals

- Professional
- Clean
- Minimal
- Long-term Maintainable
- Easy to Learn
- Consistent
- Accessible

Avoid

- Fancy UI
- Excessive Animation
- Experimental Components
- Inconsistent Interaction Patterns

The platform should prioritize stability over visual novelty.

---

## 13. Icon Standard

Use Lucide Icons only.

Allowed Sizes

- 16px
- 20px
- 24px

Do not mix multiple icon libraries.

Icons should reinforce meaning, not replace text.

---

## 14. Animation Standard

Animation should be subtle.

Recommended durations

Hover

100ms

Dropdown

150ms

Dialog

200ms

Page Transition

200–300ms

Respect prefers-reduced-motion.

---

## 15. Responsive Standard

Support

- Desktop
- Laptop
- Tablet
- Mobile

Requirements

- Responsive Tables
- Responsive Sidebar
- Adaptive Toolbar
- Touch Friendly Controls

Avoid horizontal scrolling whenever possible.

# Enterprise AI Specification

## Feature Specification

-   Features
-   User Stories
-   Business Rules
-   Validation Rules
-   Permission Matrix
-   Notifications
-   Audit Events
-   Acceptance Criteria

## API Contract

-   GET List
-   GET Detail
-   POST Create
-   PUT Update
-   DELETE Soft Delete
-   Bulk Actions
-   Import/Export
-   Zod Validation
-   REST
-   OpenAPI
-   Pagination
-   Search
-   Filter
-   Sort

## Page Specification

-   Dashboard
-   List
-   Detail
-   Create
-   Edit
-   History
-   Import
-   Export
-   Settings
-   Header
-   Toolbar
-   Search
-   Filter
-   Loading
-   Empty
-   Error

## UI Component Specification

Tables: Sorting Filtering Search Pagination Column Visibility Bulk
Action Export. Forms: Validation Helper Error Loading Dirty State.
Dialogs: Focus Trap ESC Sizes. Cards: Header Body Footer Actions Status.

## Folder Convention

components/ui components/forms components/layouts components/tables
components/dialogs components/charts components/shared services
repositories validators hooks utils lib

## Authentication Flow

Login -\> Validate -\> MFA -\> JWT -\> Refresh Token -\> Protected
Routes -\> Logout.
