"use client";

import { useHasPermission, useUserRoles, type PermissionCode, type RoleCode } from "@/hooks/use-permission";
import { ROLE_LEVELS } from "@/lib/permissions";

export { type PermissionCode, type RoleCode } from "@/hooks/use-permission";

/** Unified hook — returns granular action booleans for every module. */
export function useActionPermissions() {
  const can = (p: PermissionCode) => useHasPermission(p);

  return {
    // ─── ERP ───
    erp: {
      view: can("ERP_VIEW"),
      createEditDelete: can("ERP_MANAGE"),
      approve: can("ERP_APPROVE"),
      report: can("ERP_REPORT"),
    },
    // ─── E-Office ───
    eoffice: {
      view: can("E_OFFICE_VIEW"),
      create: can("E_OFFICE_CREATE"),
      approve: can("E_OFFICE_APPROVE"),
      manage: can("E_OFFICE_MANAGE"),
    },
    // ─── Document Management ───
    docMgmt: {
      view: can("DOCUMENT_MANAGEMENT_VIEW"),
      upload: can("DOCUMENT_MANAGEMENT_UPLOAD"),
      manage: can("DOCUMENT_MANAGEMENT_MANAGE"),
      ocr: can("DOCUMENT_MANAGEMENT_OCR"),
    },
    // ─── Documents (direct /documents) ───
    documents: {
      view: can("DOCUMENTS_VIEW"),
      upload: can("DOCUMENTS_UPLOAD"),
      edit: can("DOCUMENTS_EDIT"),
      delete: can("DOCUMENTS_DELETE"),
      share: can("DOCUMENTS_SHARE"),
      managePool: can("DOCUMENTS_MANAGE_POOL"),
    },
    // ─── Academic ───
    academic: {
      view: can("ACADEMIC_VIEW"),
      manage: can("ACADEMIC_MANAGE"),
      exam: can("ACADEMIC_EXAM"),
    },
    // ─── HR ───
    hr: {
      view: can("HR_VIEW"),
      manage: can("HR_MANAGE"),
      payroll: can("HR_PAYROLL"),
      attendance: can("HR_ATTENDANCE"),
    },
    // ─── Research ───
    research: {
      view: can("RESEARCH_VIEW"),
      manage: can("RESEARCH_MANAGE"),
      approve: can("RESEARCH_APPROVE"),
    },
    // ─── Legal Clinic ───
    legalClinic: {
      view: can("LEGAL_CLINIC_VIEW"),
      manage: can("LEGAL_CLINIC_MANAGE"),
      approve: can("LEGAL_CLINIC_APPROVE"),
    },
    // ─── Book Meeting ───
    bookMeeting: {
      view: can("BOOK_MEETING_VIEW"),
      create: can("BOOK_MEETING_CREATE"),
      edit: can("BOOK_MEETING_EDIT"),
      delete: can("BOOK_MEETING_DELETE"),
      approve: can("BOOK_MEETING_APPROVE"),
    },
    // ─── Support ───
    support: {
      view: can("SUPPORT_VIEW"),
      manage: can("SUPPORT_MANAGE"),
    },
    // ─── Admin ───
    admin: {
      usersView: can("USERS_VIEW"),
      auditView: can("AUDIT_LOG_VIEW"),
      settingsView: can("SETTINGS_VIEW"),
    },
  };
}

/** Returns the highest role level of the current user. */
export function useRoleLevel(): number {
  const roles = useUserRoles();
  return Math.max(0, ...roles.map((r) => ROLE_LEVELS[r] ?? 0));
}
