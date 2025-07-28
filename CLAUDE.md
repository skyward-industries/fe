# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Starts Next.js development server on http://localhost:3000
- **Build**: `npm run build` - Creates production build
- **Production start**: `npm run start` - Starts production server (requires build first)  
- **Lint**: `npm run lint` - Runs ESLint for code quality checks
- **Production deployment**: `npm run start:prod` - Builds and starts production server

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Styling**: Material-UI (MUI) v5 with Emotion
- **Database**: PostgreSQL with connection pooling
- **Languages**: TypeScript, JavaScript (ES Modules)

### Application Structure
This is an aerospace/industrial parts catalog application for Skyward Industries with the following key areas:

#### Database Layer (`src/lib/db.js`)
- PostgreSQL connection pool using `pg` library
- Core database functions: `getPartsByNSN()`, `getGroups()`, `getSubgroupsByGroup()`
- Uses environment variables for database configuration (PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD)
- Includes SSL support for production environments

#### Service Layer (`src/services/`)
- `fetchGroups.ts` - Fetches product groups (FSGs) directly from database
- `fetchPartInfo.ts` - Retrieves detailed part information by NSN
- `fetchParts.ts`, `fetchSubgroups.ts` - Additional data fetching services
- Services call database functions directly (no API routes needed)

#### UI Components (`src/components/`)
- `NavBar.tsx` - Main navigation with search, cart, and responsive mobile drawer
- `CatalogClient.tsx` - Product catalog browsing interface
- `PartInfoClient.tsx` - Detailed part information display
- `FSCDropdown.tsx` - Federal Supply Classification dropdown
- All components use Material-UI with custom theming

#### Routing Structure
- `/catalog/[groupId]/[groupName]/[subgroupId]/[subgroupName]/[nsn]` - Deep catalog navigation
- `/search` - NSN/part number search results
- `/cart` - RFQ (Request for Quote) creation
- `/about`, `/contact`, `/privacy-policy`, `/terms-and-conditions` - Static pages

#### Key Features
- **Product Catalog**: Hierarchical browsing by FSG (Federal Supply Group) and FSC (Federal Supply Class)
- **Search**: NSN (National Stock Number) and part number search
- **RFQ System**: Shopping cart for creating Request for Quote submissions
- **Responsive Design**: Mobile-first with Material-UI breakpoints
- **SEO Optimized**: Comprehensive metadata and sitemap generation

### Development Patterns

#### Data Flow
1. Database queries execute server-side in service functions
2. Services are called directly from Server Components (no API routes)
3. Client Components handle user interactions and state management

#### State Management
- `SelectionContext` (`src/context/SelectionContext.tsx`) manages cart/RFQ selections
- React Hook Form for form handling
- Local component state for UI interactions

#### Styling Approach
- Material-UI theme system with custom colors and typography
- Emotion for CSS-in-JS styling
- Responsive design using MUI breakpoints
- Custom theme in `src/theme.ts`

### Important Notes
- Uses `@ts-ignore` comments in several places for Next.js App Router compatibility
- Database connection uses connection pooling for performance
- All database queries include comprehensive logging
- Environment-specific SSL configuration for RDS compatibility
- Google Analytics integration via Next.js Script component