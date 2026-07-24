## 1. Update Type Definitions and Category Constants

- [x] 1.1 Update `CategoryId` type in `components/settings/category-sidebar.tsx` to remove deprecated categories (meeting-rooms, app-status, categories, security, audit) and keep only: auth, sso, branding, storage, integration
- [x] 1.2 Update `CATEGORIES` array in `category-sidebar.tsx` to add group metadata (group: "core-settings" | "appearance" | "storage" | "integration"), descriptions, and keywords for search
- [x] 1.3 Verify `SystemConfigViewProps` type in `./types` — ensure props for removed tabs are optional/ignored without breaking the interface

## 2. Build Category Navigation Sidebar with Groups

- [x] 2.1 Create `GroupedCategorySidebar` component that renders group headers (Core Settings, Appearance, Storage, Integration) with category items underneath each group
- [x] 2.2 Add group header styling (uppercase label, muted color, optional divider) per design system tokens
- [x] 2.3 Add search filtering support: when search query filters categories, hide empty group headers
- [x] 2.4 Add empty state in sidebar when search returns no results (SearchX icon + message)

## 3. Refactor SystemConfigView to Enterprise Layout

- [x] 3.1 Rewrite `SystemConfigView.tsx` to compose pre-built components: `SettingsHeader`, search area, `GroupedCategorySidebar`, configuration panel, `BrandingPreview`, `StorageVisualization`, `ApiKeyTable`, `SaveBar`, `SaveConfirmationDialog`
- [x] 3.2 Implement two-column layout (sidebar 280px + flexible content) using CSS grid at `lg` breakpoint
- [x] 3.3 Wire category selection state to render the correct panel content (AuthPanel, SsoPanel, BrandingPanel, StoragePanel, ApiKeysPanel)
- [x] 3.4 Preserve all existing form state management, onChange handlers, and save/reset logic without modification

## 4. Integrate Branding Preview

- [x] 4.1 Import and integrate `BrandingPreview` component from `components/settings/branding-preview.tsx` into the Branding panel
- [x] 4.2 Ensure preview receives live form state values (name, color, logoUrl) via props
- [x] 4.3 Verify preview uses inline styles only — no CSS variable injection until save

## 5. Integrate Storage Visualization

- [x] 5.1 Import and integrate `StorageVisualization` component from `components/settings/storage-visualization.tsx` into the Storage panel
- [x] 5.2 Pass current quota value from form state to the visualization component
- [x] 5.3 Display usage progress bar and stats cards below the storage form fields

## 6. Enhance Save Bar with Pending Changes Indicator

- [x] 6.1 Import and integrate `SaveBar` component from `components/settings/save-bar.tsx` to replace inline save bar
- [x] 6.2 Implement `pendingCount` state that tracks number of modified sections/fields
- [x] 6.3 Wire `onSave`, `onReset`, `onDiscard` props to existing handlers
- [x] 6.4 Wire `dirty`, `saving`, `saved` states from existing props

## 7. Implement Save Confirmation Dialog

- [x] 7.1 Import and integrate `SaveConfirmationDialog` from `components/settings/save-confirmation-dialog.tsx`
- [x] 7.2 Show dialog when user clicks Save (before actually calling onSave)
- [x] 7.3 Display pending change count and immediate effect warning in dialog
- [x] 7.4 On confirm, close dialog and execute existing `onSave` handler
- [x] 7.5 On cancel, close dialog without saving

## 8. Implement Empty States

- [x] 8.1 Import and integrate `EmptyState` component from `components/settings/empty-state.tsx`
- [x] 8.2 Add empty state for no search results (sidebar + content area)
- [x] 8.3 Add empty state for no API keys (with create CTA)
- [x] 8.4 Add empty state for no integration services
- [x] 8.5 Add empty state for no data in any category panel

## 9. Responsive Design Implementation

- [x] 9.1 Add responsive breakpoints to sidebar: vertical sidebar at `lg` (1024px+), horizontal pill bar at `md` (768px–1023px), dropdown select below `md` (768px)
- [x] 9.2 Add responsive grid for form fields: `sm:grid-cols-2` at 640px+, single column below
- [x] 9.3 Add responsive display for API key list: table at `md+`, stacked cards on mobile
- [x] 9.4 Add responsive layout for sticky action bar: horizontal at `sm+`, stacked on mobile
- [x] 9.5 Verify all breakpoints work correctly using browser DevTools responsive mode

## 10. Design System Compliance Validation

- [x] 10.1 Verify all components use `--tu-*` CSS custom properties (no hardcoded hex colors)
- [x] 10.2 Verify all border-radius values use `--radius-*` tokens
- [x] 10.3 Verify Typography uses Prompt font family via `font-sans` Tailwind config
- [x] 10.4 Verify spacing follows 8px grid system (multiples of 0.5rem/8px)
- [x] 10.5 Verify all icons are from Lucide at 16px/20px/24px sizes
- [x] 10.6 Cross-check visual consistency with Dashboard, Users & Roles, and Audit Log pages

## 11. Tab Styling — Natural Width & Underline Active Indicator

- [x] 11.1 Update tablet horizontal pill bar tabs to use `shrink-0` (Fit Content / Natural Width) instead of stretched full-width
- [x] 11.2 Update tablet horizontal pill bar container to use `w-fit` instead of `w-full`
- [x] 11.3 Remove background fill (`bg-tu-primary`) from active tab on tablet/mobile pill bar
- [x] 11.4 Add underline/bottom border indicator for active tab state on tablet/mobile pill bar
- [x] 11.5 Change active tab text to primary color (`text-tu-primary`) on tablet/mobile pill bar
- [x] 11.6 Change inactive tab text to muted color (`text-tu-text-muted`) on tablet/mobile pill bar
- [x] 11.7 Verify active tab has no background, only text color + underline on tablet and mobile viewports
- [x] 11.8 Verify tab container does not stretch beyond its natural content width on tablet

## 12. Logo Propagation — Single Source of Truth

- [x] 12.1 Verify `PUT /api/settings` saves `branding.logoUrl` correctly and SWR `mutate()` invalidates cache
- [x] 12.2 Verify sidebar component reads logo URL from `branding.logoUrl` in `/api/settings` SWR cache (same cache key)
- [x] 12.3 Verify login page reads logo URL from `branding.logoUrl` in `/api/settings` SWR cache (same cache key)
- [x] 12.4 Verify logo updates immediately in sidebar after save without page refresh
- [x] 12.5 Verify logo updates in login page on next navigation without re-login
- [x] 12.6 Verify default logo fallback works when `branding.logoUrl` is null/empty
- [x] 12.7 Verify no component maintains a separate/duplicate copy of the logo URL

## 13. Final Verification

- [x] 13.1 Verify all existing business logic works unchanged (auth settings save/load, SSO config, branding save, storage quota, API key CRUD)
- [x] 13.2 Verify no regressions in form state across category switches (unsaved changes persist)
- [x] 13.3 Verify save/reset/discard flow works end-to-end
- [x] 13.4 Verify removed tabs (Meeting Room, Application Status, Categories, Security, Audit) do not appear anywhere in the UI
- [x] 13.5 Verify existing API calls are not affected
