# Requirements Document

## 1. Application Overview

- **Application Name:** SmartFarm — Urban & Rural Farming Management Platform
- **Description:** A production-ready SaaS web application that supports both urban (small-scale) and rural (large-scale) farming operations. The platform provides AI-powered crop recommendations, plant disease detection, irrigation optimization, financial management, marketplace functionality, and real-time analytics — all within a unified, responsive interface featuring a persistent left sidebar navigation. All pages are fully functional with interactive UI components, live data updates via Supabase Realtime subscriptions, and rich user interactions. Image uploads for crop photos, plant diagnosis, product listings, and livestock records are handled via Supabase Storage with automatic compression and thumbnail generation. Background images use WebP format with fallback support, responsive image sources, fade-in animations on page load, and seasonal variations that switch automatically based on the current month.

---

## 2. Users & Use Cases

### Target Users
- Rural farmers managing large-scale crop and livestock operations
- Urban farmers managing small-scale home or community growing spaces
- Farm administrators tracking finances, inventory, and orders

### Core Use Cases
- Monitor farm performance via interactive dashboards with real-time data and drill-down capability
- Manage crops, livestock, inventory, and equipment with full CRUD operations
- Diagnose plant diseases using AI image analysis
- Plan irrigation schedules and receive smart alerts
- Buy and sell produce through an integrated marketplace
- Access financial reports, analytics, and government scheme information
- Track tasks and farm activities via a built-in task management system
- Communicate with other farm users via in-app messaging
- Generate and export detailed reports across all modules

---

## 3. Page Structure & Feature Description

### 3.1 Overall Structure

```
SmartFarm Application
├── Authentication
│   ├── Register Page
│   └── Login Page
├── Shared Layout
│   ├── Persistent Left Sidebar (always visible, fixed)
│   ├── Top Navbar
│   └── Main Content Area (updates without full reload)
├── Rural Farming Section
│   ├── Rural Dashboard
│   ├── Crop Encyclopedia
│   ├── Plant Diagnosis (AI)
│   ├── Farm Records
│   ├── Crops Management
│   ├── Livestock Management
│   ├── Inventory & Equipment
│   ├── Financial Management
│   ├── Orders & Marketplace
│   ├── Weather Module
│   ├── Farm Mapping
│   ├── Analytics Dashboard
│   ├── Government Schemes
│   └── Task Manager
└── Urban Farming Section
    ├── Urban Dashboard
    ├── Crop Planning
    ├── Irrigation System
    ├── Plant Health (AI)
    ├── Marketplace
    ├── Analytics
    ├── Inventory & Equipment
    ├── Weather
    └── Task Manager
```

---

### 3.2 Shared Layout

**Left Sidebar**
- Always visible and fixed in position across all pages
- Navigation links grouped by section: Rural Farming and Urban Farming
- Active link highlighted with primary color (#2E7D32)
- Collapsible on mobile via hamburger menu with smooth expand/collapse animation
- Sidebar sections are collapsible/expandable with arrow toggle per group
- Mini-badge on sidebar items showing pending counts (e.g., unread alerts, pending orders, overdue tasks)
- Badge counts update in real time via Supabase Realtime subscriptions without manual refresh
- Drag-and-drop reordering of sidebar navigation items per user preference; order persists across sessions
- 「Pin」 toggle per sidebar item to pin frequently used modules to the top of the sidebar

**Top Navbar**
- Displays current page title
- Notification bell icon showing unread smart alerts count; clicking opens a dropdown panel listing the latest 5 alerts with timestamp and dismiss button per alert
- Alert count and alert list update in real time via Supabase Realtime subscriptions
- User avatar with dropdown: Profile, Settings, Logout
- Global search bar: searches across crops, records, orders, schemes, tasks, and livestock; results appear in a dropdown with category grouping
- Quick-access shortcuts bar below the navbar: user-configurable up to 5 pinned actions (e.g., 「+ Add Crop」, 「+ Log Expense」); shortcuts persist across sessions
- Dark mode / light mode toggle in the navbar; preference persisted in user profile

**Theme & Visual Design**
- Primary color: #2E7D32
- Light accent: #66BB6A
- Background: #F1F8E9
- Glassmorphism card style (frosted glass effect with backdrop-filter)
- 3D card tilt effect using CSS transform perspective on hover
- Parallax scrolling on dashboard hero sections
- Animated gradient backgrounds on key sections
- Hover animations and smooth transitions throughout
- Icons via FontAwesome
- Charts via Chart.js
- Fully responsive; mobile-first layout
- Skeleton loading placeholders shown while data is being fetched on all pages
- Toast notification system for success, error, and info feedback on all form actions
- Dark mode support: all pages and components adapt to a dark color scheme when dark mode is active

**Background Image System**
- All background images across the application are served in WebP format as the primary format
- Fallback support: for browsers that do not support WebP, a JPG or PNG fallback source is provided using the HTML picture element or equivalent CSS fallback mechanism
- Responsive image sources: each background image provides multiple resolution variants (e.g., 480px, 768px, 1280px, 1920px wide) declared via srcset or equivalent; the browser selects the most appropriate variant based on the current viewport width and device pixel ratio
- Fade-in animation on page load: all background images animate from opacity 0 to opacity 1 with a smooth ease-in transition (duration approximately 600–800ms) upon page load or route navigation; the animation triggers after the image has fully loaded to prevent a flash of unstyled content
- If a background image fails to load, the element falls back to the configured background color (#F1F8E9 in light mode; appropriate dark tone in dark mode) without displaying a broken image indicator
- Seasonal background image variations: background images on SmartFarm pages (dashboards, hero sections, and key landing areas) automatically switch based on the current calendar month according to the following mapping:
  - Spring (March, April, May): fresh green fields, blooming crops, light morning imagery
  - Summer (June, July, August): bright sunlit farmland, lush canopy, vibrant produce imagery
  - Autumn (September, October, November): harvest scenes, golden fields, warm-toned crop imagery
  - Winter (December, January, February): frost-covered fields, greenhouse interiors, cool-toned rural imagery
- Season is determined client-side using the current system date at page load; no server-side computation is required
- Seasonal image set is pre-bundled with the application; no external image API is used
- When the season changes (i.e., on the first page load of a new month that crosses a seasonal boundary), the new seasonal background image fades in using the same fade-in animation described above
- Parallax scrolling effect on hero sections: background images on dashboard hero sections and key landing areas move at a reduced scroll speed relative to the foreground content, creating a depth effect; the parallax offset is applied via CSS transform translateY driven by a scroll event listener; the effect is disabled on mobile devices (viewport width below 768px) to preserve performance and avoid layout issues on touch devices

---

### 3.3 Authentication Pages

**Register Page**
- Fields: Full Name, Email, Password, Confirm Password, Farm Type (Rural / Urban / Both), Phone Number (optional), Farm Name (optional)
- Password hashed with bcrypt before storage
- Validation: all required fields validated, email format check, password match
- Real-time inline validation feedback as user types
- Password strength indicator bar
- On success: redirect to relevant dashboard with a welcome onboarding modal
- Onboarding modal (first login only): 3-step guided tour highlighting key modules based on selected Farm Type; user can skip or complete the tour

**Login Page**
- Fields: Email, Password
- Session-based authentication
- Show/hide password toggle
- On success: redirect to last visited or default dashboard
- Error message on invalid credentials
- Remember Me checkbox to persist session
- 「Forgot Password」 link: triggers a password reset email flow; user enters email, receives a reset link, and sets a new password on the reset page
- Login activity log: last login timestamp and device info displayed on the Profile page

---

### 3.4 Supabase Realtime & Storage Integration

#### Realtime Subscriptions
- Supabase Realtime subscriptions are established on application load and maintained across all pages for the following data domains:
  - **Crop status changes:** any update to a crop's growth stage, yield data, or assigned field is instantly reflected across all connected clients without manual refresh
  - **Order status changes:** new orders, status transitions (Pending → Confirmed → Shipped → Delivered), and payment status updates propagate in real time to all clients viewing the Orders & Marketplace pages
  - **Smart alerts:** newly generated server-side alerts (Low Water, Disease Detected, Weather Warning, Low Stock, Task Overdue) are pushed to all connected clients immediately via Realtime; the 60-second polling mechanism is retained as a fallback
  - **Inventory quantity changes:** updates to inventory item quantities (including stepper increments/decrements) sync in real time across clients
  - **Livestock health records:** new health record entries and vaccination status updates reflect immediately for all connected clients
  - **Irrigation schedule and watering log changes:** schedule additions, edits, deletions, and 「Skip Today」 events sync in real time
  - **Financial entries:** new income or expense entries update the summary and charts in real time for all connected clients
  - **Task updates:** new tasks, status changes, and assignments sync in real time across all connected clients
- All Realtime-driven UI updates are applied as incremental patches to the existing rendered state; full page reloads are not triggered
- A subtle visual indicator (e.g., a brief highlight flash on the updated row or card) is shown when a Realtime update is applied to a visible element
- If the Realtime connection is interrupted, a non-blocking banner is shown: 「Live updates paused — reconnecting…」; the banner dismisses automatically upon reconnection
- The existing 60-second auto-refresh with countdown timer on dashboards is retained and continues to function independently as a fallback sync mechanism

#### Supabase Storage — Image Upload
- All image uploads across the application are handled via Supabase Storage
- **Automatic compression:** images are compressed client-side before upload to reduce storage size; maximum post-compression file size is 2MB
- **Thumbnail generation:** upon successful upload, a thumbnail version (max 200×200px) is generated and stored alongside the original; thumbnails are used in list views, history tables, and card grids
- **Upload flow:** a progress bar is shown during upload; on completion, the uploaded image preview replaces the upload zone placeholder
- **Supported formats:** JPG and PNG
- **Pre-upload validation:** file type and size (max 5MB pre-compression) are validated before upload begins; invalid files show an inline error
- Image upload is supported in the following locations:
  - **Crops Management (Rural):** crop photo upload when adding or editing a crop; thumbnail displayed on the crop list row and detail drawer
  - **Plant Diagnosis — Rural (AI):** drag-and-drop image upload for disease detection; thumbnail stored with diagnosis history record
  - **Plant Health — Urban (AI):** optional drag-and-drop image upload; thumbnail stored with diagnosis history record
  - **Orders & Marketplace (Rural) — Product Listings:** product image upload when adding or editing a product listing; thumbnail displayed on product cards
  - **Marketplace (Urban) — Product Listings:** product image upload when adding or editing a product listing; thumbnail displayed on product cards
  - **Livestock Management:** image upload per animal record when adding or editing; thumbnail displayed on the livestock list row
  - **Farm Records:** optional image attachment per log entry (e.g., field photos); thumbnail displayed in the log table
- Stored image URLs (original and thumbnail) are persisted in the corresponding database records and retrieved for display on subsequent page loads
- 「Remove Image」 button available on edit forms to delete the current image from Supabase Storage and clear the reference from the record

---

### 3.5 Rural Farming Pages

#### Rural Dashboard
- **Hero Section:** full-width hero banner with seasonal parallax background image, animated gradient overlay, and large welcome message displaying user's farm name and current date; hero includes a prominent call-to-action button 「Quick Start Guide」 that opens a contextual help modal
- **Summary Cards:** Total Crop Area, Active Crops, Total Revenue, Total Expenses, Pending Tasks — each card is clickable and navigates to the corresponding module; cards feature animated number counters on page load, glassmorphism styling, and 3D tilt effect on hover
- **KPI Trend Indicators:** each summary card displays a trend indicator (e.g., +12% vs last month) with animated up/down arrow icon and color-coded background (green for positive, red for negative)
- **Interactive Data Visualization Panel:** a dedicated section below summary cards featuring:
  - **Water Usage Gauge Chart:** animated radial gauge with color gradient fill (green to red) showing current usage vs threshold; clicking the gauge opens a detailed water usage breakdown modal
  - **Revenue vs Expenses Bar Chart (Chart.js):** toggle to switch between monthly, weekly, and yearly views; bars are animated on load with staggered timing; hover displays detailed tooltip with exact figures
  - **Crop Performance Line Chart:** multi-crop overlay with individual show/hide toggles per crop; smooth animated line drawing on load; legend is interactive and clickable to filter data
  - **Yield Efficiency Heatmap:** a calendar-style heatmap showing daily yield efficiency scores color-coded from low (red) to high (green) for the current month; clicking a day shows detailed yield data for that date
- **Smart Alerts Panel:** redesigned as an expandable accordion-style widget; each alert has a dismiss button, 「View Details」 link, and a severity icon (info / warning / critical); new alerts appear instantly via Supabase Realtime with a subtle slide-in animation and brief highlight pulse
- **Recent Activity Feed:** displays the last 10 farm record entries (increased from 5) with timestamp, activity type icon, and a mini thumbnail if an image is attached; updates in real time when new records are added; feed is scrollable within a fixed-height container
- **Upcoming Tasks Widget:** displays the next 10 tasks (increased from 5) sorted by due date with status badges and priority color-coding; clicking a task opens the Task Manager; overdue tasks are highlighted in red with a pulsing animation
- **Weather Snapshot Widget:** enhanced with current temperature, humidity, UV index, wind speed, and a 5-day mini forecast (increased from 3 days) pulled from the Weather Module; includes animated weather icons and a 「View Full Forecast」 link
- **Farm Performance Score Card:** a new widget displaying an overall farm health score (0–100) calculated from crop health, financial performance, task completion rate, and alert frequency; score is rendered as an animated circular progress bar with color gradient; clicking the card opens a detailed breakdown modal
- **Quick Action Buttons:** 「+ Add Crop」, 「+ Log Record」, 「+ Add Expense」, 「+ Add Task」, 「+ Add Livestock」 (new), 「+ Schedule Irrigation」 (new) — each opens the corresponding form in a modal; buttons feature icon animations on hover
- **Milestone Tracker:** a new horizontal timeline widget showing recent farm milestones (e.g., 「First Harvest Completed」, 「100 Crops Planted」, 「Revenue Target Achieved」); milestones are auto-generated based on farm activity and displayed with celebratory badge icons
- **Seasonal Tips Panel:** a new collapsible panel displaying 3–5 farming tips relevant to the current season (e.g., 「Spring: Prepare soil for planting」); tips are static content that rotates based on the current month
- **Auto-Refresh:** every 60 seconds with a visible countdown timer and manual 「Refresh Now」 button (retained as fallback alongside Realtime)
- **Date Range Selector:** at the top of the dashboard to filter all chart data; includes preset options (Today, Last 7 Days, Last 30 Days, This Month, Custom Range)
- **Customizable Widget Layout:** user can drag and reorder all dashboard widgets; layout persists across sessions; a 「Reset Layout」 button restores the default arrangement
- **Download Dashboard Report Button:** exports a PDF snapshot of all current dashboard data, charts (rendered as images), and summary cards; PDF includes a cover page with farm name and date range
- **Dashboard Tour Button:** a 「Take Tour」 button in the top-right corner that launches an interactive step-by-step guide highlighting each dashboard widget and its purpose

#### Crop Encyclopedia
- Searchable and filterable list of crops (filter by soil type, season, difficulty, water requirement, climate zone, growth duration)
- Toggle between grid card view, list view, and a new compact table view
- Each crop card shows: name, image, soil type, growing season, expected yield, recommended fertilizers, water requirement badge, difficulty badge, and a 「Quick Add」 button
- Clicking a card opens a detail modal with full description, care tips, companion planting suggestions, common pests and diseases, growth timeline diagram, and a new 「Nutrient Requirements」 section listing NPK ratios
- 「Add to My Crops」 button on each detail modal that pre-fills the Crops Management add form
- **Compare Crops Feature:** select up to 5 crops (increased from 3) and view a side-by-side comparison table of key attributes; comparison table is exportable as CSV
- **User-Submitted Notes:** each crop detail modal has a private notes field where the user can save personal observations; notes persist per user and are displayed in a collapsible section
- **Crop Rating System:** users can rate each crop (1–5 stars) based on their experience; average rating is displayed on the crop card; ratings are stored per user
- **Seasonal Crop Highlights:** a new banner at the top of the page highlighting 3–5 crops ideal for the current season with 「View Details」 links
- **Crop Growth Simulator:** a new interactive tool within each crop detail modal allowing users to input planting date and view a projected growth timeline with key milestones (germination, flowering, harvest)
- Data pre-populated with at least 30 common rural crops (increased from 20)
- Pagination or infinite scroll for the crop list
- 「Bookmark」 toggle on each crop card; bookmarked crops appear in a 「Saved Crops」 tab
- **Recently Viewed Crops:** a new section at the bottom of the page showing the last 5 crops the user viewed with quick links to their detail modals

#### Plant Diagnosis (AI)
- Drag-and-drop image upload zone (JPG/PNG, max 5MB pre-compression) with preview thumbnail and a new 「Capture Photo」 button to use device camera directly
- Upload handled via Supabase Storage with automatic compression; upload progress bar displayed
- On upload: calls /plant/predict endpoint with a loading spinner and animated progress message
- Displays: detected disease name, confidence score as a visual progress bar with percentage label, treatment suggestions in a step-by-step numbered list, and a new 「Urgency Level」 badge (Low / Medium / High / Critical)
- Severity badge (Low / Medium / High) color-coded
- **Affected Area Estimator:** after diagnosis, a slider allows the user to input the estimated percentage of affected crop area; the tool calculates and displays projected yield loss based on severity and affected area; yield loss is shown as a percentage and an estimated quantity
- **Treatment Cost Estimator:** based on the treatment steps returned, displays an estimated cost range for treatment materials (dummy pricing data); cost breakdown is shown per treatment step
- **Treatment Timeline:** a new visual timeline showing recommended treatment schedule (e.g., Day 1: Apply fungicide, Day 3: Monitor, Day 7: Re-apply if needed)
- **Similar Cases Panel:** a new section displaying 3–5 similar past diagnoses from the user's history with thumbnails and quick links; helps users identify recurring issues
- 「Save Diagnosis」 button to store result and image thumbnail to history
- 「Share Diagnosis」 button: generates a shareable summary card (PNG export) of the diagnosis result with QR code linking to a public view (optional)
- **Diagnosis Confidence Meter:** a new visual meter showing the AI model's confidence level with color-coded zones (Low: red, Medium: yellow, High: green); includes a tooltip explaining confidence interpretation
- **History of Past Diagnoses:** table with date, image thumbnail, disease name, confidence, severity, affected area, urgency level — with delete and 「Re-diagnose」 actions per row
- Filter history by date range, severity, or urgency level
- 「Re-diagnose」 button on each history row to re-upload the same image
- **Diagnosis Trend Chart:** bar chart showing diagnosis count by disease type over the last 30 days; includes a toggle to switch to a line chart view
- **Export Diagnosis History to CSV:** button to download all diagnosis records with metadata
- **AI Model Info Panel:** a collapsible info section explaining the AI model used, its accuracy rate, and data sources; includes a 「Report Incorrect Diagnosis」 link for user feedback

#### Farm Records
- Daily log entries: date, activity type, description, cost, optional image attachment (upload via Supabase Storage), and a new 「Duration」 field (hours spent on activity)
- Image thumbnail displayed in the log table row; clicking the thumbnail opens a full-size preview modal with zoom and rotate controls
- Inline Add / Edit / Delete with confirmation dialog on delete
- Filter logs by date range, activity type, or cost range via dropdown and slider controls
- **Summary Bar:** above the table displaying total entries, total cost, total hours logged, and average cost per entry for the filtered period
- **Activity Type Color-Coded Badges:** in the table with custom icons per activity type
- **Bulk Delete:** checkbox selection on rows with a 「Delete Selected」 button and a 「Select All」 checkbox in the header
- **Recurring Log Templates:** user can save a log entry as a template; templates appear in a 「Templates」 dropdown when adding a new entry, pre-filling all fields; templates are editable and deletable
- **Log Entry Comments:** each log entry has an expandable comments section where the user can add timestamped notes after the fact; comments are displayed in a threaded view
- **Activity Summary Chart:** a bar chart below the table showing activity frequency by type for the filtered period; includes a toggle to switch to a pie chart view
- **Cost Trend Line Chart:** a new line chart showing daily or weekly cost trends over the selected date range; helps identify spending patterns
- **Export to CSV:** frontend-side export of filtered log entries
- **Export to PDF:** generates a formatted report of filtered log entries with summary statistics and charts rendered as images
- **Log Entry Attachments:** support for multiple image attachments per log entry (up to 5 images); thumbnails displayed in a horizontal scrollable row within the table
- **Quick Stats Cards:** above the table, displaying 「Most Frequent Activity」, 「Highest Cost Entry」, and 「Total Hours This Month」 with animated counters
- New entries added by other connected clients appear in real time via Supabase Realtime with a brief highlight animation

#### Crops Management
- **Add Crop Form:** name, field assigned, planting date, expected harvest date, variety, crop photo (image upload via Supabase Storage), notes field, and new fields: 「Seed Source」, 「Planting Density (plants per sqm)」, 「Expected Yield (kg)」 — opens in a modal
- Crop photo thumbnail displayed on the crop list row and within the detail drawer
- 「Remove Image」 button on edit form to delete the current photo
- **Growth Stage Tracker:** displayed as a horizontal stepper: Seedling → Vegetative → Flowering → Harvest; farmer clicks 「Advance Stage」 button to move to next stage; each stage displays an estimated duration and progress bar
- Stage advancement logs the date automatically and syncs in real time to all connected clients via Supabase Realtime
- **Stage Notes:** when advancing a stage, a notes field is presented for the farmer to record observations; notes are stored with the stage advancement log and displayed in the crop detail drawer
- **Stage Photos:** option to upload a photo when advancing a stage; stage photos are displayed in a timeline view within the crop detail drawer
- **Yield Tracking:** actual vs expected yield input fields appear when stage reaches Harvest; displays variance percentage and a visual comparison bar chart
- **Harvest Quality Rating:** when logging actual yield at Harvest stage, user selects a quality rating (Excellent / Good / Fair / Poor); rating is stored and displayed in the crop detail drawer with a color-coded badge
- **Crop Cost Tracker:** per-crop cost log (inputs: cost type, amount, date) accessible from the crop detail drawer; total cost per crop displayed alongside yield data for profitability calculation; cost breakdown shown as a pie chart
- **Crop Revenue Tracker:** per-crop revenue log (inputs: sale amount, buyer, date) accessible from the crop detail drawer; total revenue per crop displayed; net profit calculated and shown with a visual indicator
- **List View:** with status badges, color-coded growth stage indicators, and new columns: 「Days Since Planting」, 「Expected Harvest Date」, 「Profitability」 (revenue - cost)
- Inline edit and delete per crop row
- **Crop Detail Panel (Side Drawer):** showing full history of stage advancements, yield data, cost log, revenue log, harvest quality, stage photos timeline, and a new 「Crop Health Score」 (0–100) calculated from stage progression speed and yield efficiency
- Filter list by growth stage, field, or profitability range
- **Bulk Stage Advance:** select multiple crops at the same growth stage and advance all simultaneously with a single notes entry
- **Bulk Delete:** select multiple crops and delete all at once with confirmation
- **Crop Rotation Planner:** a dedicated tab within Crops Management showing a calendar-based view of past and planned crops per field; includes a 「Suggest Rotation」 button that auto-generates a rotation plan based on crop history
- **Crop Performance Leaderboard:** a new widget at the top of the page showing the top 5 performing crops ranked by yield efficiency or profitability; clicking a crop navigates to its detail drawer
- **Export Crops Data to CSV:** button to download all crop records with full metadata

#### Livestock Management
- **Add Animal Form:** type, breed, count, date acquired, animal image (image upload via Supabase Storage), notes field, and new fields: 「Tag/ID Number」, 「Purchase Cost」, 「Current Weight (kg)」 — opens in a modal
- Animal image thumbnail displayed on the livestock list row
- 「Remove Image」 button on edit form to delete the current image
- **Health Records per Animal:** weight, condition notes, vet visits, temperature, and a new 「Health Status」 dropdown (Healthy / Sick / Under Treatment / Recovered) — displayed in a collapsible sub-table per animal row
- Add health record button per animal opens an inline form; new health records sync in real time via Supabase Realtime
- **Weight Trend Chart:** per-animal line chart showing weight over time, rendered within the expanded health records sub-table; includes a target weight line for comparison
- **Feeding Log:** per-animal feeding log tab (fields: feed type, quantity, date, cost); accessible from the animal detail drawer; monthly feed cost summary displayed; includes a 「Feed Efficiency」 metric (weight gain per kg of feed)
- **Mortality Log:** a dedicated section to record animal deaths (fields: animal, date, cause, notes); mortality count displayed in the summary card; includes a 「Mortality Rate」 percentage for the current year
- **Vaccination Reminders:** upcoming vaccinations shown in a dedicated alert panel at the top of the page; each reminder has a 「Mark as Done」 button and a 「Snooze」 button to postpone by 7 days
- Add vaccination reminder form: animal, vaccine name, due date, dosage notes, and a new 「Reminder Frequency」 field (one-time / recurring)
- **Vaccination History:** completed vaccinations are moved to a collapsible history table per animal with date, vaccine name, and administrator notes
- **Breeding Records:** a new tab within Livestock Management to track breeding events (fields: parent animals, breeding date, expected delivery date, outcome); includes a 「Breeding Success Rate」 metric
- **List View:** with expandable rows for health records, feeding log, and breeding records; includes new columns: 「Current Weight」, 「Health Status」, 「Days Since Acquisition」
- Filter animals by type, breed, or health status
- **Summary Cards:** total animals, animals with overdue vaccinations, total mortality this month, average weight gain this month, total feed cost this month
- **Livestock Performance Dashboard:** a new section with charts showing weight gain trends, feed efficiency by animal type, and health status distribution (pie chart)
- **Export Livestock Report to CSV:** includes all animal records, health records, feeding log data, and breeding records
- **Animal Detail Drawer:** clicking an animal row opens a side drawer with full animal profile, photo gallery (if multiple images uploaded), complete health history, feeding log, vaccination history, and breeding records

#### Inventory & Equipment
- **Inventory Tab:**
  - Item name, category, quantity, unit, reorder threshold, supplier name, unit cost, and new fields: 「Last Restocked Date」, 「Expiry Date (if applicable)」 — full CRUD
  - Quantity can be updated via a 「+」 / 「-」 stepper control inline; quantity changes sync in real time to all connected clients via Supabase Realtime
  - Low stock alert badge shown on items where quantity ≤ reorder threshold
  - **Expiry Alert Badge:** shown on items with expiry date within 30 days or already expired
  - **Reorder Request Log:** when an item hits the reorder threshold, a 「Log Reorder」 button appears; clicking it adds an entry to a Reorder Log tab with date, item, quantity requested, supplier, and status (Pending / Ordered / Received)
  - **Inventory Valuation:** a summary card at the top of the Inventory tab shows total inventory value (quantity × unit cost) across all items; includes a 「Value Trend」 line chart showing inventory value over the last 6 months
  - **Stock Movement Log:** a new sub-tab showing all quantity changes (additions, deductions) with timestamp, reason, and user; helps track inventory flow
  - **Category-Based Filtering:** filter inventory by category with a visual category selector (icons + labels)
  - **Bulk Reorder:** select multiple low-stock items and generate a combined reorder request
  - **Export Inventory List to CSV**
- **Equipment Tab:**
  - Name, type, purchase date, last maintenance date, next maintenance date, purchase cost, current condition (Good / Fair / Needs Repair), and new fields: 「Manufacturer」, 「Model Number」, 「Warranty Expiry Date」 — full CRUD
  - **Maintenance Schedule:** displayed as a calendar view (monthly grid); days with scheduled maintenance are highlighted; clicking a calendar day shows a tooltip with equipment name and maintenance type
  - 「Mark Maintained」 button on equipment row updates last maintenance date to today and auto-calculates next maintenance date based on a set interval
  - **Maintenance History Log:** per-equipment collapsible table showing all past maintenance events with date, type, cost, notes, and a new 「Performed By」 field
  - **Equipment Depreciation Tracker:** based on purchase cost and purchase date, displays estimated current value using straight-line depreciation over a user-set useful life (years); depreciation shown as a line chart per equipment
  - **Warranty Alert Badge:** shown on equipment with warranty expiry within 60 days or already expired
  - **Equipment Utilization Log:** a new sub-tab to record equipment usage (fields: equipment, date, hours used, operator); helps track utilization rate and plan maintenance
  - **Equipment Performance Score:** a calculated score (0–100) per equipment based on maintenance frequency, condition, and utilization rate; displayed as a badge on the equipment row
  - **Export Equipment List to CSV**
- **Summary Cards (Inventory & Equipment Combined):** total inventory value, low stock items count, equipment needing maintenance count, total equipment value, items expiring soon count

#### Financial Management
- **Income Tab:**
  - Source, amount, date, category, linked crop (optional dropdown), payment method (Cash / Bank Transfer / Check), and notes — full CRUD in a table with inline edit
  - New income entries sync in real time to all connected clients via Supabase Realtime; summary cards and charts update accordingly
- **Expense Tab:**
  - Description, amount, date, category, linked crop (optional dropdown), payment method, receipt image upload (Supabase Storage, thumbnail in table), and notes — full CRUD in a table with inline edit
  - New expense entries sync in real time; summary cards and charts update accordingly
- **Summary Tab:**
  - **Profit/Loss Summary Card:** displays net profit/loss with a large animated number counter and a trend indicator vs previous period
  - **Monthly Profit Bar Chart (Chart.js):** toggle to switch between monthly, quarterly, and yearly views; bars are color-coded (green for profit, red for loss); animated on load
  - **Category Breakdown Pie Chart:** shows expense distribution by category; clicking a slice filters the expense table to that category
  - **Year-to-Date Totals Card:** displays YTD income, YTD expenses, and YTD profit with mini trend sparklines
  - **Cash Flow Forecast:** a line chart projecting the next 3 months of income and expenses based on historical averages; includes a confidence interval shaded area
  - **Per-Crop Profitability Table:** listing each active crop with its total linked income, total linked expenses, net profit, and profit margin percentage; sortable by any column
  - **Top Expense Categories:** a new horizontal bar chart showing the top 5 expense categories by total amount for the selected period
  - **Income vs Expense Trend:** a new dual-axis line chart showing income and expense trends over time on the same chart for easy comparison
- **Chart Toggles:** switch between monthly, quarterly, and yearly views for all charts
- **Filter All Tabs by Date Range:** global date range selector at the top of the page
- **Running Balance Column:** in income and expense tables showing cumulative balance after each transaction
- **Export Income or Expense Data to CSV**
- **Export Full Financial Report to PDF:** formatted report including summary cards, charts (as images), and transaction tables for the selected date range; includes a cover page with farm name and report period
- **Budget Planner:**
  - Set a monthly budget per expense category; progress bar shows actual vs budget per category; overspending triggers a warning badge
  - **Budget History:** view past months' budget vs actual comparisons in a table within the Budget Planner section; includes a 「Budget Adherence Score」 (0–100) per month
  - **Budget Alerts:** automatic alerts when a category reaches 80% or 100% of its budget
- **Recurring Transactions:**
  - Mark an income or expense entry as recurring (daily / weekly / monthly); the system auto-generates the next entry on the due date
  - **Recurring Transactions Manager:** a dedicated sub-tab listing all recurring transactions with edit and delete actions; includes a 「Pause」 toggle to temporarily stop auto-generation
- **Financial Goals Tracker:** a new section where users can set financial goals (e.g., 「Reach $10,000 revenue by end of Q2」); progress toward each goal is shown as a progress bar with percentage and remaining amount
- **Tax Estimator:** a new tool that estimates tax liability based on total income and user-selected tax rate; displayed as a summary card with a breakdown by quarter

#### Orders & Marketplace
- **Product Listings Tab:**
  - Add product with name, description, price, quantity available, product image (upload via Supabase Storage with compression and thumbnail generation), category tag, and new fields: 「Unit (kg / piece / bunch)」, 「Discount (%)」, 「Featured (toggle)」 — full CRUD
  - Product card grid view displays product thumbnail, price, discount badge (if applicable), and featured badge; edit and delete actions per card
  - 「Remove Image」 button on edit form to delete the current product image
  - **Product Visibility Toggle:** each product listing has an Active / Inactive toggle; inactive listings are hidden from buyers but retained in the seller's list
  - **Bulk Price Update:** select multiple product listings and apply a percentage increase or decrease to all selected prices simultaneously
  - **Featured Products Section:** a new banner at the top of the Product Listings tab showing all products marked as Featured with larger thumbnails
  - **Product Performance Metrics:** per product, display total orders, total revenue, and average rating (if ratings are enabled); accessible from the product card or detail modal
- **Orders Tab:**
  - Table showing buyer name, product, quantity, total, status (Pending / Confirmed / Shipped / Delivered), payment status (Paid / Unpaid), order date, and a new 「Delivery Date」 field
  - Status update via inline dropdown per order row; status change triggers a toast notification and syncs in real time to all connected clients via Supabase Realtime
  - Payment tracking column: paid / unpaid toggle per order
  - **Delivery Notes Field:** per order, a text field for adding internal delivery notes; notes visible in the order detail modal
  - **Order Detail Modal:** full order summary with timeline of status changes, delivery notes, payment history, buyer contact info, and a 「Print Invoice」 button
  - **Order Priority Flag:** a new toggle per order to mark high-priority orders; priority orders are highlighted in the table with a badge
  - Filter orders by status, payment status, date range, or priority
  - **Summary Bar:** total orders, total revenue, pending count, unpaid count — updates in real time
  - Search orders by buyer name, product name, or order ID
  - New incoming orders appear in real time via Supabase Realtime without manual refresh; a toast notification is shown for each new order
- **Sales Analytics Tab:**
  - **Top-Selling Products Bar Chart:** showing the top 10 products by order volume; includes a toggle to switch to a revenue-based ranking
  - **Revenue by Product Category Pie Chart:** with percentage labels and a legend
  - **Order Volume Over Time Line Chart:** for the selected date range; includes a toggle to overlay revenue on the same chart
  - **Average Order Value Card:** displaying the mean order value with a trend indicator
  - **Sales Conversion Rate:** a new metric showing the percentage of product views that resulted in orders (dummy data or calculated if view tracking is implemented)
  - **Monthly Sales Comparison:** a new bar chart comparing current month sales to the previous month and the same month last year
- **Customer List Tab:**
  - Listing unique buyers with total orders placed, total spend, last order date, and a new 「Customer Tier」 badge (Bronze / Silver / Gold based on total spend)
  - Clicking a buyer shows their order history in a side drawer with full order details
  - **Customer Lifetime Value (CLV):** displayed per customer as a calculated metric
  - **Export Customer List to CSV**
- **Promotions Manager (New):**
  - A new sub-tab to create and manage promotional campaigns (fields: promo name, discount percentage, applicable products, start date, end date, promo code)
  - Active promotions are displayed as badges on applicable product cards
  - **Promo Performance Tracker:** shows total orders using each promo code and total discount given

#### Weather Module
- **Current Conditions Card:** temperature, humidity, rainfall, UV index, wind speed, and a new 「Feels Like」 temperature with animated weather icons
- **5-Day Forecast Cards:** in a horizontal scrollable row; each card shows high/low temperature, precipitation probability, and weather icon
- **Hourly Forecast:** expandable section showing hourly temperature, precipitation, and wind speed for the next 24 hours; rendered as a line chart with toggles
- Data fetched from /weather endpoint (dummy data or open weather API integration)
- **Weather Warning Banner:** at the top if extreme conditions detected (temperature > 40°C, rainfall > 100mm, wind speed > 50 km/h, or frost risk); banner is color-coded by severity
- **Hourly Temperature Chart:** for today (Chart.js line chart) with a shaded area showing the comfort zone (18–28°C)
- **Wind Speed and Direction Indicator:** with an animated compass rose showing wind direction
- **Soil Moisture Index Card:** displays an estimated soil moisture level based on recent rainfall and temperature data; color-coded (Dry / Adequate / Saturated); includes a 「Recommended Action」 label (e.g., 「Irrigate Today」)
- **Frost Risk Indicator:** displays a frost risk level (None / Low / High) based on overnight temperature forecast; includes a 「Protect Crops」 alert if risk is High
- **Historical Weather Comparison:** a toggle to overlay last year's same-period temperature and rainfall data on the current charts for comparison; helps identify seasonal patterns
- **Farming Recommendation Panel:** auto-generated tips based on current weather (e.g., 「High temperature detected — consider extra irrigation today」); recommendations are prioritized by urgency
- **Weather-Based Task Suggestions:** below the recommendation panel, a list of suggested farm tasks generated from current weather conditions (e.g., 「Apply fungicide — high humidity forecast」); each suggestion has an 「Add as Task」 button that creates a task in the Task Manager
- **Weather Alerts History:** a new collapsible section showing past weather warnings with date, type, and severity; helps track extreme weather events
- **Sunrise and Sunset Times Card:** displays today's sunrise and sunset times with a visual timeline showing daylight hours
- **Moon Phase Indicator:** a new widget showing the current moon phase with an icon; useful for farmers who follow lunar planting calendars
- **Pollen Forecast (if available):** displays pollen level (Low / Moderate / High) for the next 3 days; relevant for farmers with allergies or beekeeping operations

#### Farm Mapping
- **Visual Grid-Based Field Map:** (UI-only, no external map API required); each grid cell represents a field plot; grid size configurable (e.g., 5×5, 8×8, 10×10) via a selector
- Click a cell to open an assignment modal: select crop from dropdown, add plot label, add notes, and new fields: 「Soil Type」, 「Irrigation Zone」, 「Last Crop Planted」
- **Color-Coded by Crop Type:** with a legend displayed alongside the map; legend is interactive and clicking a crop type highlights all cells with that crop
- Hover over a cell shows a tooltip: plot label, assigned crop, planting date, current growth stage, soil type, and irrigation zone
- 「Clear Plot」 button in the assignment modal to unassign a crop from a cell
- **Plot History:** each cell retains a history of previously assigned crops; accessible via a 「View History」 link in the assignment modal, displayed as a timeline list with dates and crop names
- **Field Health Overlay:** a toggle to switch the map color scheme from crop-type coloring to a health status coloring (Healthy / At Risk / Diseased) based on the latest Plant Diagnosis results linked to each plot
- **Irrigation Zone Overlay:** a second toggle to color cells by assigned irrigation zone; zones are user-defined labels; includes a 「Manage Zones」 button to add/edit/delete zones
- **Soil Type Overlay:** a new toggle to color cells by soil type; helps visualize soil distribution across the farm
- **Summary Panel:** below the map displaying total plots, assigned plots, unassigned plots, crop distribution list, and a new 「Field Utilization Rate」 percentage
- **Plot Notes:** each cell can have multiple timestamped notes; notes are displayed in the assignment modal in a scrollable list
- **Bulk Assignment:** select multiple cells and assign the same crop to all at once
- **Export Map as PNG:** a button to download the current map grid as a PNG image with legend and summary panel included
- **3D Map View (Optional):** a toggle to switch to a 3D isometric view of the field map with elevated cells representing different growth stages; purely visual enhancement
- **Field Rotation Suggestions:** a new button that analyzes plot history and suggests optimal crop rotation for each plot based on past crops and soil health

#### Analytics Dashboard
- **Crop Yield Comparison Bar Chart:** by crop, with multi-select crop filter; includes a toggle to switch to a stacked bar chart showing yield by field
- **Financial Growth Over Time Line Chart:** toggle between revenue, expenses, and profit; includes a moving average trendline overlay
- **Resource Usage Breakdown Pie Chart:** (water, fertilizer, labor) with percentage labels; clicking a slice opens a detailed breakdown modal
- **Top Performing Crops Table:** ranked by yield efficiency; includes columns: crop name, yield per sqm, profitability, growth duration
- **Bottom Performing Crops Table:** ranked by lowest yield efficiency, displayed below the top performers table; includes a 「Suggested Actions」 column with improvement tips
- **Livestock Performance Chart:** bar chart showing weight gain per animal type over the selected period; includes a target weight line for comparison
- **Inventory Turnover Chart:** line chart showing inventory consumption rate per category over time; helps identify fast-moving vs slow-moving items
- **Alert Frequency Chart:** bar chart showing the number of smart alerts triggered per type (Low Water, Disease, Weather, Low Stock, Task Overdue) over the selected period; includes a toggle to switch to a pie chart view
- **Farm Efficiency Score:** a new summary card displaying an overall farm efficiency score (0–100) calculated from crop yield, financial performance, resource usage, and task completion rate; score is rendered as an animated gauge chart
- **Seasonal Performance Comparison:** a new chart comparing key metrics (yield, revenue, expenses) across the four seasons; helps identify seasonal trends
- **Labor Productivity Chart:** a new bar chart showing labor hours logged vs output (yield or revenue) per month; helps assess workforce efficiency
- **Water Usage Efficiency:** a new metric showing water used per kg of yield; displayed as a line chart over time
- **Date Range Filter:** applied globally to all charts on the page; includes preset options (Last 30 Days, Last 90 Days, This Year, Custom Range)
- **Export Report Button:** generates a summary CSV of all visible chart data
- **Export Report as PDF:** generates a formatted PDF report with all charts rendered as images, summary tables, and a cover page with farm name and report period
- **Animated Chart Entry Transitions:** on page load with staggered timing for visual appeal
- **Chart Drill-Down:** clicking a data point on any chart opens a detailed breakdown modal with granular data

#### Government Schemes
- **List of Subsidy Programs, Insurance Schemes, and Loan Programs:**
  - Each entry card: scheme name, description, eligibility, application deadline, benefit amount, external link button, contact information field, and a new 「Scheme Type」 badge (Subsidy / Insurance / Loan)
  - **Deadline Proximity Badge:** 「Closing Soon」 badge if deadline is within 30 days; 「Expired」 badge if deadline has passed; 「New」 badge for schemes added in the last 7 days
- Search by keyword and filter by scheme type (subsidy / insurance / loan), eligibility category, and benefit amount range
- 「Bookmark」 toggle on each card; bookmarked schemes appear in a 「Saved Schemes」 tab
- **Application Tracker:**
  - Each scheme card has an 「Track Application」 button; clicking it opens a modal where the user can log their application status (Not Applied / Applied / Under Review / Approved / Rejected) and add notes
  - Tracked applications appear in a dedicated 「My Applications」 tab with status badges and a timeline view showing status changes
  - **Application Reminders:** automatic reminders for schemes with approaching deadlines that the user has bookmarked but not yet applied to
- **Scheme Comparison:**
  - Select up to 5 schemes (increased from 3) and view a side-by-side comparison of eligibility, benefit amount, deadline, and application process
  - Comparison table is exportable as PDF
- **Eligibility Checker:** a new interactive tool where users input their farm details (size, location, crop types, income) and the system highlights schemes they are likely eligible for
- **Scheme Notifications:** a new alert panel at the top of the page showing newly added schemes or schemes with updated deadlines
- **Scheme Success Stories:** a new section displaying anonymized case studies or testimonials from farmers who successfully received benefits from listed schemes
- All data is dummy/static and not editable by users
- Pagination: 10 schemes per page with a 「Load More」 button
- **Export Saved Schemes to PDF:** generates a formatted list of bookmarked schemes with full details

#### Task Manager (Rural)
- **Task List with Full CRUD:**
  - Task name, description, due date, priority (High / Medium / Low), status (To Do / In Progress / Done), linked module (optional: Crops, Livestock, Inventory, etc.), and new fields: 「Assigned To (user or team member)」, 「Estimated Duration (hours)」, 「Actual Duration (hours)」
  - Priority badges color-coded per row
- Filter tasks by status, priority, due date range, linked module, or assigned user
- **Kanban Board View:**
  - Toggle between list view and a Kanban board with columns for To Do, In Progress, and Done; tasks are draggable between columns
  - Each column displays a task count badge
  - Drag-and-drop updates task status in real time via Supabase Realtime
- **Calendar View:**
  - Toggle to a monthly calendar showing tasks by due date; clicking a date shows tasks due that day in a side panel
  - Overdue tasks are highlighted in red on the calendar
- **Overdue Tasks:** highlighted in red in list view; overdue count shown as a badge on the sidebar item
- Task status changes sync in real time via Supabase Realtime
- **Recurring Tasks:**
  - Mark a task as recurring (daily / weekly / monthly); the system auto-generates the next instance upon completion
  - **Recurring Tasks Manager:** a dedicated sub-tab listing all recurring tasks with edit, delete, and 「Pause」 actions
- **Task Comments:**
  - Each task has an expandable comments section for timestamped notes; comments are displayed in a threaded view
  - Comments sync in real time; new comments trigger a notification badge on the task row
- **Bulk Status Update:** select multiple tasks and update their status simultaneously
- **Bulk Delete:** select multiple tasks and delete all at once with confirmation
- **Task Dependencies:** a new feature allowing users to mark a task as dependent on another task; dependent tasks are automatically moved to To Do only after the parent task is marked Done
- **Task Templates:** save a task as a template; templates appear in a 「Templates」 dropdown when adding a new task, pre-filling all fields
- **Task Performance Metrics:** a new summary section showing total tasks completed this month, average completion time, and on-time completion rate
- **Task Notifications:** automatic reminders for tasks due within 24 hours; reminders appear as in-app alerts and in the navbar notification dropdown
- **Export Task List to CSV:** includes all task metadata and comments
- **Task Timeline View:** a new Gantt-chart-style view showing tasks plotted on a timeline by due date and duration; helps visualize task scheduling and overlaps

---

### 3.6 Urban Farming Pages

#### Urban Dashboard
- **Hero Section:** full-width hero banner with seasonal parallax background image, animated gradient overlay, and large welcome message displaying user's name and current date; hero includes a prominent call-to-action button 「Quick Start Guide」 that opens a contextual help modal
- **Summary Cards:** Active Plants, Water Used Today, Pending Orders, Alerts, Pending Tasks — each card is clickable and navigates to the corresponding module; cards feature animated number counters on page load, glassmorphism styling, and 3D tilt effect on hover
- **KPI Trend Indicators:** each summary card displays a trend indicator (e.g., +8% vs last week) with animated up/down arrow icon and color-coded background
- **Crop Suggestions Panel:** AI-driven recommendations based on season and location, displayed as horizontal scrollable cards with 「Add to Plan」 button per suggestion; includes a 「Why This Crop?」 tooltip explaining the recommendation
- **Smart Alerts Panel:** redesigned as an expandable accordion-style widget; each alert has a dismiss button, 「View Details」 link, and a severity icon; new alerts appear instantly via Supabase Realtime with a subtle slide-in animation
- **Recent Watering Activity Feed:** displays the last 10 irrigation log entries (increased from 5) with timestamp, zone name, and amount used; updates in real time; feed is scrollable within a fixed-height container
- **Upcoming Tasks Widget:** displays the next 10 tasks (increased from 5) sorted by due date with status badges and priority color-coding; clicking a task opens the Task Manager; overdue tasks are highlighted in red with a pulsing animation
- **Weather Snapshot Widget:** enhanced with current temperature, humidity, UV index, wind speed, and a 5-day mini forecast (increased from 3 days) pulled from the Weather Module; includes animated weather icons and a 「View Full Forecast」 link
- **Garden Health Score Card:** a new widget displaying an overall garden health score (0–100) calculated from plant health, watering consistency, and task completion rate; score is rendered as an animated circular progress bar with color gradient; clicking the card opens a detailed breakdown modal
- **Quick Action Buttons:** 「+ Add Plant」, 「+ Log Watering」, 「+ List Product」, 「+ Add Task」, 「+ Schedule Irrigation」 (new), 「+ Check Plant Health」 (new) — each opens the corresponding form in a modal; buttons feature icon animations on hover
- **Milestone Tracker:** a new horizontal timeline widget showing recent gardening milestones (e.g., 「First Harvest」, 「50 Plants Added」, 「Water Goal Achieved」); milestones are auto-generated based on activity
- **Seasonal Tips Panel:** a new collapsible panel displaying 3–5 urban gardening tips relevant to the current season (e.g., 「Summer: Water early morning or late evening」); tips are static content that rotates based on the current month
- **Auto-Refresh:** every 60 seconds with a visible countdown timer and manual 「Refresh Now」 button (retained as fallback)
- **Date Range Selector:** at the top of the dashboard to filter all chart data; includes preset options (Today, Last 7 Days, Last 30 Days, Custom Range)
- **Customizable Widget Layout:** user can drag and reorder all dashboard widgets; layout persists across sessions; a 「Reset Layout」 button restores the default arrangement
- **Download Dashboard Report Button:** exports a PDF snapshot of all current dashboard data, charts, and summary cards
- **Dashboard Tour Button:** a 「Take Tour」 button in the top-right corner that launches an interactive step-by-step guide highlighting each dashboard widget

#### Crop Planning
- **Input Form:** Location (city/region), Season, Soil Type, Available Space (sqm), Sunlight Level (Full Sun / Partial Shade / Full Shade), Experience Level (Beginner / Intermediate / Advanced), and new fields: 「Budget (optional)」, 「Preferred Crop Types (vegetables / herbs / fruits)」
- On submit: calls /crops/recommend endpoint with a loading spinner and animated progress message during fetch
- **Output:** list of recommended crops displayed as cards with name, expected yield per sqm, care difficulty badge (Easy / Medium / Hard), a short care tip, estimated days to harvest, water requirement badge, and new fields: 「Estimated Cost」, 「Sunlight Match Score」 (how well the crop matches the input sunlight level)
- 「Add to Plan」 button on each result card saves the crop to the user's saved plans
- **Planting Calendar:** for each saved plan, a visual monthly calendar shows the recommended planting window and expected harvest window highlighted in different colors; includes a 「Set Reminder」 button to create a task for the planting date
- **Space Optimizer:** after saving multiple plans, a summary panel shows total space required vs available space, with a warning if the total exceeds the input available space; includes a 「Suggest Adjustments」 button that auto-removes lower-priority plans to fit within available space
- **Saved Plans Section:** below the recommendation results, listing all saved crop plans with date saved, planting calendar link, estimated cost, and ability to delete a plan
- **Plan Comparison:** select up to 3 saved plans and view a side-by-side comparison of space required, cost, yield, and care difficulty
- Re-run recommendation with updated inputs without clearing saved plans
- **Export Saved Plans to PDF:** generates a formatted planting guide PDF for all saved plans with planting calendars and care tips
- **Crop Rotation Suggestions:** a new button that analyzes saved plans and suggests a rotation schedule to maximize space utilization and soil health
- **Budget Tracker:** if a budget is input, the system tracks total estimated cost of saved plans and shows a progress bar vs budget

#### Irrigation System
- **Water Schedule Section:**
  - Add watering schedule per plant/zone — fields: plant/zone name, watering days (multi-select checkboxes for days of week), time of day, water amount (liters), and a new 「Reminder (toggle)」 field to enable/disable reminders for this schedule
  - Schedule list with edit and delete per entry; schedule changes sync in real time via Supabase Realtime
  - **Schedule Status Badge:** each schedule displays an 「Active」 or 「Paused」 badge; user can pause a schedule temporarily without deleting it
- **Daily Water Usage Tracker:** input actual usage per zone for today; running total shown; includes a 「Quick Log」 button to log today's usage for all zones at once based on scheduled amounts
- **Usage Chart (Chart.js Line Chart):** last 7 days with per-zone toggle; includes a target usage line for comparison
- **Monthly Water Usage Summary:** a bar chart showing total water used per month for the last 6 months; includes a toggle to switch to a line chart view
- **Water Cost Estimator:** user inputs a cost per liter rate; the system calculates and displays estimated daily, weekly, and monthly water costs based on logged usage; includes a 「Cost Trend」 line chart
- **Low Water Alert Banner:** if total daily usage exceeds threshold; includes a 「View Details」 link to the usage chart
- 「Skip Today」 button per schedule entry to mark a scheduled watering as skipped; skipped event syncs in real time and is logged in the watering history
- **Watering History Log:** table of past watering events with date, zone, amount used, skipped flag, and a new 「Notes」 field for user comments
- Filter watering history by zone or date range
- **Export Watering History to CSV**
- **Irrigation Efficiency Score:** a calculated score (0–100) displayed as a gauge chart, based on the ratio of scheduled vs actual watering events over the last 30 days; includes a 「How to Improve」 tooltip with tips
- **Smart Watering Suggestions:** a new panel that analyzes recent weather data and suggests adjustments to watering schedules (e.g., 「Rain expected tomorrow — skip outdoor watering」)
- **Zone Map:** a new visual grid-based map showing all irrigation zones color-coded by water usage level (Low / Medium / High); clicking a zone opens its schedule and usage details

#### Plant Health (AI)
- **Symptom-Based Input:** multi-select checklist of symptoms (yellowing, wilting, spots, root rot, etc.) with icons per symptom
- **Optional Drag-and-Drop Image Upload:** (JPG/PNG, max 5MB pre-compression) with preview thumbnail and a new 「Capture Photo」 button to use device camera directly; upload handled via Supabase Storage with automatic compression
- Calls /plant/predict endpoint on submit with loading spinner and animated progress message
- **Returns:** likely condition, severity badge (Low / Medium / High), treatment steps as a numbered list, and a new 「Urgency Level」 badge (Low / Medium / High / Critical)
- **Confidence Score:** shown as a visual progress bar with percentage label and a color-coded zone (Low: red, Medium: yellow, High: green)
- **Preventive Care Tips:** below the treatment steps, a collapsible section displays general preventive care tips for the diagnosed condition
- **Nearby Nursery Suggestions Panel:** a static informational panel suggesting the user search for local nurseries or garden centers for treatment materials (no live API; static text with a Google Maps search link pre-filled with the user's registered location)
- **Treatment Timeline:** a new visual timeline showing recommended treatment schedule (e.g., Day 1: Apply treatment, Day 3: Monitor, Day 7: Re-check)
- **Similar Cases Panel:** a new section displaying 3–5 similar past diagnoses from the user's history with thumbnails and quick links
- 「Save Result」 button stores diagnosis and image thumbnail (if uploaded) to history
- 「Share Result」 button: generates a shareable summary card (PNG export) of the diagnosis result
- **Diagnosis History Table:** date, symptoms selected, image thumbnail (if uploaded), condition, severity, urgency level — with delete and 「Re-diagnose」 actions
- Filter history by severity, urgency level, or date range
- **Diagnosis Trend Chart:** bar chart showing diagnosis count by condition type over the last 30 days; includes a toggle to switch to a pie chart view
- **Export Diagnosis History to CSV**
- **AI Model Info Panel:** a collapsible info section explaining the AI model used, its accuracy rate, and data sources; includes a 「Report Incorrect Diagnosis」 link for user feedback

#### Marketplace
- **Product Listing Form:** name, price, quantity, product image (upload via Supabase Storage with compression and thumbnail generation), category tag, description, and new fields: 「Unit (kg / piece / bunch)」, 「Discount (%)」, 「Featured (toggle)」 — opens in a modal; full CRUD on listed products
- Product grid displays product thumbnail, price, discount badge (if applicable), and featured badge; edit and delete actions per card
- 「Remove Image」 button on edit form to delete the current product image
- **Product Visibility Toggle:** Active / Inactive toggle per listing; inactive listings are hidden from buyers but retained in the seller's list
- **Featured Products Section:** a new banner at the top of the Product Listings showing all products marked as Featured with larger thumbnails
- **Incoming Orders Table:** buyer name, product, quantity, total, status (Pending / Confirmed / Shipped / Delivered), payment status (Paid / Unpaid), order date
- Status update via inline dropdown; 「Mark as Fulfilled」 button sets status to Delivered; status changes sync in real time via Supabase Realtime
- New incoming orders appear in real time without manual refresh; a toast notification is shown for each new order
- Filter orders by status or payment status
- **Summary Bar:** total listings, total orders, total revenue, unpaid count — updates in real time
- **Sales Analytics Tab:**
  - **Top-Selling Products Bar Chart:** showing the top 10 products by order volume; includes a toggle to switch to a revenue-based ranking
  - **Revenue by Category Pie Chart:** with percentage labels
  - **Order Volume Over Time Line Chart:** for the selected date range
  - **Average Order Value Card:** displaying the mean order value with a trend indicator
- **Customer List Tab:**
  - Unique buyers with total orders, total spend, last order date, and a new 「Customer Tier」 badge (Bronze / Silver / Gold based on total spend)
  - Clicking a buyer shows their order history in a side drawer
  - **Export Customer List to CSV**
- **Export Orders to CSV**
- **Promotions Manager (New):**
  - A new sub-tab to create and manage promotional campaigns (fields: promo name, discount percentage, applicable products, start date, end date, promo code)
  - Active promotions are displayed as badges on applicable product cards

#### Analytics
- **Plant Growth Tracking Chart:** manually enter height or health score per plant per date; line chart renders growth over time with per-plant toggle; includes a target growth line for comparison
- **Add Data Point Form:** plant name, date, metric value — inline form above chart
- **Growth Comparison:** select multiple plants and overlay their growth lines on the same chart for comparison
- **Profit Overview Bar Chart:** revenue from marketplace vs costs (monthly); includes a net profit line overlay
- **Monthly Summary Card:** total revenue, total cost, net profit, best-selling product, and a new 「Profit Margin (%)」 metric
- **Water Usage vs Plant Growth Correlation Chart:** scatter plot comparing water usage per zone against plant growth scores over time; includes a trendline
- **Alert Frequency Chart:** bar chart showing smart alert counts by type over the selected period; includes a toggle to switch to a pie chart view
- **Garden Efficiency Score:** a new summary card displaying an overall garden efficiency score (0–100) calculated from plant growth rate, water usage efficiency, and task completion rate; score is rendered as an animated gauge chart
- **Seasonal Performance Comparison:** a new chart comparing key metrics (plant growth, revenue, water usage) across the four seasons
- **Date Range Filter:** applied to all charts; includes preset options (Last 30 Days, Last 90 Days, This Year, Custom Range)
- **Export Data to CSV**
- **Export Analytics Report as PDF:** formatted PDF with all charts rendered as images, summary tables, and a cover page
- **Chart Drill-Down:** clicking a data point on any chart opens a detailed breakdown modal

#### Inventory & Equipment
- **Tools Tab:**
  - Track small tools — name, quantity, condition (Good / Fair / Needs Repair), purchase date, notes, and a new 「Last Used Date」 field — full CRUD
  - Condition badge color-coded per row
  - **Tool Maintenance Reminder:** per tool, set a next-service date; overdue tools show a warning badge
  - **Tool Usage Log:** a new sub-tab to record tool usage (fields: tool, date, hours used, task); helps track utilization
- **Fertilizer Log Tab:**
  - Product name, amount used, date applied, plant applied to, cost per application, and a new 「Application Method (spray / granular / liquid)」 field — full CRUD
  - Low stock alert badge on fertilizer items below a set threshold
  - Set threshold per fertilizer item inline
  - **Fertilizer Usage Chart:** bar chart showing fertilizer consumption per product over the last 30 days; displayed at the top of the Fertilizer Log tab
  - **Fertilizer Cost Summary:** total fertilizer spend for the current month displayed as a summary card
  - **Fertilizer Efficiency Tracker:** a new metric showing fertilizer used per kg of yield; displayed as a line chart over time
- Inventory quantity changes sync in real time via Supabase Realtime
- **Export Tools or Fertilizer Log to CSV**
- **Summary Cards:** total tools, tools needing maintenance, total fertilizer cost this month, low stock items count

#### Weather (Urban)
- **Current Local Weather Card:** temperature, humidity, UV index, wind speed, and a new 「Feels Like」 temperature with animated weather icons
- **3-Day Forecast Cards:** in a horizontal row; each card shows high/low temperature, precipitation probability, and weather icon
- **Hourly Forecast:** expandable section showing hourly temperature and precipitation probability for today; rendered as a line chart
- **Pollen Index Card:** displays current pollen level (Low / Moderate / High) relevant to urban gardeners; includes a 「Allergy Alert」 badge if level is High
- **Sunrise and Sunset Times Card:** displays today's sunrise and sunset times to help users plan outdoor gardening activities; includes a visual timeline showing daylight hours
- **Watering Recommendation Panel:** auto-generated advice based on weather (e.g., 「Rain expected tomorrow — skip irrigation for outdoor plants」); recommendations are prioritized by urgency
- **UV Index Indicator:** with color scale (Low / Moderate / High / Very High) and a 「Sun Protection Needed」 alert if UV is High or Very High
- **Hourly Temperature Mini-Chart:** for today with a shaded comfort zone
- **Weather-Based Task Suggestions:** suggested gardening tasks based on current conditions; each suggestion has an 「Add as Task」 button that creates a task in the Task Manager
- **Weather Alerts History:** a new collapsible section showing past weather warnings with date, type, and severity
- **Moon Phase Indicator:** a new widget showing the current moon phase with an icon; useful for gardeners who follow lunar planting calendars

#### Task Manager (Urban)
- **Task List with Full CRUD:**
  - Task name, description, due date, priority (High / Medium / Low), status (To Do / In Progress / Done), linked module (optional: Crop Planning, Irrigation, Plant Health, etc.), and new fields: 「Estimated Duration (hours)」, 「Actual Duration (hours)」
  - Priority badges color-coded per row
- Filter tasks by status, priority, due date range, or linked module
- **Kanban Board View:**
  - Toggle between list view and a Kanban board with columns for To Do, In Progress, and Done; tasks are draggable between columns
  - Each column displays a task count badge
- **Calendar View:**
  - Toggle to a monthly calendar showing tasks by due date; clicking a date shows tasks due that day in a side panel
  - Overdue tasks are highlighted in red on the calendar
- **Overdue Tasks:** highlighted in red in list view; overdue count shown as a badge on the sidebar item
- Task status changes sync in real time via Supabase Realtime
- **Recurring Tasks:**
  - Mark a task as recurring (daily / weekly / monthly); the system auto-generates the next instance upon completion
  - **Recurring Tasks Manager:** a dedicated sub-tab listing all recurring tasks with edit, delete, and 「Pause」 actions
- **Task Comments:**
  - Each task has an expandable comments section for timestamped notes; comments are displayed in a threaded view
  - Comments sync in real time
- **Bulk Status Update:** select multiple tasks and update their status simultaneously
- **Task Templates:** save a task as a template; templates appear in a 「Templates」 dropdown when adding a new task
- **Task Performance Metrics:** a new summary section showing total tasks completed this month, average completion time, and on-time completion rate
- **Task Notifications:** automatic reminders for tasks due within 24 hours; reminders appear as in-app alerts
- **Export Task List to CSV**
- **Task Timeline View:** a new Gantt-chart-style view showing tasks plotted on a timeline by due date and duration

---

## 4. Business Rules & Logic

- A user may have access to Rural modules, Urban modules, or both, based on Farm Type selected at registration.
- Sidebar navigation items are conditionally rendered based on the user's farm type.
- Smart alerts are generated server-side and delivered to all connected clients immediately via Supabase Realtime subscriptions; the existing 60-second polling is retained as a fallback.
- Alert types and trigger conditions:
  - Low Water: daily water usage > 90% of set threshold
  - Disease Detected: any new plant diagnosis result with confidence > 70%
  - Weather Warning: temperature > 40°C, rainfall > 100mm forecast, wind speed > 50 km/h, or frost risk High
  - Low Stock: inventory item quantity ≤ reorder threshold
  - Task Overdue: a task's due date has passed and its status is not Done
  - Budget Alert: expense category reaches 80% or 100% of set budget
  - Vaccination Reminder: livestock vaccination due within 7 days
  - Application Deadline: government scheme application deadline within 14 days for bookmarked schemes
- All financial figures are stored and displayed in a single currency (USD by default).
- Crop growth stages in Rural Crops Management advance manually by the farmer via the 「Advance Stage」 button; each advancement is timestamped and synced in real time.
- Farm Mapping is UI-only; no geolocation or external map API is used.
- Government Schemes data is static/dummy and not editable by users.
- AI endpoints (/crops/recommend, /plant/predict) return structured JSON responses; frontend renders results dynamically without page reload.
- Chatbot assistant is accessible from a floating button on all pages; it responds to farming-related queries using predefined logic or a lightweight AI model.
- Budget planner in Financial Management compares actual expenses against user-set monthly budgets per category; overspending triggers a warning badge and an alert.
- Order status transitions follow a strict forward-only flow: Pending → Confirmed → Shipped → Delivered; reverting a Delivered order is blocked.
- Bookmarked government schemes and bookmarked crops are stored per user session/profile and persist across logins.
- 「Skip Today」 on an irrigation schedule logs a skipped event in the watering history without recording water usage.
- Global search in the top navbar queries across crops, farm records, orders, government schemes, tasks, and livestock; results are grouped by category in the dropdown.
- Supabase Realtime subscriptions are scoped per authenticated user; clients only receive updates relevant to their own farm data.
- Image uploads are processed client-side for compression before being sent to Supabase Storage; the resulting public URL (original) and thumbnail URL are stored in the corresponding database record.
- Deleting a record that has an associated image triggers deletion of both the original and thumbnail from Supabase Storage.
- Recurring transactions (income/expense) and recurring tasks auto-generate the next instance upon the due date being reached; the user is notified via a toast.
- Product listings set to Inactive are not visible to buyers but remain in the seller's management list.
- Per-crop cost and income linking in Financial Management is optional; unlinked entries are included in overall totals but excluded from per-crop profitability calculations.
- Cash flow forecast is calculated as a 3-month rolling average of historical monthly income and expenses; it is informational only and not editable.
- Irrigation efficiency score is recalculated daily based on the last 30 days of watering history.
- Dark mode preference is stored in the user profile and applied on login.
- Sidebar item order and pinned shortcuts are stored per user profile and persist across sessions.
- Background image season is determined client-side by the current calendar month at page load; the seasonal image set is pre-bundled and requires no external API.
- The parallax scrolling effect on hero section background images is disabled on viewports narrower than 768px.
- Background image fade-in animation triggers only after the image resource has fully loaded; if the image fails to load, the element renders with the configured fallback background color.
- WebP background images are served as the primary source; JPG or PNG fallback sources are provided for browsers without WebP support.
- Farm Performance Score (Rural Dashboard) and Garden Health Score (Urban Dashboard) are recalculated daily based on the latest data across all modules.
- Milestone achievements are auto-generated based on predefined thresholds (e.g., 10 crops planted, 100 tasks completed, $5,000 revenue reached) and displayed on dashboards.
- Task dependencies are enforced: a dependent task cannot be moved to In Progress until its parent task is marked Done.
- Customer tiers (Bronze / Silver / Gold) in Marketplace are calculated based on total spend: Bronze (< $500), Silver ($500–$1,999), Gold ($2,000+).
- Eligibility Checker in Government Schemes uses rule-based logic to match user inputs against scheme eligibility criteria; no external API is used.
- Seasonal tips and crop highlights rotate automatically based on the current calendar month; content is static and pre-defined.

---

## 5. Exceptions & Edge Cases

| Scenario | Handling |
|---|---|
| Login with incorrect credentials | Show inline error message; do not reveal which field is wrong |
| Image upload exceeds 5MB (pre-compression) | Show validation error before upload begins |
| Image compression fails | Show error toast: 「Image processing failed. Please try a different file.」; do not proceed with upload |
| Supabase Storage upload fails | Show error toast: 「Image upload failed. Please try again.」; form submission is blocked until upload succeeds or image is removed |
| AI endpoint returns no result | Display 「No diagnosis available. Please try a clearer image.」 |
| Weather API unavailable | Show last cached data with a 「Data may be outdated」 notice |
| Empty dashboard (new user) | Show onboarding prompt: 「Add your first crop to get started」 with a shortcut button |
| Inventory item quantity goes negative | Block submission; show error 「Quantity cannot be less than zero」 |
| Order status update conflict | Prevent reverting a Delivered order to Pending; show error toast |
| Session expiry | Redirect to login page with 「Session expired. Please log in again.」 message |
| Chart.js data is empty | Render empty state message inside chart container instead of blank chart |
| Form submission with missing required fields | Highlight missing fields in red with descriptive error labels |
| Crop stage already at Harvest | Disable 「Advance Stage」 button; show 「Harvest stage reached」 label |
| Bulk delete with no rows selected | Disable 「Delete Selected」 button; show tooltip 「Select at least one item」 |
| /crops/recommend returns empty list | Display 「No crops found for the given inputs. Try adjusting your parameters.」 |
| Farm map cell already assigned | Assignment modal shows current crop with option to reassign or clear |
| Budget not set for a category | Show 「No budget set」 placeholder in budget planner; prompt user to set one |
| Supabase Realtime connection lost | Show non-blocking banner: 「Live updates paused — reconnecting…」; banner auto-dismisses on reconnection |
| Realtime update received for a record not currently visible | Update is applied to the underlying data store silently; UI reflects the change when the user navigates to the relevant view |
| Deleting a record with an associated image | Delete image (original + thumbnail) from Supabase Storage before removing the database record; show error toast if storage deletion fails but proceed with record deletion |
| Recurring task or transaction generation fails | Show error toast; retain the original entry and retry on next app load |
| Space optimizer detects total planned area exceeds available space | Show a warning banner in the Saved Plans section: 「Total planned area exceeds your available space. Consider removing some plans.」 |
| Kanban drag-and-drop fails (e.g., network error during status update) | Revert the card to its original column and show an error toast |
| PDF export fails | Show error toast: 「Export failed. Please try again.」; do not leave a partial file |
| Forgot password email not received | Display a note: 「If you do not receive an email within a few minutes, check your spam folder or try again.」 |
| Irrigation efficiency score has insufficient data (< 7 days of history) | Display 「Insufficient data — check back after 7 days of logged activity」 instead of the gauge |
| Background image fails to load | Render the element with the configured fallback background color (#F1F8E9 in light mode; appropriate dark tone in dark mode); no broken image indicator is shown |
| Browser does not support WebP | Serve the JPG or PNG fallback source declared in the picture element; visual output is identical |
| Background image is still loading when the page renders | Hold opacity at 0 until the image load event fires, then trigger the fade-in animation; prevent flash of unstyled content |
| Parallax scroll listener fires on a mobile viewport (< 768px) | Parallax effect is not applied; background image renders as a standard fixed or scroll background without transform offset |
| Task dependency parent task is deleted | Dependent task is automatically converted to a standalone task (dependency removed) |
| User attempts to advance a crop stage without filling stage notes | Stage notes are optional; advancement proceeds without notes |
| User attempts to mark a vaccination as done without logging details | Vaccination is moved to history with a default 「Completed」 status; details can be added later via edit |
| Eligibility Checker inputs are incomplete | Show validation error: 「Please fill all required fields to check eligibility」 |
| Milestone threshold is reached but user is offline | Milestone is queued and displayed on next login |
| User attempts to create a task with a due date in the past | Show validation error: 「Due date cannot be in the past」 |
| Promo code is applied to an order but promo has expired | Show error toast: 「Promo code has expired」; order proceeds without discount |
| User attempts to upload more than 5 images to a log entry | Show validation error: 「Maximum 5 images allowed per entry」 |
| Farm Performance Score or Garden Health Score calculation fails due to missing data | Display 「Score unavailable — add more data to calculate」 instead of the gauge |

---

## 6. Acceptance Criteria

- User can register and log in; session persists across page navigations without re-login.
- Forgot password flow sends a reset email and allows the user to set a new password.
- Onboarding modal appears on first login and guides the user through key modules based on Farm Type.
- Left sidebar is always visible and fixed; navigating between pages updates only the main content area.
- Sidebar item drag-and-drop reordering works and persists across sessions.
- Pinned sidebar items appear at the top of the sidebar and persist across sessions.
- Dark mode toggle switches the entire application to a dark color scheme; preference persists across sessions.
- Quick-access shortcuts bar is configurable and persists across sessions.
- All Rural Farming pages (14 modules including Task Manager) are accessible, render correct content, and support full CRUD operations where applicable.
- All Urban Farming pages (9 modules including Task Manager) are accessible, render correct content, and support full CRUD operations where applicable.
- Dashboard summary cards are clickable and navigate to the correct module.
- Dashboard KPI trend indicators display directional change vs the previous period.
- Dashboard Quick Action buttons open the correct modal forms.
- Dashboard auto-refreshes every 60 seconds; countdown timer is visible; manual refresh works.
- Dashboard widget layout is draggable and persists across sessions.
- Dashboard PDF export generates a snapshot of all current data and charts.
- Dashboard hero section displays seasonal parallax background image with fade-in animation on page load.
- Dashboard Farm Performance Score (Rural) and Garden Health Score (Urban) render as animated gauge charts and are clickable to open detailed breakdown modals.
- Dashboard Milestone Tracker displays recent milestones with celebratory badge icons.
- Dashboard Seasonal Tips Panel displays tips relevant to the current month.
- Dashboard Tour button launches an interactive step-by-step guide.
- Supabase Realtime subscriptions are active on all pages; crop status changes, order status changes, smart alerts, inventory quantity changes, livestock health records, irrigation events, financial entries, and task updates propagate across all connected clients without manual refresh.
- A subtle visual highlight is shown on UI elements when a Realtime update is applied.
- A non-blocking reconnection banner appears when the Realtime connection is lost and dismisses automatically upon reconnection.
- Image upload is functional in Crops Management, Plant Diagnosis (Rural), Plant Health (Urban), Orders & Marketplace (Rural), Marketplace (Urban), Livestock Management, and Farm Records.
- Uploaded images are compressed client-side before upload; post-compression file size does not exceed 2MB.
- Thumbnails (max 200×200px) are generated and displayed in list views, history tables, and card grids.
- Upload progress bar is shown during image upload.
- 「Remove Image」 button removes the image from Supabase Storage and clears the reference from the record.
- Files exceeding 5MB or of unsupported format are rejected with an inline error before upload.
- 「Capture Photo」 button in Plant Diagnosis and Plant Health opens device camera for direct photo capture.
- Plant Diagnosis page accepts drag-and-drop image upload and returns a diagnosis result with confidence bar, severity badge, urgency level badge, affected area estimator, treatment cost estimator, and treatment timeline.
- 「Share Diagnosis」 and 「Share Result」 buttons generate a PNG export of the diagnosis summary.
- Diagnosis Confidence Meter renders with color-coded zones and a tooltip.
- Similar Cases Panel displays 3–5 similar past diagnoses with thumbnails.
- AI Model Info Panel is collapsible and includes a 「Report Incorrect Diagnosis」 link.
- Crop Planning page accepts inputs including sunlight level, experience level, budget, and preferred crop types, and returns recommended crop cards with planting calendar, space optimizer, and 「Add to Plan」 functionality.
- Space optimizer warns when total planned area exceeds available space and includes a 「Suggest Adjustments」 button.
- Crop Planning PDF export generates a formatted planting guide.
- Plan Comparison renders a side-by-side table for up to 3 selected plans.
- Crop Rotation Suggestions button analyzes saved plans and suggests a rotation schedule.
- Budget Tracker in Crop Planning shows progress bar vs budget if a budget is input.
- Financial Management budget planner shows actual vs budget per category with progress bars, budget history, and budget alerts.
- Cash flow forecast chart renders a 3-month projection in the Summary tab with a confidence interval shaded area.
- Per-crop profitability table renders in the Summary tab with linked income and expense totals, net profit, and profit margin percentage.
- Top Expense Categories bar chart renders in the Summary tab.
- Income vs Expense Trend dual-axis line chart renders in the Summary tab.
- Recurring transactions auto-generate the next instance on the due date.
- Recurring Transactions Manager lists all recurring transactions with edit, delete, and 「Pause」 actions.
- Financial Goals Tracker displays user-set goals with progress bars.
- Tax Estimator calculates and displays estimated tax liability with a quarterly breakdown.
- Financial PDF export generates a formatted report with charts and transaction tables.
- All Chart.js charts render with correct data, support view toggles, and update dynamically.
- Smart alerts appear in the alerts panel and the navbar notification dropdown reflects unread count with dismiss functionality; new alerts appear without page refresh.
- Task Overdue, Budget Alert, Vaccination Reminder, and Application Deadline alerts are triggered correctly.
- Global search returns grouped results across crops, records, orders, schemes, tasks, and livestock.
- Skeleton loaders are shown during data fetch on all pages.
- Toast notifications appear on all form submit success and error events.
- Crop growth stage stepper advances on button click, logs the timestamp and stage notes, and syncs in real time.
- Stage Photos can be uploaded when advancing a stage and are displayed in a timeline view in the crop detail drawer.
- Crop cost tracker and revenue tracker record per-crop costs and revenues; net profit is calculated and displayed.
- Crop Performance Leaderboard displays the top 5 performing crops ranked by yield efficiency or profitability.
- Bulk stage advance updates multiple crops simultaneously.
- Crop rotation planner calendar renders past and planned crops per field; 「Suggest Rotation」 button auto-generates a rotation plan.
- Export Crops Data to CSV downloads all crop records with full metadata.
- Farm Mapping grid renders with color-coded cells, tooltips on hover, a crop legend, field health overlay, irrigation zone overlay, soil type overlay, plot history, and PNG export.
- Bulk Assignment in Farm Mapping assigns the same crop to multiple selected cells.
- 3D Map View toggle switches to an isometric view (if implemented).
- Field Rotation Suggestions button analyzes plot history and suggests optimal crop rotation.
- Government Schemes application tracker allows logging application status and notes; tracked applications appear in the My Applications tab.
- Scheme comparison renders a side-by-side table for up to 5 selected schemes; comparison table is exportable as PDF.
- Eligibility Checker highlights schemes the user is likely eligible for based on input farm details.
- Scheme Notifications panel shows newly added schemes or schemes with updated deadlines.
- Scheme Success Stories section displays anonymized case studies.
- Government Schemes bookmarking persists and bookmarked items appear in the Saved Schemes tab.
- Export Saved Schemes to PDF generates a formatted list of bookmarked schemes.
- Irrigation 「Skip Today」 logs a skipped event without recording water usage and syncs in real time.
- Irrigation efficiency score gauge renders after 7 days of logged data with a 「How to Improve」 tooltip.
- Water cost estimator calculates and displays daily, weekly, and monthly cost estimates with a 「Cost Trend」 line chart.
- Smart Watering Suggestions panel analyzes weather data and suggests schedule adjustments.
- Zone Map in Irrigation System renders all zones color-coded by water usage level.
- Task Manager Kanban board allows drag-and-drop between columns; status syncs in real time.
- Task Manager calendar view renders tasks by due date.
- Recurring tasks auto-generate the next instance upon completion.
- Recurring Tasks Manager lists all recurring tasks with edit, delete, and 「Pause」 actions.
- Task dependencies are enforced: dependent tasks cannot be moved to In Progress until parent task is Done.
- Task Templates save a task as a template; templates appear in a dropdown when adding a new task.
- Task Performance Metrics display total tasks completed, average completion time, and on-time completion rate.
- Task Notifications trigger automatic reminders for tasks due within 24 hours.
- Task Timeline View renders a Gantt-chart-style view of tasks by due date and duration.
- Overdue task count badge is visible on the sidebar item.
- Livestock weight trend chart renders per animal within the health records sub-table with a target weight line.
- Livestock feeding log records feed entries and displays monthly cost summary and feed efficiency metric.
- Livestock mortality log records deaths and displays monthly count and mortality rate in the summary card.
- Breeding Records tab tracks breeding events with breeding success rate metric.
- Livestock Performance Dashboard renders charts showing weight gain trends, feed efficiency, and health status distribution.
- Animal Detail Drawer displays full animal profile, photo gallery, complete health history, feeding log, vaccination history, and breeding records.
- Export Livestock Report to CSV includes all animal records, health records, feeding log data, and breeding records.
- Inventory reorder request log captures reorder events with status tracking.
- Inventory valuation summary card displays total inventory value with a 「Value Trend」 line chart.
- Stock Movement Log shows all quantity changes with timestamp, reason, and user.
- Expiry Alert Badge is shown on items with expiry date within 30 days or already expired.
- Bulk Reorder selects multiple low-stock items and generates a combined reorder request.
- Equipment depreciation tracker displays estimated current value with a line chart per equipment.
- Warranty Alert Badge is shown on equipment with warranty expiry within 60 days or already expired.
- Equipment Utilization Log records equipment usage with utilization rate tracking.
- Equipment Performance Score is calculated and displayed as a badge on the equipment row.
- Orders & Marketplace Product Performance Metrics display total orders, total revenue, and average rating per product.
- Featured Products Section displays all products marked as Featured with larger thumbnails.
- Order Priority Flag marks high-priority orders; priority orders are highlighted in the table.
- Order Detail Modal includes a 「Print Invoice」 button.
- Sales Analytics tab renders top-selling products bar chart, revenue by category pie chart, order volume over time line chart, average order value card, sales conversion rate, and monthly sales comparison.
- Customer List tab displays customer tier badges and customer lifetime value per customer.
- Promotions Manager creates and manages promotional campaigns; active promotions are displayed as badges on product cards.
- Promo Performance Tracker shows total orders using each promo code and total discount given.
- Weather Module renders current conditions card, 5-day forecast cards, hourly forecast, soil moisture index card, frost risk indicator, historical weather comparison, farming recommendation panel, weather-based task suggestions, weather alerts history, sunrise and sunset times card, moon phase indicator, and pollen forecast (if available).
- Weather Warning Banner is color-coded by severity and triggers for extreme conditions.
- Analytics Dashboard renders crop yield comparison bar chart, financial growth over time line chart, resource usage breakdown pie chart, top performing crops table, bottom performing crops table, livestock performance chart, inventory turnover chart, alert frequency chart, farm efficiency score, seasonal performance comparison, labor productivity chart, and water usage efficiency chart.
- Chart drill-down opens a detailed breakdown modal when a data point is clicked.
- Analytics PDF export generates a formatted report with all charts rendered as images.
- All forms validate required fields and display appropriate error messages.
- Glassmorphism, 3D card tilt, parallax, and animated gradient effects are visible on relevant sections.
- Chatbot assistant opens from floating button and responds to basic farming queries.
- All export functions (CSV, PDF, PNG) produce downloadable files with correct data.
- Background images on all applicable pages are served in WebP format with JPG or PNG fallback sources declared for browsers without WebP support.
- Responsive image sources (srcset) are declared for background images, providing variants for at least 480px, 768px, 1280px, and 1920px widths; the browser selects the appropriate variant based on viewport width and device pixel ratio.
- Background images fade in from opacity 0 to opacity 1 with a smooth ease-in transition (approximately 600–800ms) on page load and route navigation; the animation triggers only after the image has fully loaded.
- If a background image fails to load, the element renders with the fallback background color without displaying a broken image indicator.
- Seasonal background images are displayed on dashboard hero sections and key landing areas; the active seasonal set corresponds to the current calendar month (Spring: March–May; Summer: June–August; Autumn: September–November; Winter: December–February).
- Seasonal image switching occurs automatically on page load based on the current system date; no user action is required.
- Parallax scrolling effect is active on dashboard hero section background images on viewports 768px wide and above; the background moves at a reduced speed relative to foreground content on scroll.
- Parallax effect is disabled on viewports narrower than 768px; background images render as standard backgrounds without transform offset on mobile.

---

## 7. Out of Scope (This Release)

- Real payment gateway integration (payment tracking is status-based only)
- Real-time geolocation or satellite-based farm mapping
- Multi-language / internationalization support
- Push notifications (alerts are in-app only)
- Mobile native app (iOS / Android)
- Multi-user / team collaboration per farm account
- Third-party ERP or accounting software integration
- Advanced ML model training interface (plant disease model is pre-integrated, not trainable in-app)
- Offline mode or PWA support
- Server-side image processing or CDN-based thumbnail generation (thumbnail generation is handled client-side)
- Live pollen or soil moisture sensor integration (values are estimated or static)
- Real nearby nursery API integration (nursery suggestions panel uses static text and a pre-filled search link only)
- Server-side WebP conversion (WebP assets are pre-prepared and bundled; no runtime image format conversion is performed)
- Real-time video streaming or live camera feed integration
- Blockchain-based supply chain tracking
- Integration with IoT devices (sensors, automated irrigation systems, drones)
- Voice command or voice assistant integration
- Augmented reality (AR) features for crop visualization
- Social media integration (sharing to Facebook, Twitter, etc.)
- In-app messaging or chat between users
- Advanced AI-driven predictive analytics (e.g., yield forecasting, price prediction)
- Multi-currency support (all financial data is in USD)
- Custom branding or white-label options
- API access for third-party developers