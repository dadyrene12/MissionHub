# CompanyDashboard.jsx OXC Error Fix - TODO

## Plan Overview
Fix "Unexpected token" parsing errors by wrapping all page components in a proper main `CompanyDashboard` React component with tab navigation.

**Status: 0/5 complete**

## Steps:
- [ ] **1. Create main CompanyDashboard structure** - Add React state for tabs, navigation header, conditional page rendering
- [ ] **2. Define tab configuration** - Map all 10+ page components to tab IDs with icons/labels  
- [ ] **3. Implement tab navigation UI** - Top bar with active tab highlighting and responsive design
- [ ] **4. Pass shared props to pages** - user, showToast, templates, etc. to child components
- [ ] **5. Export and test** - Default export + verify Vite dev server runs without OXC errors

## File: `frontend/frontend/src/components/CompanyDashboard.jsx`

**Next Action:** Step 1 - Read file contents and prepare main wrapper structure

