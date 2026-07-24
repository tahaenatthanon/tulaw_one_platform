## Context

System Configuration page (`SystemConfigView.tsx`) currently implements a monolithic self-contained component with all UI logic in one file (450+ lines). A parallel effort has already produced individual component files in `components/settings/` (`category-sidebar.tsx`, `settings-header.tsx`, `save-bar.tsx`, `save-confirmation-dialog.tsx`, `branding-preview.tsx`, `api-key-table.tsx`, `storage-visualization.tsx`, `config-section.tsx`, `empty-state.tsx`) that follow the design language from the audit-log-ui-redesign spec. The task is to integrate these components into the main view while restructuring the navigation to remove tabs that have their own dedicated pages (Meeting Room, Application Status, Categories, Security, Audit).

**Constraints:**
- Only UI/UX changes allowed — no backend, API, database, validation, state management, or business logic changes
- Design system must use `--tu-*` CSS variables, Prompt font, Lucide Icons (16px/20px/24px), 8px spacing, `--radius-*` tokens
- Must match visual consistency with Dashboard, Users & Roles, and Audit Log pages

## Goals / Non-Goals

**Goals:**
- Refactor `SystemConfigView.tsx` to use the pre-built `components/settings/` components
- Reorganize category navigation into logical groups: Core Settings (Authentication, SSO/LDAP), Appearance (Branding), Storage, Integration (API Keys)
- Remove Meeting Room, Application Status, Categories, Security, and Audit from navigation
- Add Branding Preview with real-time reflection of form state values
- Add Storage Visualization with usage progress bar
- Implement responsive layout (desktop sidebar + content, tablet, mobile stack)
- Add enhanced save status indicators (pending count, last saved time)
- Add sticky action bar with Reset, Discard, Save Changes
- Add confirmation dialog with summary of changes and immediate effect warning

**Non-Goals:**
- No changes to API endpoints or data structures
- No changes to form submission or state management logic
- No changes to validation rules
- No changes to permissions/RBAC
- No new npm dependencies
- No changes to server-side rendering behavior

## Decisions

### 1. Component Architecture: Integrate existing `components/settings/` components

**Decision:** Use the already-built components in `components/settings/` as the building blocks for the refactored view. The main `SystemConfigView.tsx` becomes an orchestrator that composes these components.

**Rationale:** The components already implement the enterprise design language, use the correct design tokens, and follow the patterns established in the audit-log-ui-redesign spec. This avoids duplicate code and ensures consistency.

**Alternatives considered:**
- _Rewrite all components inline in SystemConfigView.tsx_: Would result in a monolithic file that's harder to maintain. Rejected.
- _Create new components with different API_: Would duplicate effort and diverge from existing patterns. Rejected.

### 2. Category Structure: Flat list with group labels instead of nested accordion

**Decision:** Display categories as a flat list grouped by visual section headers. Groups:
- Core Settings: Authentication, SSO/LDAP  
- Appearance: Branding
- Storage (single item)
- Integration: API Keys

**Rationale:** With only 5 categories after removal, a flat list is simpler and faster to navigate than a nested accordion. Group headers provide visual organization without adding interaction complexity.

**Alternatives considered:**
- _Nested accordion with expand/collapse_: Adds unnecessary interaction depth for 5 items. Rejected.
- _Tabs across the top_: Original pattern; doesn't scale for many categories and wastes horizontal space. Rejected.

### 3. Responsive Strategy: CSS breakpoints with sidebar collapse

**Decision:** At `lg` breakpoint (1024px+), show two-column layout with fixed-width sidebar (280px). Below `lg`, stack sidebar on top in a horizontal scrolling pill pattern. At `sm` and below, switch to dropdown/select for category navigation.

**Rationale:** This matches the pattern used in other pages like Users & Roles. The horizontal pill pattern works well for 5 items on tablets. A select dropdown prevents sidebar from consuming too much space on mobile.

### 4. Search: Category-name search with keyword matching

**Decision:** Keep the existing search logic that filters CATEGORIES by label, description, and keywords. Enhance the UI with a better search field, clear button, and empty state when no results match.

**Rationale:** The requirement states "use existing search logic entirely". The keyword-based search is sufficient for filtering categories.

### 5. Branding Preview: Inline style injection, no CSS variable mutation

**Decision:** The Branding Preview component uses inline `style` attributes only, never injecting into CSS custom properties until save. This ensures real-time feedback without affecting other parts of the page.

**Rationale:** This follows the existing `branding-preview.tsx` pattern and avoids side effects. CSS variable injection only happens on successful save.

### 6. Storage Visualization: Display quota-based calculation as visual indicator

**Decision:** Show a progress bar with percentage used, used GB, and remaining GB derived from the configured quota. Use a fixed 70% usage as visual demo (since actual storage usage data is not in scope).

**Rationale:** The requirement states "no new calculations". The existing `storage-visualization.tsx` component already implements this with a simulated 70% usage for visual purposes.

### 7. Save Confirmation: Dialog with persistence guard

**Decision:** Use the existing `SaveConfirmationDialog` component that shows pending change count, summary, and warning. Confirm only triggers `onSave()` — no additional API calls in the dialog.

**Rationale:** The dialog is purely a UI confirmation step. All save logic remains in the parent component's `onSave` handler.

### 8. Tablet/Mobile Tab Styling: Natural width, no background on active

**Decision:** On tablet (horizontal pill bar) and mobile (dropdown), the category tabs SHALL use `w-fit` (natural width) instead of stretching to fill the container. The active tab SHALL have no background color — active state SHALL be indicated only by text color change and an underline/bottom border.

**Rationale:** Natural-width tabs look cleaner and more modern than stretched tabs, especially with only 5 items. Removing the solid background fill on active tabs reduces visual noise and aligns with minimalist enterprise design patterns. The underline pattern is a well-established convention for indicating active selection.

**Alternatives considered:**
- _Full-width stretched tabs_: Wastes horizontal space, creates awkward gaps. Rejected.
- _Solid background on active (pill pattern)_: Too heavy for the horizontal bar layout. Rejected.

### 9. Logo Propagation After Save: Single Source of Truth via API

**Decision:** After a logo is uploaded and saved via `PUT /api/settings`, the new `branding.logoUrl` SHALL be re-fetched from the API (via SWR `mutate`) and propagated to all consumers. All logo-displaying components (Sidebar, Login page, Header) SHALL read logo URL from the same API response (`branding.logoUrl`) and re-render immediately upon data change — no page refresh required.

**Rationale:** SWR's `mutate()` after save already triggers revalidation. Components reading from the same SWR cache key (`/api/settings`) will automatically receive the updated logo URL. This ensures Single Source of Truth without introducing new state management or prop-drilling.

**Alternatives considered:**
- _Event-based or Context-based logo propagation_: Adds complexity without benefit when SWR already handles cache invalidation. Rejected.
- _Manual DOM manipulation to swap logo src_: Brittle and not aligned with React's declarative model. Rejected.

## Risks / Trade-offs

- **[Risk] Category removal breaks existing state references**: If other parts of the codebase reference `CategoryId` values like `"meeting-rooms"`, `"app-status"`, `"categories"`, `"security"`, `"audit"` → **Mitigation**: The `CategoryId` type in the current `SystemConfigView.tsx` already only lists `"auth" | "sso" | "branding" | "storage" | "api-keys"`. The parent component/types may have more categories. We'll update the types to match only the remaining categories and check for prop-drilling dependencies.
- **[Risk] Props mismatch between existing SystemConfigViewProps and new component API**: The current `SystemConfigViewProps` may include props for removed tabs (meetingRooms, appStatus, categories, securitySettings, auditSettings) → **Mitigation**: These props should remain in the interface for backward compatibility but will be ignored in the UI. The parent page component already controls which props to pass.
- **[Risk] Responsive sidebar on tablet may feel cramped with 5 items**: → **Mitigation**: The horizontal scroll pill pattern provides ample space. If needed, text labels can abbreviate on smaller screens.
- **[Trade-off] Flat category list vs. accordion**: Flat is simpler but loses the "expand/collapse" mental model. With only 5 items, this is acceptable.