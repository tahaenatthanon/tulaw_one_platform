"use client";

import { useHasPermission, type PermissionCode, type RoleCode } from "@/hooks/use-permission";

export { type PermissionCode, type RoleCode } from "@/hooks/use-permission";

/** Unified hook — returns granular action booleans for every module. */
export function useActionPermissions() {
  const can = (p: PermissionCode) => useHasPermission(p);

  return {
    // ─── Dashboard ───
    dashboard: {
      view: can("DASHBOARD_VIEW"),
      manage: can("DASHBOARD_MANAGE"),
    },
    // ─── Application Hub ───
    applicationHub: {
      view: can("APPLICATION_HUB_VIEW"),
      manage: can("APPLICATION_HUB_MANAGE"),
      pin: can("APPLICATION_HUB_PIN"),
    },
    // ─── Intranet ───
    intranet: {
      view: can("INTRANET_VIEW"),
      create: can("INTRANET_CREATE"),
      edit: can("INTRANET_EDIT"),
      delete: can("INTRANET_DELETE"),
      publish: can("INTRANET_PUBLISH"),
    },
    // ─── Book Meeting ───
    bookMeeting: {
      view: can("BOOK_MEETING_VIEW"),
      create: can("BOOK_MEETING_CREATE"),
      edit: can("BOOK_MEETING_EDIT"),
      delete: can("BOOK_MEETING_DELETE"),
      approve: can("BOOK_MEETING_APPROVE"),
    },
    // ─── Documents ───
    documents: {
      view: can("DOCUMENTS_VIEW"),
      upload: can("DOCUMENTS_UPLOAD"),
      edit: can("DOCUMENTS_EDIT"),
      delete: can("DOCUMENTS_DELETE"),
      share: can("DOCUMENTS_SHARE"),
      managePool: can("DOCUMENTS_MANAGE_POOL"),
    },
    // ─── Projects ───
    projects: {
      view: can("PROJECTS_VIEW"),
      create: can("PROJECTS_CREATE"),
      edit: can("PROJECTS_EDIT"),
      delete: can("PROJECTS_DELETE"),
      approve: can("PROJECTS_APPROVE"),
      manageAll: can("PROJECTS_MANAGE_ALL"),
    },
    // ─── Users & Roles ───
    users: {
      view: can("USERS_VIEW"),
      create: can("USERS_CREATE"),
      edit: can("USERS_EDIT"),
      delete: can("USERS_DELETE"),
      manageRoles: can("USERS_MANAGE_ROLES"),
      managePermissions: can("USERS_MANAGE_PERMISSIONS"),
      adSync: can("USERS_AD_SYNC"),
      bulkImport: can("USERS_BULK_IMPORT"),
    },
    // ─── Audit Log ───
    auditLog: {
      view: can("AUDIT_LOG_VIEW"),
      export: can("AUDIT_LOG_EXPORT"),
      manage: can("AUDIT_LOG_MANAGE"),
    },
    // ─── Settings ───
    settings: {
      view: can("SETTINGS_VIEW"),
      manage: can("SETTINGS_MANAGE"),
      apiKeys: can("SETTINGS_API_KEYS"),
      branding: can("SETTINGS_BRANDING"),
      notification: can("SETTINGS_NOTIFICATION"),
      sso: can("SETTINGS_SSO"),
    },
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
  };
}


