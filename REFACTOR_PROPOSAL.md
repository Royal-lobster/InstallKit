# Component Reorganization & Naming Refactor Proposal

## Overview

This proposal outlines a comprehensive refactoring of the InstallKit components to improve code organization, clarity, and maintainability. The current structure has evolved organically and now suffers from unclear naming conventions and scattered related functionality.

## Current Issues

### 1. Confusing Component Names
- `brew-picker.tsx` and `brew-picker-content.tsx` - Names don't clearly indicate their purpose
- "Brew picker" terminology is unclear - what are we picking exactly?
- Multiple small components that are tightly coupled but scattered across separate files

### 2. Poor File Organization
- Layout-focused components mixed with UI components
- Related functionality split across multiple small files (some as small as 11 lines)
- No clear separation between curated catalog apps vs full Homebrew catalog packages

### 3. Inconsistent Terminology
- Mixed usage of "catalog" vs "catalogue" (American vs British spelling)
- "Custom packages" terminology is unclear - they're actually packages from the full Homebrew catalog
- Inconsistent references to "curated" vs standard app collections

### 4. Component Size Issues
- Many very small components (11-50 lines) that are tightly coupled
- Some large components (200+ lines) handling multiple concerns
- Related components scattered across separate files making maintenance difficult

## Proposed Solution

### 1. Clear Naming Convention

#### Main Application Flow
- **Current**: `brew-picker.tsx` → **Proposed**: Move to `/app/(layout)/app-selection-layout.tsx`
- **Current**: `brew-picker-content.tsx` → **Proposed**: `app-selector.tsx`
- **Current**: `use-brew-picker-context.tsx` → **Proposed**: `use-installkit.tsx`

#### Search & External Packages
- **Current**: `homebrew-search-dialog.tsx` → **Proposed**: `full-catalog-search.tsx`
- **Current**: `custom-package-card.tsx` → **Proposed**: `full-catalog-package.tsx`
- **Current**: `use-homebrew-search.ts` → **Proposed**: `use-full-catalog-search.ts`

### 2. File Structure Reorganization

#### Layout Components (move to `/app/(layout)/`)
```
app-shell.tsx
command-footer.tsx
header.tsx  
providers.tsx
app-selection-layout.tsx    # Context provider + shell wrapper for app selection
```

#### UI Components (`/_components/`)
```
app-selector.tsx            # Main app selection interface (229 lines)
app-card.tsx               # Combined: app display + icon + info popover + checkbox (~310 lines)
app-grid.tsx               # Grid layout for apps (27 lines)
categories.tsx             # Combined: filter + section + grid view (~126 lines)
full-catalog-search.tsx    # Combined: search dialog + results + empty state (~277 lines)
full-catalog-package.tsx   # Full catalog package cards (156 lines)
share-dialog.tsx           # Share InstallKits (294 lines)
sync-dialog.tsx           # Sync existing installations (148 lines)
```

#### Hooks (`/_hooks/`)
```
use-installkit.tsx         # Main InstallKit state management
use-app-selection.ts       # App selection logic
use-full-catalog-search.ts # Search full Homebrew catalog
use-full-catalog-info.ts   # Package details from full catalog
use-brew-commands.ts       # Generate install commands
use-full-catalog-packages.ts # Manage full catalog packages
use-search-query.ts        # Search state management
```

### 3. Component Consolidation Strategy

#### App Card Group (~310 lines total)
**Combine**: `app-card.tsx` + `app-icon.tsx` + `app-info-popover.tsx` + `selection-checkbox.tsx`
- These are tightly coupled and always used together
- Creates a single cohesive component for app display
- Reduces complexity of managing multiple interdependent files

#### Search Components (~277 lines total)  
**Combine**: `homebrew-search-dialog.tsx` + `search-result-item.tsx` + `empty-search-state.tsx`
- All part of the same search workflow
- Reduces the overhead of managing multiple search-related files
- Creates a single source of truth for full catalog search functionality

#### Category Components (~126 lines total)
**Combine**: `category-filter.tsx` + `category-section.tsx` + `category-grid-view.tsx`  
- These work together to provide category-based filtering and display
- Small individual components that benefit from consolidation
- Easier to maintain category-related functionality in one place

### 4. Terminology Standardization

#### Core Concepts
- **InstallKit**: The main application for creating installation packages
- **Curated Catalog**: Our handpicked subset of quality applications (the main app grid)
- **Full Catalog**: The complete Homebrew repository (searchable via dialog)
- **App Selection**: The process of choosing applications for an InstallKit

#### UI Text Updates
- "From Homebrew Search" → "From Full Catalog"
- "Search Homebrew catalogue" → "Search Full Catalog"
- "Can't find your app? Search 10,000+ formulae and casks in the Homebrew catalogue" → "Can't find your app? Search the full catalog"
- "Custom packages" → "Full catalog packages"

#### Code Comments & Documentation
- Standardize on "catalog" (American spelling) throughout codebase
- Use "curated catalog" and "full catalog" consistently
- Update component JSDoc comments to reflect new naming

## Implementation Benefits

### 1. Improved Developer Experience
- **Clear Purpose**: File names immediately indicate functionality
- **Logical Grouping**: Related code is co-located
- **Reduced Context Switching**: Fewer files to navigate between
- **Better Maintainability**: Changes to related functionality happen in one place

### 2. Enhanced Code Organization
- **Proper Separation**: Layout concerns separated from UI components
- **Consistent Sizing**: Components range from ~126-310 lines (optimal for readability)
- **Clear Dependencies**: Reduced inter-file dependencies
- **Better Structure**: Logical hierarchy that matches mental model

### 3. Clearer Mental Model
- **InstallKit Flow**: Layout → Selection Interface → Individual Components
- **Catalog Distinction**: Curated (main grid) vs Full (search dialog)
- **Component Hierarchy**: Clear parent-child relationships
- **User Journey**: Matches how users actually interact with the application

## Migration Impact

### Files to Rename/Move
- 8 component files will be renamed/consolidated
- 1 file moved from components to layout
- 6 hook files will be renamed
- All import statements updated accordingly

### Import Updates Required
- Main page component imports
- Cross-component imports within the folder
- Hook imports throughout the application
- Test file imports (if applicable)

### Terminology Updates
- UI text in multiple components
- Component prop names and interfaces
- Hook function and variable names
- Comments and documentation

## Risk Assessment

### Low Risk
- Pure refactoring with no logic changes
- Type safety maintained throughout
- Existing functionality preserved
- Incremental implementation possible

### Mitigation Strategies
- Implement in stages (rename → consolidate → update terminology)
- Thorough testing after each stage
- Git history preserved through proper file operations
- Rollback plan available at each stage

## Success Metrics

### Quantitative
- Reduce component files from 16 to 9 (44% reduction)
- Consolidate related functionality into appropriately sized components
- Eliminate files under 50 lines through strategic combination
- Achieve consistent file sizes (100-300 lines optimal range)

### Qualitative  
- New developer onboarding time reduced
- Easier to locate and modify related functionality
- Clear mental model of application structure
- Improved code review process through better organization

## Conclusion

This refactoring will significantly improve the InstallKit codebase by establishing clear naming conventions, proper file organization, and logical component groupings. The changes are low-risk, preserve all existing functionality, and set up the codebase for better long-term maintainability and developer productivity.

The proposed structure creates a clear separation between layout and components, uses descriptive names that match the application's purpose, and consolidates related functionality into appropriately sized, cohesive units.