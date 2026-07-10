@AGENTS.md

> ⚠️ **Critical Rule:** ห้ามลบไฟล์ `tor.txt`, `plan.txt`, `claude.md` ไม่ว่ากรณีใดๆ ทั้งสิ้น

# CLAUDE.md

------------------------------------------------------------------------

## 1. Project Overview

### 1.1 Project Identity

-   **Name:** TULAW ONE PLATFORM (TOP)
-   **Description:** ระบบศูนย์กลางดิจิทัลสำหรับคณะนิติศาสตร์ มหาวิทยาลัยธรรมศาสตร์
    (Digital Central Platform for Faculty of Law, Thammasat University)
-   **Goal:** รวมระบบทั้งหมดไว้ในแพลตฟอร์มเดียว ลดการ Login หลายระบบ
    เพิ่มประสิทธิภาพการทำงาน รองรับ Real-time และเพิ่มความปลอดภัยของข้อมูล

### 1.2 Non-Functional Requirements

  Metric             Target
  ------------------ --------------------------------------------
  Response Time      \< 3 seconds
  Concurrent Users   ≥ 300
  SLA                ≥ 99.5%
  Server Location    Thailand (data sovereignty)
  MFA                Required for Admin+
  AD Sync Interval   ≤ 15 minutes
  Warranty           1 year (Critical: ≤3 days, Other: ≤7 days)

------------------------------------------------------------------------

## 2. System Architecture

TULAW ONE Platform uses a consistent layout across all authenticated
modules, consisting of a Header, Left Sidebar, Main Content, and Right
Sidebar.

### 2.1 Header (Top Bar)

Provides global navigation and user account access.

**Components:**
- System Logo / Title
- Global Search
- Advanced Search: keyword, date range, category filters
- Notifications
- User Profile
- User Menu

### 2.2 Left Sidebar (Navigation)

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

### 2.3 Main Content (Workspace)

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

### 2.4 Right Sidebar (Context Panel)

Displays contextual information and productivity tools shared across the
platform.

**Components:**
- Calendar
- Upcoming Events
- Announcements
- Activity Summary

------------------------------------------------------------------------

## 3. Technology Stack

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

## 4. Coding Standards

### 4.1 TypeScript

-   Strict mode is ON --- no `any` unless absolutely necessary
-   Use `type` for simple unions/intersections, `interface` for object
    shapes
-   All function parameters and return types must be explicitly typed
-   Prefer `const` over `let`; never use `var`

### 4.2 React / Next.js

-   Use **Server Components** by default; opt into `"use client"` only
    when needed (interactivity, hooks, browser APIs)
-   Use **Route Handlers** (`app/api/`) for all API endpoints --- no
    external backend
-   Use **middleware.ts** for authentication gating
-   Use **React Server Actions** only for mutations where it simplifies
    the data flow; prefer Route Handlers for complex APIs

### 4.3 File Naming

-   Files: `kebab-case.tsx`, `kebab-case.ts`
-   Components: `PascalCase` (filename matches component name)
-   Route folders: `kebab-case`
-   API routes: `app/api/[resource]/route.ts`

### 4.4 Styling

-   Tailwind CSS 3 utility classes only --- no inline styles
-   Use shadcn/ui components for consistent design
-   Support Thai language (font: prompt)

------------------------------------------------------------------------

## 5. UI / UX Standards

These principles define the standard user experience across the entire platform.
All modules, pages, components, and future features must follow these principles.

### 5.1 Consistency First

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

### 5.2 Standard Action Naming

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

### 5.3 Component Reuse Policy

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

### 5.4 Button Hierarchy

Each page should have only ONE Primary Action.

### 5.4a View Mode / Tab Selector Standard

When implementing view mode toggles (เช่น Grid/List, Overview/Weekly/Trend ฯลฯ) หรือ tab selectors แบบ pill ใช้รูปแบบมาตรฐานดังนี้:

**Container:** `flex gap-1 bg-tu-surface border border-tu-border rounded-lg p-0.5`

**Button:**
```
flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors
```

**Active state:** `bg-tu-primary text-white shadow-sm`

**Inactive state:** `text-tu-text-secondary`

**Icon size:** `14` (ถ้ามี icon)

**ตัวอย่าง:**
```tsx
<div className="flex gap-1 bg-tu-surface border border-tu-border rounded-lg p-0.5">
  {options.map((opt) => (
    <button
      key={opt.id}
      onClick={() => setValue(opt.id)}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
        value === opt.id ? "bg-tu-primary text-white shadow-sm" : "text-tu-text-secondary"
      )}
    >
      {opt.icon && <opt.icon size={14} />}
      {opt.label}
    </button>
  ))}
</div>
```

ห้ามใช้รูปแบบอื่นสำหรับการเลือกมุมมองหรือ tab selector โดยเด็ดขาด

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

### 5.5 Color Usage

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

### 5.6 Form Standard

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

### 5.7 Table Standard

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

### 5.8 Feedback Standard

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

### 5.9 Accessibility Standard

Minimum requirements

- WCAG AA
- Keyboard Navigation
- Focus Visible
- Screen Reader Support
- ARIA Labels
- Minimum Touch Target 44×44 px
- Color Contrast Compliance

Accessibility is mandatory.

### 5.10 Standard Layout

Every page should follow the same layout.

1. Page Title
2. Toolbar / Actions
3. Search / Filters
4. Main Content
5. Footer Actions

Do not change this order without a valid reason.

### 5.11 Information Hierarchy

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

### 5.12 University Context

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

### 5.13 Icon Standard

Use Lucide Icons only.

Allowed Sizes

- 16px
- 20px
- 24px

Do not mix multiple icon libraries.

Icons should reinforce meaning, not replace text.

### 5.14 Animation Standard

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

### 5.15 Responsive Standard

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

------------------------------------------------------------------------

## 6. Design System

TULAW ONE Platform shall follow the official visual identity of
Thammasat University and the Faculty of Law.

### 6.1 Design Principles

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

### 6.2 Color Distribution (60-30-10)

-   60% Neutral backgrounds and surfaces
-   30% Faculty of Law Red
-   10% Thammasat University Yellow

Status colors are excluded from this ratio.

### 6.3 Brand Tokens

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

### 6.4 Semantic Tokens

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

### 6.5 Status Colors

-   Success: `--tu-success`
-   Warning: `--tu-warning`
-   Error: `--tu-error`
-   Info: `--tu-info`

### 6.6 Component Standards

#### Header

-   Background: `--tu-primary`
-   Text: `--tu-text-inverse`

#### Sidebar

-   Background: `--tu-primary-active`
-   Active Menu: `--tu-secondary`
-   Active Text: `--tu-text-primary`

#### Primary Button

-   Background: `--tu-primary`
-   Text: `--tu-text-inverse`
-   Hover: `--tu-primary-hover`

#### Secondary Button

-   Background: `--tu-secondary`
-   Text: `--tu-text-primary`

#### Outline Button

-   Border: `--tu-primary`
-   Text: `--tu-primary`

#### Cards

-   Background: `--tu-bg`
-   Border: `--tu-border`

#### Inputs

-   Border: `--tu-border`
-   Focus: `--tu-border-focus`

#### Tables

-   Header: `--tu-surface`
-   Hover: `--tu-secondary-soft`
-   Selected: `--tu-primary-soft`

### 6.7 Typography

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

### 6.8 Spacing

Use 8px spacing system.

### 6.9 Border Radius

-   Button: 10px
-   Input: 10px
-   Card: 12px
-   Dialog: 16px

### 6.10 Accessibility

-   WCAG AA
-   Keyboard navigation
-   Minimum touch target 44×44px

### 6.11 Design Token Rules

-   Always use CSS variables.
-   Never use raw hex values inside components.
-   Never use Tailwind palette colors for brand colors.
-   Define tokens only in globals.css.
-   All new UI must follow this design system.

------------------------------------------------------------------------

## 7. Database Standards

-   Primary key: `id` as UUID (`@default(uuid())`)
-   Timestamps on every table: `createdAt`, `updatedAt`
-   Soft delete where appropriate (`deletedAt`)
-   Audit fields: `createdBy`, `updatedBy`
-   Use Prisma enums for fixed sets (roles, statuses, etc.)
-   Index on frequently queried columns

------------------------------------------------------------------------

## 8. API Standards

### 8.1 Response Format

``` typescript
// Standard success response
{ success: true, data: T, meta?: { total, page, limit } }

// Standard error response
{ success: false, error: { code: string, message: string } }
```

-   Pagination via `?page=&limit=` query params
-   Rate limiting on auth endpoints
-   All mutations return the updated resource

### 8.2 API Contract

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

------------------------------------------------------------------------

## 9. Security Standards

-   **API Security:** JWT validation on every API route
-   **Encryption:** TLS/HTTPS only in production
-   **Audit:** Immutable log --- append-only, no deletes
-   **Rate Limiting:** On auth endpoints

------------------------------------------------------------------------

## 10. Authentication

### 10.1 Auth Methods

-   **Primary Auth:** Microsoft SSO via Azure AD
-   **Fallback:** Credentials Provider with hashed passwords
    (Argon2/Bcrypt)
-   **MFA:** Enforced for System Admin and above
-   **Session:** JWT with configurable timeout

### 10.2 Authentication Flow

Login -\> Validate -\> MFA -\> JWT -\> Refresh Token -\> Protected
Routes -\> Logout.

------------------------------------------------------------------------

## 11. Authorization (RBAC)

### 11.1 RBAC Model

#### Role (Authority)

Roles define the level of system authority. See [11.2 Role Hierarchy](#112-role-hierarchy) for the complete hierarchy.

#### Job Function (Application Access)

Job functions define which applications and submodules a role can access.
See [11.6 Job Function](#116-job-function) for detailed application-level permissions.

### 11.2 Role Hierarchy

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

### 11.3 Authority Matrix

> **Symbols:** ✅ = Full Access (CRUD + Management) · ◐ = Limited (department/self only) · 👁 = Read Only · ❌ = No Access

#### High-Level Overview

| Module | Super Admin | System Admin | Dean | Dept Admin | User | Viewer |
|---|---|---|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Application Hub | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Intranet | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Chat | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Book Meeting | ✅ | ✅ | ✅ | ✅ | ✅ | 👁 |
| Documents | ✅ | ✅ | ✅ | ✅ | ✅ | 👁 |
| Projects | ✅ | ✅ | ✅ | ✅ | ✅ | 👁 |
| Users & Roles | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Audit Log | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| System Config | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| ERP | ✅ | ✅ | ✅ | ✅ | ◐ | ❌ |
| E-Office | ✅ | ✅ | ✅ | ✅ | ✅ | 👁 |
| Document Management | ✅ | ✅ | ✅ | ✅ | ✅ | 👁 |
| Academic Management | ✅ | ✅ | ✅ | ✅ | ✅ | 👁 |
| HR Management | ✅ | ✅ | 👁 | ✅ | ✅ | ❌ |
| Research Management | ✅ | ✅ | ✅ | ✅ | ✅ | 👁 |
| Legal Clinic | ✅ | ✅ | 👁 | ✅ | ✅ | ❌ |
| Support Services | ✅ | ✅ | 👁 | ✅ | ✅ | 👁 |

### 11.4 Sidebar Visibility

Sidebar navigation is controlled by RBAC:

**Platform Modules (all authenticated users):**
- Dashboard
- Application Hub
- Intranet

**Administrative Modules (Admin roles only):**
- Users & Roles
- Audit Log
- System Configuration

**Global Actions (all authenticated users):**
- Settings
- Logout

### 11.5 Application Access

TULAW ONE Platform provides a centralized **Application Hub** that
integrates all business applications into a single platform. All
business applications are accessed through the Application Hub and are
designed to support future expansion by allowing new applications and
submodules to be added without affecting the overall platform
architecture.

#### Business Applications

##### ERP

**Submodules:**
- Budget
- Finance
- Procurement
- Asset Management
- Reports

##### E-Office

**Submodules:**
- Incoming Documents
- Outgoing Documents
- Circular Documents
- Approval Workflow
- Meetings

##### Document Management

**Submodules:**
- Central Pool
- Department Pool
- Personal Pool
- Version Control
- OCR Search

##### Academic Management

**Submodules:**
- Curriculum
- Courses
- Class Schedule
- Examination Schedule
- Student Requests

##### Human Resource Management

**Submodules:**
- Personnel Profile
- Leave Management
- Attendance
- Performance Evaluation
- Training
- Payroll

##### Research Management

**Submodules:**
- Research Projects
- Research Grants
- Publications
- Intellectual Property
- Research Reports

##### Legal Clinic

**Submodules:**
- Case Management
- Client Registry
- Appointment
- Legal Consultation
- Case Reports

##### Book Meeting

**Submodules:**
- Meeting Room Booking
- Booking Calendar

##### Support Services

**Submodules:**
- Helpdesk
- Library

#### Administrative Modules

Administrative modules are available only to users with the appropriate
permissions based on Role-Based Access Control (RBAC).

##### Users & Roles

**Submodules:**
- User Management
- Role Management
- Permission Management
- Active Directory Synchronization

##### Audit Log

**Submodules:**
- Activity Log
- Login History
- Security Events
- Export Logs

##### System Configuration

**Submodules:**
- Authentication Settings
- Microsoft SSO Configuration
- Security Settings
- API Integration
- System Branding
- Notification Settings

### 11.6 Job Function

> **Symbols:** ✅ = Full Access (CRUD + Management) · ◐ = Limited (department/self only) · 👁 = Read Only · ❌ = No Access

#### Sub-Application: ERP (ระบบบริหารทรัพยากรองค์กร)

  Permission Code    Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  ------------------ ------------- -------------- ------ ------------ ------ --------
  `ERP_VIEW`         ✅            ✅             ✅     ✅           ◐     ❌
  `ERP_MANAGE`       ✅            ✅             ✅     ◐           ❌     ❌
  `ERP_APPROVE`      ✅            ✅             ✅     ❌           ❌     ❌
  `ERP_REPORT`       ✅            ✅             ✅     ✅           👁     ❌

  | Submodule        | Super Admin | System Admin | Dean | Dept Admin | User | Viewer |
  | ---------------- | :---------: | :----------: | :--: | :--------: | :--: | :----: |
  | Budget           | ✅ | ✅ | ✅ | ◐ | 👁 | ❌ |
  | Finance          | ✅ | ✅ | 👁 | ◐ | ❌ | ❌ |
  | Procurement      | ✅ | ✅ | 👁 | ◐ | ◐ | ❌ |
  | Asset Management | ✅ | ✅ | 👁 | ◐ | 👁 | ❌ |
  | Reports          | ✅ | ✅ | ✅ | ✅ | 👁 | 👁 |

#### Sub-Application: E-Office (ระบบสารบรรณอิเล็กทรอนิกส์)

  Permission Code       Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  --------------------- ------------- -------------- ------ ------------ ------ --------
  `E_OFFICE_VIEW`       ✅            ✅             ✅     ✅           ✅     👁
  `E_OFFICE_CREATE`     ✅            ✅             ✅     ✅           ◐     ❌
  `E_OFFICE_APPROVE`    ✅            ✅             ✅     ✅           ❌     ❌
  `E_OFFICE_MANAGE`     ✅            ✅             ✅     ✅           ❌     ❌

  | Submodule          | Super Admin | System Admin | Dean | Dept Admin | User | Viewer |
  | ------------------ | :---------: | :----------: | :--: | :--------: | :--: | :----: |
  | Incoming Documents | ✅ | ✅ | ✅ | ✅ | ◐ | 👁 |
  | Outgoing Documents | ✅ | ✅ | ✅ | ✅ | ◐ | 👁 |
  | Circular Documents | ✅ | ✅ | ✅ | ✅ | 👁 | 👁 |
  | Approval Workflow  | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
  | Meetings           | ✅ | ✅ | ✅ | ✅ | ✅ | 👁 |

#### Sub-Application: Document Management (ระบบจัดการเอกสาร)

  Permission Code                 Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  ------------------------------- ------------- -------------- ------ ------------ ------ --------
  `DOCUMENT_MANAGEMENT_VIEW`      ✅            ✅             ✅     ✅           ✅     👁
  `DOCUMENT_MANAGEMENT_UPLOAD`    ✅            ✅             ◐     ✅           ✅     ❌
  `DOCUMENT_MANAGEMENT_MANAGE`    ✅            ✅             ✅     ◐           ❌     ❌
  `DOCUMENT_MANAGEMENT_OCR`       ✅            ✅             ✅     ✅           ✅     👁

  | Submodule       | Super Admin | System Admin | Dean | Dept Admin | User | Viewer |
  | --------------- | :---------: | :----------: | :--: | :--------: | :--: | :----: |
  | Central Pool    | ✅ | ✅ | 👁 | 👁 | 👁 | 👁 |
  | Department Pool | ✅ | ✅ | 👁 | ✅ | ◐ | 👁 |
  | Personal Pool   | ✅ | ✅ | 👁 | 👁 | ✅ | ❌ |
  | Version Control | ✅ | ✅ | 👁 | ◐ | ◐ | 👁 |
  | OCR Search      | ✅ | ✅ | ✅ | ✅ | ✅ | 👁 |

#### Sub-Application: Academic Management (ระบบงานวิชาการ)

  Permission Code     Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  ------------------- ------------- -------------- ------ ------------ ------ --------
  `ACADEMIC_VIEW`     ✅            ✅             ✅     ✅           ✅     👁
  `ACADEMIC_MANAGE`   ✅            ✅             ✅     ◐           ❌     ❌
  `ACADEMIC_EXAM`     ✅            ✅             ✅     ✅           👁     ❌

  | Submodule            | Super Admin | System Admin | Dean | Dept Admin | User | Viewer |
  | -------------------- | :---------: | :----------: | :--: | :--------: | :--: | :----: |
  | Curriculum           | ✅ | ✅ | ✅ | ✅ | 👁 | 👁 |
  | Courses              | ✅ | ✅ | ✅ | ◐ | 👁 | 👁 |
  | Class Schedule       | ✅ | ✅ | ✅ | ✅ | 👁 | 👁 |
  | Examination Schedule | ✅ | ✅ | ✅ | ✅ | 👁 | 👁 |
  | Student Requests     | ✅ | ✅ | ✅ | ✅ | ◐ | ❌ |

#### Sub-Application: HR Management (ระบบงานบุคคล)

  Permission Code    Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  ------------------ ------------- -------------- ------ ------------ ------ --------
  `HR_VIEW`          ✅            ✅             👁     ✅           ✅     ❌
  `HR_MANAGE`        ✅            ✅             ❌     ◐           ❌     ❌
  `HR_PAYROLL`       ✅            ✅             ❌     ❌           ◐     ❌
  `HR_ATTENDANCE`    ✅            ✅             👁     ✅           ◐     ❌

  | Submodule              | Super Admin | System Admin | Dean | Dept Admin | User | Viewer |
  | ---------------------- | :---------: | :----------: | :--: | :--------: | :--: | :----: |
  | Personnel Profile      | ✅ | ✅ | 👁 | ◐ | Self | ❌ |
  | Leave Management       | ✅ | ✅ | 👁 | ✅ | Self | ❌ |
  | Attendance             | ✅ | ✅ | 👁 | ✅ | Self | ❌ |
  | Performance Evaluation | ✅ | ✅ | 👁 | ✅ | Self | ❌ |
  | Training               | ✅ | ✅ | 👁 | ◐ | Self | 👁 |
  | Payroll                | ✅ | ✅ | ❌ | ❌ | Self | ❌ |

#### Sub-Application: Research Management (ระบบงานวิจัย)

  Permission Code       Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  --------------------- ------------- -------------- ------ ------------ ------ --------
  `RESEARCH_VIEW`       ✅            ✅             ✅     ✅           ✅     👁
  `RESEARCH_MANAGE`     ✅            ✅             ✅     ◐           ❌     ❌
  `RESEARCH_APPROVE`    ✅            ✅             ✅     ❌           ❌     ❌

  | Submodule             | Super Admin | System Admin | Dean | Dept Admin | User | Viewer |
  | --------------------- | :---------: | :----------: | :--: | :--------: | :--: | :----: |
  | Research Projects     | ✅ | ✅ | ✅ | ◐ | ◐ | 👁 |
  | Research Grants       | ✅ | ✅ | ✅ | ◐ | ◐ | 👁 |
  | Publications          | ✅ | ✅ | ✅ | ✅ | ◐ | 👁 |
  | Intellectual Property | ✅ | ✅ | ✅ | ◐ | ◐ | 👁 |
  | Research Reports      | ✅ | ✅ | ✅ | ✅ | 👁 | 👁 |

#### Sub-Application: Legal Clinic (คลินิกกฎหมาย)

  Permission Code          Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  ------------------------ ------------- -------------- ------ ------------ ------ --------
  `LEGAL_CLINIC_VIEW`      ✅            ✅             👁     ✅           ✅     ❌
  `LEGAL_CLINIC_MANAGE`    ✅            ✅             ❌     ◐           ❌     ❌
  `LEGAL_CLINIC_APPROVE`   ✅            ✅             ❌     ✅           ❌     ❌

  | Submodule          | Super Admin | System Admin | Dean | Dept Admin | User | Viewer |
  | ------------------ | :---------: | :----------: | :--: | :--------: | :--: | :----: |
  | Case Management    | ✅ | ✅ | 👁 | ✅ | ◐ | ❌ |
  | Client Registry    | ✅ | ✅ | ❌ | ✅ | ◐ | ❌ |
  | Appointment        | ✅ | ✅ | 👁 | ✅ | ◐ | ❌ |
  | Legal Consultation | ✅ | ✅ | 👁 | ◐ | ◐ | ❌ |
  | Case Reports       | ✅ | ✅ | 👁 | ✅ | 👁 | ❌ |

#### Sub-Application: Book Meeting (จองห้องประชุม)

  | Submodule          | Super Admin | System Admin | Dean | Dept Admin | User | Viewer |
  | ------------------ | :---------: | :----------: | :--: | :--------: | :--: | :----: |
  | Meeting Room Booking | ✅ | ✅ | ✅ | ✅ | ✅ | 👁 |
  | Booking Calendar     | ✅ | ✅ | ✅ | ✅ | ✅ | 👁 |

#### Sub-Application: Support Services (บริการสนับสนุน)

  Permission Code     Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  ------------------- ------------- -------------- ------ ------------ ------ --------
  `SUPPORT_VIEW`      ✅            ✅             👁     ✅           ✅     👁
  `SUPPORT_MANAGE`    ✅            ✅             ❌     ✅           ❌     ❌

  | Submodule | Super Admin | System Admin | Dean | Dept Admin | User | Viewer |
  | --------- | :---------: | :----------: | :--: | :--------: | :--: | :----: |
  | Helpdesk  | ✅ | ✅ | 👁 | ✅ | ✅ | 👁 |
  | Library   | ✅ | ✅ | ✅ | ✅ | ✅ | 👁 |

### 11.7 Permission Matrix

> **Symbols:** ✅ = Full Access (CRUD + Management) · ◐ = Limited (department/self only) · 👁 = Read Only · ❌ = No Access

#### Module 1: Dashboard (ศูนย์รวมข้อมูล)

  Permission Code      Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  -------------------- ------------- -------------- ------ ------------ ------ --------
  `DASHBOARD_VIEW`     ✅            ✅             ✅     ✅           ✅     👁
  `DASHBOARD_MANAGE`   ✅            ✅             ✅     ✅           ◐     ❌

  | Submodule  | Super Admin | System Admin | Dean | Dept Admin | User | Viewer |
  | ---------- | :---------: | :----------: | :--: | :--------: | :--: | :----: |
  | Overview   | ✅ | ✅ | ✅ | ✅ | ✅ | 👁 |
  | Weekly     | ✅ | ✅ | ✅ | ✅ | ✅ | 👁 |
  | Trend      | ✅ | ✅ | ✅ | ✅ | 👁 | 👁 |
  | Proportion | ✅ | ✅ | ✅ | ✅ | 👁 | 👁 |
  | Comparison | ✅ | ✅ | ✅ | 👁 | ❌ | ❌ |

#### Module 2: Application Hub (ศูนย์กลางแอปพลิเคชัน)

  Permission Code             Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  --------------------------- ------------- -------------- ------ ------------ ------ --------
  `APPLICATION_HUB_VIEW`      ✅            ✅             ✅     ✅           ✅     ✅
  `APPLICATION_HUB_MANAGE`    ✅            ✅             ✅     ✅           ◐     ❌
  `APPLICATION_HUB_PIN`       ✅            ✅             ✅     ✅           ✅     ❌

#### Module 3: Intranet (อินทราเน็ตคณะ)

  Permission Code        Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  ---------------------- ------------- -------------- ------ ------------ ------ --------
  `INTRANET_VIEW`        ✅            ✅             ✅     ✅           ✅     ✅
  `INTRANET_CREATE`      ✅            ✅             ✅     ✅           ◐     ❌
  `INTRANET_EDIT`        ✅            ✅             ✅     ✅           ◐     ❌
  `INTRANET_DELETE`      ✅            ✅             ✅     ✅           ❌     ❌
  `INTRANET_PUBLISH`     ✅            ✅             ✅     ✅           ❌     ❌

#### Module 4: Book Meeting (จองห้องประชุม)

  Permission Code           Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  ------------------------- ------------- -------------- ------ ------------ ------ --------
  `BOOK_MEETING_VIEW`       ✅            ✅             ✅     ✅           ✅     👁
  `BOOK_MEETING_CREATE`     ✅            ✅             ✅     ✅           ✅     ❌
  `BOOK_MEETING_EDIT`       ✅            ✅             ✅     ✅           ◐     ❌
  `BOOK_MEETING_DELETE`     ✅            ✅             ✅     ◐           ❌     ❌
  `BOOK_MEETING_APPROVE`    ✅            ✅             ✅     ◐           ❌     ❌

#### Module 5: Documents (จัดการเอกสาร)

  Permission Code            Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  -------------------------- ------------- -------------- ------ ------------ ------ --------
  `DOCUMENTS_VIEW`           ✅            ✅             ✅     ✅           ✅     👁
  `DOCUMENTS_UPLOAD`         ✅            ✅             ◐     ✅           ✅     ❌
  `DOCUMENTS_EDIT`           ✅            ✅             ◐     ✅           ◐     ❌
  `DOCUMENTS_DELETE`         ✅            ✅             ❌     ◐           ❌     ❌
  `DOCUMENTS_SHARE`          ✅            ✅             ◐     ✅           ◐     ❌
  `DOCUMENTS_MANAGE_POOL`    ✅            ✅             ❌     ✅           ❌     ❌

#### Module 6: Projects (การจัดการโครงการ)

  Permission Code          Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  ------------------------ ------------- -------------- ------ ------------ ------ --------
  `PROJECTS_VIEW`          ✅            ✅             ✅     ✅           ✅     👁
  `PROJECTS_CREATE`        ✅            ✅             ✅     ✅           ✅     ❌
  `PROJECTS_EDIT`          ✅            ✅             ✅     ✅           ◐     ❌
  `PROJECTS_DELETE`        ✅            ✅             ✅     ◐           ❌     ❌
  `PROJECTS_APPROVE`       ✅            ✅             ✅     ✅           ❌     ❌
  `PROJECTS_MANAGE_ALL`    ✅            ✅             ✅     ❌           ❌     ❌

#### Module 7: Users & Roles (ผู้ใช้งานและสิทธิ์)

  Permission Code               Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  ----------------------------- ------------- -------------- ------ ------------ ------ --------
  `USERS_VIEW`                  ✅            ✅             ❌     ◐           ❌     ❌
  `USERS_CREATE`                ✅            ✅             ❌     ◐           ❌     ❌
  `USERS_EDIT`                  ✅            ✅             ❌     ◐           ❌     ❌
  `USERS_DELETE`                ✅            ✅             ❌     ❌           ❌     ❌
  `USERS_MANAGE_ROLES`          ✅            ✅             ❌     ❌           ❌     ❌
  `USERS_MANAGE_PERMISSIONS`    ✅            ✅             ❌     ❌           ❌     ❌
  `USERS_AD_SYNC`               ✅            ✅             ❌     ❌           ❌     ❌
  `USERS_BULK_IMPORT`           ✅            ✅             ❌     ❌           ❌     ❌

  | Submodule             | Super Admin | System Admin | Dean | Dept Admin | User | Viewer |
  | --------------------- | :---------: | :----------: | :--: | :--------: | :--: | :----: |
  | User Management       | ✅ | ✅ | ❌ | ◐ (Department Only) | ❌ | ❌ |
  | Role Management       | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
  | Permission Management | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
  | Active Directory Sync | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

#### Module 8: Audit Log (บันทึกความปลอดภัย)

  Permission Code        Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  ---------------------- ------------- -------------- ------ ------------ ------ --------
  `AUDIT_LOG_VIEW`       ✅            ✅             👁     👁           ❌     ❌
  `AUDIT_LOG_EXPORT`     ✅            ✅             ❌     ❌           ❌     ❌
  `AUDIT_LOG_MANAGE`     ✅            ✅             ❌     ❌           ❌     ❌

  | Submodule       | Super Admin | System Admin | Dean | Dept Admin | User | Viewer |
  | --------------- | :---------: | :----------: | :--: | :--------: | :--: | :----: |
  | Activity Log    | ✅ | ✅ | 👁 | 👁 (Department Only) | ❌ | ❌ |
  | Login History   | ✅ | ✅ | 👁 | 👁 | ❌ | ❌ |
  | Security Events | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
  | Export Logs     | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

#### Module 9: Settings (ตั้งค่าระบบ)

  Permission Code            Super Admin   System Admin   Dean   Dept Admin   User   Viewer
  -------------------------- ------------- -------------- ------ ------------ ------ --------
  `SETTINGS_VIEW`            ✅            ✅             ❌     ❌           ❌     ❌
  `SETTINGS_MANAGE`          ✅            ✅             ❌     ❌           ❌     ❌
  `SETTINGS_API_KEYS`        ✅            ✅             ❌     ❌           ❌     ❌
  `SETTINGS_BRANDING`        ✅            ◐             ❌     ❌           ❌     ❌
  `SETTINGS_NOTIFICATION`    ✅            ✅             ❌     ❌           ❌     ❌
  `SETTINGS_SSO`             ✅            ✅             ❌     ❌           ❌     ❌

  | Submodule             | Super Admin | System Admin | Dean | Dept Admin | User | Viewer |
  | --------------------- | :---------: | :----------: | :--: | :--------: | :--: | :----: |
  | Auth Settings         | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
  | Microsoft SSO Config  | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
  | Security Settings     | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
  | API Integration       | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
  | System Branding       | ✅ | ◐ | ❌ | ❌ | ❌ | ❌ |
  | Notification Settings | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

  ------------- -------- ----------------------------------------

**Implementation:** Store roles in JWT. Protect API routes with
role-check middleware. Protect pages with layout-level auth checks.
Permission codes are stored in DB (`permissions` table) and mapped
to roles via `role_permissions` join table.

------------------------------------------------------------------------

## 12. Module Specifications

### 12.1 Dashboard

-   Real-time statistics & charts
-   Real-time organizational summary with last sync date/time
-   Support 5 views: Overview, Weekly, Trend, Proportion, Comparison
-   Department-specific dashboards for 3 departments: IT, Academic, Support
-   Latest important announcements with link to view all
-   Role-based data visibility

### 12.2 Application Hub

-   Aggregated application links
-   4 real-time statistics: Total systems, Active users, Online systems, Systems under maintenance
-   Online/offline status indicators on each application icon
-   Pin/unpin favorites per user
-   Instant search with filter
-   Toggle between Grid View and List View

### 12.3 Intranet

-   News & announcements (CRUD)
-   Display 4 organizational statistics: Personnel, Curriculum, Research, Students
-   Department contact directory: name, phone, email, location
-   Organization calendar (Monthly + Color Coding for 5 categories: Meeting, Seminar, Exam, Holiday, Deadline)
-   Subscribe to announcements by category/department with new announcement notifications

### 12.4 Book Meeting

-   Room booking with calendar view
-   Double-booking prevention (automatic check + alerts)
-   Microsoft Teams Integration (auto-generate online meeting link)
-   Real-time room availability status
-   Confirm/cancel bookings with automatic notifications

### 12.5 Documents

-   Three-tier storage: Central Pool, Department Pool, Personal Pool (5 GB per user)
-   Support 6 file types for upload: PDF, XLSX, PPTX, DOCX, PNG, JPG
-   Real-time Storage Progress Bar showing remaining space
-   Upload/download with permission control
-   Full audit trail

### 12.6 Projects

-   Kanban Board with 4 columns (Planning, In Progress, Pending Approval, Completed) + Drag & Drop
-   6 Project Types: Academic, Curriculum, Seminar, Research, IT, Budget
-   Approval Workflow: Dept Admin+ approve/reject with reason
-   Progress tracking with milestones + Progress Bar

### 12.7 Users & Roles

-   RBAC with 6 roles
-   Support 300+ concurrent users without performance degradation
-   Automatic Active Directory Sync (≤ 15 minute interval)
-   CSV bulk import/export
-   Filter by status: Active, Inactive, MFA Pending

### 12.8 Audit Log

-   Immutable activity log — data cannot be deleted or modified once recorded
-   Export CSV with filters by date, event type, user, IP address
-   Filterable by user, action, module, date
-   Retain data for at least 1 year

### 12.9 System Configuration

-   Auth Settings: Session Timeout, JWT Expiry, Max Login Attempts, MFA
-   MFA enforced for System Admin and above
-   Branding (logo, colors)
-   Maximum storage quota per user
-   API key management
-   LDAP/AD Configuration

------------------------------------------------------------------------

## 13. Database Schema

> **TODO:** Database schema details are maintained in `prisma/schema.prisma`.
> Refer to the Prisma schema file for the complete data model.

------------------------------------------------------------------------

## 14. API Convention

### 14.1 API Contract

See [8.2 API Contract](#82-api-contract) for the complete API contract specification.

### 14.2 Feature Specification

See [17.1 Feature Specification](#171-feature-specification) for feature specification requirements.

### 14.3 Page Specification

See [17.2 Page Specification](#172-page-specification) for page specification requirements.

### 14.4 UI Component Specification

See [17.3 UI Component Specification](#173-ui-component-specification) for UI component specification requirements.

------------------------------------------------------------------------

## 15. Folder Structure

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

### 15.1 Folder Convention

components/ui components/forms components/layouts components/tables
components/dialogs components/charts components/shared services
repositories validators hooks utils lib

------------------------------------------------------------------------

## 16. Development Rules

-   Never remove existing features.
-   Follow RBAC strictly.
-   All APIs must be authenticated.
-   TypeScript strict mode.
-   Prisma schema first.
-   Reuse existing components.
-   Responsive by default.
-   Accessibility (WCAG AA).

### 16.1 Development Workflow

``` bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run lint     # ESLint check
npx prisma generate   # Generate Prisma client
npx prisma db push    # Push schema to DB
```

#### Before Coding

1.  Read the official Next.js documentation for breaking changes.
2.  Read relevant shadcn/ui component docs
3.  Ensure Prisma schema is up-to-date

------------------------------------------------------------------------

## 17. Cross Module Requirements

### 17.1 Feature Specification

-   Features
-   User Stories
-   Business Rules
-   Validation Rules
-   Permission Matrix
-   Notifications
-   Audit Events
-   Acceptance Criteria

### 17.2 Page Specification

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

### 17.3 UI Component Specification

Tables: Sorting Filtering Search Pagination Column Visibility Bulk
Action Export. Forms: Validation Helper Error Loading Dirty State.
Dialogs: Focus Trap ESC Sizes. Cards: Header Body Footer Actions Status.

------------------------------------------------------------------------

## 18. Enterprise Best Practices

### 18.1 Folder Convention

See [15.1 Folder Convention](#151-folder-convention) for the complete folder convention specification.

### 18.2 Authentication Flow

See [10.2 Authentication Flow](#102-authentication-flow) for the complete authentication flow.

------------------------------------------------------------------------

## 19. Future Roadmap

> **TODO:** Future roadmap and planned features will be defined here.
