# Mugithi Grand Hotel - Luxury Guest Landing Page & Portal

A high-converting, hospitality landing page for **Mugithi Grand Hotel** in Kalimoni, Juja, Kiambu County, Kenya. It showcases luxury accommodations, fine dining, and conference facilities to guests while providing seamless one-click access to the internal operations management system (MGHMS).

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Decisions from Phase 1:**
> - **Primary Purpose**: Dual-purpose public guest showcase with real-time room inquiry connected to hotel inventory, coupled with an unobtrusive "Staff Portal" link.
> - **Visual Identity**: Warm gold accents (`#D97706` / `#F59E0B`), deep obsidian navy (`#0B132B` / `#0F172A`), crisp warm-white surfaces, and lush Kenyan landscape imagery.
> - **Spotlight Features**: Four marquee pillars—Accommodations & Suites, Mugithi Restaurant & Lounge, Executive Conferences, and Kiambu Regional Attractions.
>
> **Recommended Architectural Decisions:**
> - **Image Strategy**: Generate 4 high-fidelity assets via `generate_image` (Hero Resort, Presidential/Deluxe Suite, Mugithi Restaurant & Dining, Executive Boardroom) matching the exact $16:9$ and $4:3$ container geometries.
> - **Operational Continuity**: The landing page becomes the default public landing experience, with an instant header/footer CTA button to open the internal Hotel Administration Portal (MGHMS). Guests can check room rates and submit reservations directly to the live backend.

---

### 1. Overview & Core Concept

- **What It Does**: Presents a world-class hospitality face for Mugithi Grand Hotel to incoming travelers, university visitors (JKUAT Gate C), conference delegates, and corporate retreat organizers. Guests can explore room types, view real KES nightly pricing, submit stay inquiries, explore menus, and view local Juja/Kiambu travel guides.
- **Target Audience**: Corporate business executives visiting Thika Road industrial hubs, academic scholars and visiting faculty at JKUAT, holidaymakers exploring Kiambu County, and event planners.
- **Key Value**: Replaces a blank entry-point with an attractive, conversion-oriented hospitality showcase while preserving all underlying operations, inventory, and billing tools built for authorized staff.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Arrival & Hero Immersion**:
   - Guests arrive at an expansive visual hero banner depicting the hotel's lush Kalimoni architecture under golden hour light.
   - An interactive **Booking Bar** floating beneath the hero lets guests pick arrival/departure dates, select guests, and instantly filter available room categories.
2. **Accommodations Showcase**:
   - Tabbed gallery displaying the 6 room categories (*Standard Single, Standard Double, Twin Executive, Deluxe Suite, Family Executive Suite, Presidential Mugithi Suite*).
   - Each card features an image, KES rack rate, occupancy specs, amenity tags, and a "Reserve Suite" action that opens the interactive reservation modal.
3. **Dining & Culinary Story**:
   - Bento-style feature section highlighting the Mugithi Restaurant, garden terrace café, and cocktail lounge with authentic Kenyan delicacies (Nyama Choma, goat ribs, fresh mountain roasts, Tusker selections).
4. **Conferences & Banquets**:
   - Highlights boardroom capacities (15 to 120 guests), high-speed fiber connectivity, audio-visual support, and catering packages for Kiambu corporate events.
5. **Location & Local Attractions**:
   - Interactive local guide featuring Kalimoni vicinity, Thika Superhighway access, 14 Falls, and Chania River scenery.
6. **Direct Reservation Modal**:
   - Real-time inquiry modal feeding directly into the backend `/api/reservations` endpoint with validation preventing past dates.
7. **Staff Operations Portal Switcher**:
   - Clear, elegant "Staff Portal" link in the top bar and footer that transitions into the internal MGHMS admin workspace.

#### Visual Identity & Theme
- **Color Palette (60-30-10 Rule)**:
  - **60% Dominant Canvas**: Soft light stone and crisp white (`#F8FAFC` / `#FFFFFF`) with deep navy contrast zones (`#0A1128`).
  - **30% Structural Surfaces**: Warm travertine slate, subtle hairline borders (`border-slate-200/80`), and warm dark charcoal cards.
  - **10% Accent Budget**: Polished Kenyan gold (`#D97706` / `#F59E0B`) focused strictly on primary reservation CTAs and star ratings.
- **Typography**:
  - Display & Headlines: `Cinzel` and `Plus Jakarta Sans` for sophisticated hospitality presence.
  - Body Copy: `Plus Jakarta Sans` for clean readability across mobile and desktop.
  - Pricing & Numbers: `font-mono tabular-nums` for crisp KES figure alignment.
- **Anti-Slop Discipline**:
  - Zero pill badges on cards; metadata rendered as clean unboxed inline text separated by subtle middots (`·`).
  - No fake code slashes or mechanical prefixes (`//`); clean human editorial numbering (`01. Accommodations`, `02. Gastronomy`).
  - Strict Top Bar Contract: Brand title on left, single-line navigation links in center, single primary action ("Book Now" + "Staff Login") on right.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Unified Guest & Staff Navigation Experience**:
  - *Chosen Approach*: Deliver the public landing page as the root view (`/`), with a top bar "Staff Portal" button that opens the authenticated MGHMS dashboard.
  - *Why*: Satisfies both the user's request for an attractive public presence and the earlier requirement for a centralized internal hotel management system.
- **Decision 2: High-Fidelity Asset Generation via `generate_image`**:
  - *Chosen Approach*: Use AI Studio's `generate_image` tool in a single parallel batch to generate 4 contextual luxury photos tailored specifically to Mugithi Grand Hotel, Kalimoni, Juja.
  - *Why*: Avoids fragile external stock image URLs that fail in sandboxes, ensuring 100% reliability, zero broken frames, and authentic Kenyan architectural aesthetic.
- **Decision 3: Real Direct Booking Integration**:
  - *Chosen Approach*: Wire the landing page booking modal directly to the existing Express `/api/reservations` server endpoint.
  - *Why*: Submissions made by prospective guests on the landing page immediately appear in the staff dashboard under "Expected Arrivals" and "Reservations".

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MUGITHI GRAND HOTEL WEB                         │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌────────────────────────────┐    ┌────────────────────────────────┐  │
│  │   Public Landing View      │    │  Internal Operations (MGHMS)   │  │
│  │  - Hero & Quick Availability│   │  - Dashboard & Operational KPIs│  │
│  │  - Room Category Explorer  │    │  - Front Desk Check-In / Out   │  │
│  │  - Dining & Lounge Showcase│    │  - Room Inventory & Readiness  │  │
│  │  - Conference & Banqueting │    │  - Housekeeping Turnover Board │  │
│  │  - Direct Reservation Modal│    │  - KES Billing, Tax & M-Pesa   │  │
│  └──────────────┬─────────────┘    └───────────────┬────────────────┘  │
│                 │                                  │                   │
│                 ▼                                  ▼                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    HotelContext & AuthContext                    │  │
│  │    - Real-time room availability, category data, live sync       │  │
│  │    - Staff session persistence & role-based permissions          │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     Express Backend Server                       │  │
│  │   /api/rooms · /api/reservations · /api/stays · /api/auth        │  │
│  │   - Concurrency-safe overlap checking algorithm                  │  │
│  │   - JSON Persistence in data/hotel_db.json                       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

#### Planned Component Structure
- `src/components/landing/LandingView.tsx`: Main landing container orchestrating sections.
- `src/components/landing/HeroSection.tsx`: Panoramic visual backdrop, brand positioning, and date/guest availability search widget.
- `src/components/landing/RoomsShowcase.tsx`: Filterable card grid for rooms with pricing in KES, amenity tags, and booking triggers.
- `src/components/landing/DiningSection.tsx`: Highlight of Mugithi Restaurant & Lounge specialties.
- `src/components/landing/ConferencesSection.tsx`: Corporate boardroom and event lawn specifications.
- `src/components/landing/LocationSection.tsx`: Kalimoni, Juja, Kiambu travel distance and neighborhood guide.
- `src/components/landing/BookingModal.tsx`: Real-time reservation booking dialog feeding `/api/reservations`.
- `src/components/landing/LandingNavbar.tsx` & `LandingFooter.tsx`: Compliant 3-zone top bar with instant toggle to Staff Portal.

---

### Verification & Implementation Safeguards

1. **Parallel Image Generation**: Execute all 4 `generate_image` calls in Turn 1 of execution, followed by wiring exact timestamped paths.
2. **DOM & Responsive Testing**: Ensure complete 1440px desktop alignment down to 375px mobile touch targets ($\ge 44\text{px}$).
3. **TypeScript & Compilation**: Pass `tsc --noEmit` and `compile_applet` with zero warnings before completion.
