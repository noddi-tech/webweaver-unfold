# Complete Text Audit for Translation System

**Generated:** 2025-10-09  
**Status:** Ready for Migration  
**Estimated Translation Keys:** ~250+

---

## Summary

This document provides a comprehensive audit of all hardcoded text across the application that needs to be migrated to the translation system. Each entry includes:
- **Component Name**
- **Current Hardcoded Text**
- **Proposed Translation Key**
- **Page Location**
- **Priority** (Critical/High/Medium)

---

## 1. Homepage Components

### 1.1 WhyNoddi Component
**File:** `src/components/WhyNoddi.tsx`  
**Priority:** Critical  
**Page Location:** homepage

| Element | Current Text | Translation Key | Priority |
|---------|--------------|-----------------|----------|
| H2 | "Stop juggling tools. Start running operations." | `why_noddi.title` | Critical |
| Subtitle | "Most automotive service providers patch together 5+ tools. Noddi replaces them all." | `why_noddi.subtitle` | Critical |
| Card Title (Before) | "Before Noddi" | `why_noddi.before.title` | High |
| Card Title (After) | "With Noddi" | `why_noddi.after.title` | High |
| Before Item 1 | "Multiple disconnected tools" | `why_noddi.before.item_1` | High |
| Before Item 2 | "Manual data entry across systems" | `why_noddi.before.item_2` | High |
| Before Item 3 | "Spreadsheet chaos" | `why_noddi.before.item_3` | High |
| Before Item 4 | "Lost customer follow-ups" | `why_noddi.before.item_4` | High |
| After Item 1 | "One unified platform" | `why_noddi.after.item_1` | High |
| After Item 2 | "Automatic data synchronization" | `why_noddi.after.item_2` | High |
| After Item 3 | "Real-time operational visibility" | `why_noddi.after.item_3` | High |
| After Item 4 | "Automated customer engagement" | `why_noddi.after.item_4` | High |
| Button Text | "See How It Works" | `why_noddi.button_cta` | High |

---

### 1.2 HowItWorks Component
**File:** `src/components/HowItWorks.tsx`  
**Priority:** Critical  
**Page Location:** homepage

| Element | Current Text | Translation Key | Priority |
|---------|--------------|-----------------|----------|
| H2 | "How Noddi Powers Your Operations" | `how_it_works.title` | Critical |
| Subtitle | "From customer booking to back-office automation—all in one unified platform" | `how_it_works.subtitle` | Critical |
| Step 1 Title | "Customer books service" | `how_it_works.step_1.title` | High |
| Step 1 Description | "Online booking or in-garage entry" | `how_it_works.step_1.description` | High |
| Step 1 Details | "Mobile + desktop support with one-minute funnel" | `how_it_works.step_1.details` | High |
| Step 2 Title | "Platform auto-plans routes & capacity" | `how_it_works.step_2.title` | High |
| Step 2 Description | "Proprietary optimization algorithms" | `how_it_works.step_2.description` | High |
| Step 2 Details | "Real-time resource allocation and workforce dispatch" | `how_it_works.step_2.details` | High |
| Step 3 Title | "Technicians execute with Noddi Worker app" | `how_it_works.step_3.title` | High |
| Step 3 Description | "Native app for mobile + garage workflows" | `how_it_works.step_3.description` | High |
| Step 3 Details | "Standardized inspection capture and tire sales" | `how_it_works.step_3.details` | High |
| Step 4 Title | "System captures data → triggers actions" | `how_it_works.step_4.title` | High |
| Step 4 Description | "Auto-recall campaigns, tire sales, inventory updates" | `how_it_works.step_4.description` | High |
| Step 4 Details | "No manual follow-up needed—fully automated" | `how_it_works.step_4.details` | High |
| Label (Step) | "Step {index}" | `how_it_works.step_label` | Medium |
| Caption Main | "It's not automation. It's orchestration." | `how_it_works.caption_main` | High |
| Caption Sub | "One platform. Every function. Zero friction." | `how_it_works.caption_sub` | High |

---

### 1.3 WhyItMatters Component
**File:** `src/components/WhyItMatters.tsx`  
**Priority:** High  
**Page Location:** homepage

| Element | Current Text | Translation Key | Priority |
|---------|--------------|-----------------|----------|
| H2 | "Why Our Integrated Platform Matters" | `why_it_matters.title` | Critical |
| Subtitle | "When your booking system and ERP speak the same language, everything just works" | `why_it_matters.subtitle` | Critical |
| Tab 1 Label | "The Industry Problem" | `why_it_matters.tab_problem.label` | High |
| Tab 2 Label | "Opportunity & Traction" | `why_it_matters.tab_opportunity.label` | High |
| Tab 3 Label | "Integrated Tech Advantage" | `why_it_matters.tab_advantage.label` | High |
| Problem H3 | "The Car Maintenance Experience Is Broken" | `why_it_matters.problem.title` | High |
| Problem Subtitle | "Traditional automotive services are failing to meet modern customer expectations" | `why_it_matters.problem.subtitle` | High |
| Problem Card 1 Title | "Inconvenient & Time-Consuming" | `why_it_matters.problem.card_1.title` | High |
| Problem Card 1 Text | "Customers waste hours driving to garages, waiting for service, and dealing with manual processes" | `why_it_matters.problem.card_1.text` | High |
| Problem Card 2 Title | "Poor Customer Experience" | `why_it_matters.problem.card_2.title` | High |
| Problem Card 2 Text | "Hidden fees, lack of transparency, and unreliable communication damage trust and satisfaction" | `why_it_matters.problem.card_2.text` | High |
| Problem Card 3 Title | "Limited Digital Presence" | `why_it_matters.problem.card_3.title` | High |
| Problem Card 3 Text | "Most providers aren't digital—still relying on phone calls and manual scheduling" | `why_it_matters.problem.card_3.text` | High |
| Problem Card 4 Title | "Industry NPS: 20-30" | `why_it_matters.problem.card_4.title` | High |
| Problem Card 4 Text | "Low customer satisfaction scores indicate widespread dissatisfaction with current service models" | `why_it_matters.problem.card_4.text` | High |
| Opportunity H3 | "Convenience Services Are Exploding" | `why_it_matters.opportunity.title` | High |
| Opportunity Subtitle | "The market is growing rapidly, and Noddi is leading the transformation" | `why_it_matters.opportunity.subtitle` | High |
| Metric 1 Value | ">49%" | `why_it_matters.opportunity.metric_1.value` | Medium |
| Metric 1 Label | "Annual Market Growth" | `why_it_matters.opportunity.metric_1.label` | High |
| Metric 1 Description | "Convenience services are the fastest-growing segment" | `why_it_matters.opportunity.metric_1.description` | Medium |
| Metric 2 Value | "20,000+" | `why_it_matters.opportunity.metric_2.value` | Medium |
| Metric 2 Label | "Bookings Completed — and growing" | `why_it_matters.opportunity.metric_2.label` | High |
| Metric 2 Description | "Proven platform with real commercial traction" | `why_it_matters.opportunity.metric_2.description` | Medium |
| Metric 3 Value | "NPS ~90" | `why_it_matters.opportunity.metric_3.value` | Medium |
| Metric 3 Label | "Customer Satisfaction" | `why_it_matters.opportunity.metric_3.label` | High |
| Metric 3 Description | "3x better than industry average (20-30)" | `why_it_matters.opportunity.metric_3.description` | Medium |
| Metric 4 Value | "4" | `why_it_matters.opportunity.metric_4.value` | Medium |
| Metric 4 Label | "Paying SaaS Partners" | `why_it_matters.opportunity.metric_4.label` | High |
| Metric 4 Description | "Take-rate per booking model validated" | `why_it_matters.opportunity.metric_4.description` | Medium |
| Metric 5 Value | "€65B" | `why_it_matters.opportunity.metric_5.value` | Medium |
| Metric 5 Label | "Addressable Market" | `why_it_matters.opportunity.metric_5.label` | High |
| Metric 5 Description | "Massive opportunity for platform expansion" | `why_it_matters.opportunity.metric_5.description` | Medium |
| Metric 6 Value | ">€200M" | `why_it_matters.opportunity.metric_6.value` | Medium |
| Metric 6 Label | "License Revenue Potential" | `why_it_matters.opportunity.metric_6.label` | High |
| Metric 6 Description | "Annual recurring revenue opportunity" | `why_it_matters.opportunity.metric_6.description` | Medium |
| Advantage H3 | "One Platform. One Source of Truth." | `why_it_matters.advantage.title` | High |
| Advantage Subtitle | "Noddi doesn't just provide a booking flow — we offer a fully automated logistics platform that eliminates API sync issues because the ERP backend and booking frontend share the same data model and automation engine" | `why_it_matters.advantage.subtitle` | High |
| Advantage Callout | "When your booking system and ERP speak the same language, everything just works." | `why_it_matters.advantage.callout` | High |
| Table Header 1 | "Problem" | `why_it_matters.advantage.table.header_1` | Medium |
| Table Header 2 | "What Happens in Disconnected Systems" | `why_it_matters.advantage.table.header_2` | Medium |
| Table Header 3 | "Noddi's Integrated Approach" | `why_it_matters.advantage.table.header_3` | Medium |
| Pain Point 1 Problem | "Tire sales can't be automated" | `why_it_matters.advantage.pain_1.problem` | High |
| Pain Point 1 Disconnected | "Manual cross-checking, delays, errors" | `why_it_matters.advantage.pain_1.disconnected` | High |
| Pain Point 1 Approach | "Fully integrated tire sales tied to inventory & quoting" | `why_it_matters.advantage.pain_1.approach` | High |
| Pain Point 2 Problem | "Poor recall logic" | `why_it_matters.advantage.pain_2.problem` | High |
| Pain Point 2 Disconnected | "Static campaigns, low relevance" | `why_it_matters.advantage.pain_2.disconnected` | High |
| Pain Point 2 Approach | "Recall campaigns driven by capacity, utilization, and data" | `why_it_matters.advantage.pain_2.approach` | High |
| Pain Point 3 Problem | "Sync issues when booking changes" | `why_it_matters.advantage.pain_3.problem` | High |
| Pain Point 3 Disconnected | "Broken flows, double bookings" | `why_it_matters.advantage.pain_3.disconnected` | High |
| Pain Point 3 Approach | "Real-time sync across booking, backend, shop" | `why_it_matters.advantage.pain_3.approach` | High |
| Pain Point 4 Problem | "Lane optimization breaks" | `why_it_matters.advantage.pain_4.problem` | High |
| Pain Point 4 Disconnected | "Digital → analog friction upon arrival" | `why_it_matters.advantage.pain_4.disconnected` | High |
| Pain Point 4 Approach | "Seamless experience from booking to garage floor" | `why_it_matters.advantage.pain_4.approach` | High |
| Pain Point 5 Problem | "Contactless visits are limited" | `why_it_matters.advantage.pain_5.problem` | High |
| Pain Point 5 Disconnected | "Need in-person touchpoints" | `why_it_matters.advantage.pain_5.disconnected` | High |
| Pain Point 5 Approach | "Fully self-servicable UI with mobile + in-lane support" | `why_it_matters.advantage.pain_5.approach` | High |
| Pain Point 6 Problem | "Splitting across systems" | `why_it_matters.advantage.pain_6.problem` | High |
| Pain Point 6 Disconnected | "Integration complexity + tech dependencies" | `why_it_matters.advantage.pain_6.disconnected` | High |
| Pain Point 6 Approach | "We own both booking and ERP — one roadmap, one source of truth" | `why_it_matters.advantage.pain_6.approach` | High |
| Mobile Label 1 | "Disconnected Systems:" | `why_it_matters.advantage.mobile.disconnected_label` | Medium |
| Mobile Label 2 | "Noddi's Approach:" | `why_it_matters.advantage.mobile.approach_label` | Medium |

---

### 1.4 TrustProof Component
**File:** `src/components/TrustProof.tsx`  
**Priority:** High  
**Page Location:** homepage

| Element | Current Text | Translation Key | Priority |
|---------|--------------|-----------------|----------|
| H2 | "Trusted by Service Professionals" | `trust_proof.title` | Critical |
| Subtitle | "Real results from real businesses—proven traction and customer satisfaction" | `trust_proof.subtitle` | Critical |
| Metric 1 Value | "20,000+" | `trust_proof.metric_1.value` | Medium |
| Metric 1 Label | "Bookings completed — and growing" | `trust_proof.metric_1.label` | High |
| Metric 1 Description | "Proven platform with real commercial success" | `trust_proof.metric_1.description` | Medium |
| Metric 2 Value | "4" | `trust_proof.metric_2.value` | Medium |
| Metric 2 Label | "Paying SaaS Partners" | `trust_proof.metric_2.label` | High |
| Metric 2 Description | "Take-rate per booking model validated" | `trust_proof.metric_2.description` | Medium |
| Metric 3 Value | ">49%" | `trust_proof.metric_3.value` | Medium |
| Metric 3 Label | "Annual Market Growth" | `trust_proof.metric_3.label` | High |
| Metric 3 Description | "Convenience services exploding" | `trust_proof.metric_3.description` | Medium |
| Metric 4 Value | "€65B" | `trust_proof.metric_4.value` | Medium |
| Metric 4 Label | "Addressable Market" | `trust_proof.metric_4.label` | High |
| Metric 4 Description | "Massive expansion opportunity" | `trust_proof.metric_4.description` | Medium |
| NPS Title | "Industry-Leading Customer Satisfaction" | `trust_proof.nps.title` | High |
| NPS Value | "~90" | `trust_proof.nps.value` | Medium |
| NPS Label | "NPS Score" | `trust_proof.nps.label` | High |
| NPS Callout | "3x better than industry average (20-30)" | `trust_proof.nps.callout` | High |
| NPS Category 1 | "Overall" | `trust_proof.nps.category_1.label` | Medium |
| NPS Category 2 | "Communication" | `trust_proof.nps.category_2.label` | Medium |
| NPS Category 3 | "Ease of use" | `trust_proof.nps.category_3.label` | Medium |
| NPS Category 4 | "Politeness" | `trust_proof.nps.category_4.label` | Medium |
| Conversion Title | "40%" | `trust_proof.conversion.value` | Medium |
| Conversion Label | "Conversion Rate" | `trust_proof.conversion.label` | High |
| Conversion Description | "Our optimized 6-step booking funnel delivers industry-leading conversion rates, turning more visitors into customers." | `trust_proof.conversion.description` | High |
| Conversion Stat 1 Label | "Step completion rate" | `trust_proof.conversion.stat_1.label` | Medium |
| Conversion Stat 1 Value | "90%+" | `trust_proof.conversion.stat_1.value` | Medium |
| Conversion Stat 2 Label | "Customer return rate" | `trust_proof.conversion.stat_2.label` | Medium |
| Conversion Stat 2 Value | "77.9%" | `trust_proof.conversion.stat_2.value` | Medium |
| Conversion Stat 3 Label | "Booking abandonment" | `trust_proof.conversion.stat_3.label` | Medium |
| Conversion Stat 3 Value | "<10%" | `trust_proof.conversion.stat_3.value` | Medium |
| Testimonials H3 | "What Customers Say" | `trust_proof.testimonials.title` | High |

---

### 1.5 RapidOnboarding Component
**File:** `src/components/RapidOnboarding.tsx`  
**Priority:** High  
**Page Location:** homepage

| Element | Current Text | Translation Key | Priority |
|---------|--------------|-----------------|----------|
| H2 | "Launch in Less Than 1 Day" | `rapid_onboarding.title` | Critical |
| Badge Text | "< 24h" | `rapid_onboarding.badge` | Medium |
| Subtitle | "Onboard new partners in any geography with plug-and-play simplicity" | `rapid_onboarding.subtitle` | High |
| Step 1 Title | "Draw service area" | `rapid_onboarding.step_1.title` | High |
| Step 1 Description | "Define your geographic coverage on the map" | `rapid_onboarding.step_1.description` | High |
| Step 2 Title | "Configure brand/logo" | `rapid_onboarding.step_2.title` | High |
| Step 2 Description | "Upload your branding assets and customize the look" | `rapid_onboarding.step_2.description` | High |
| Step 3 Title | "Upload price list" | `rapid_onboarding.step_3.title` | High |
| Step 3 Description | "Import your service pricing and packages" | `rapid_onboarding.step_3.description` | High |
| Step 4 Title | "Launch" | `rapid_onboarding.step_4.title` | High |
| Step 4 Description | "Enable automatic SEO and go live" | `rapid_onboarding.step_4.description` | High |
| Benefits H3 | "Key Benefits" | `rapid_onboarding.benefits.title` | High |
| Benefit 1 | "Expansion to new services/regions is plug-and-play" | `rapid_onboarding.benefit_1` | High |
| Benefit 2 | "Backend and frontend unified for rapid scaling" | `rapid_onboarding.benefit_2` | High |
| Benefit 3 | "No integration complexity or API dependencies" | `rapid_onboarding.benefit_3` | High |
| Benefit 4 | "Single configuration process for all services" | `rapid_onboarding.benefit_4` | High |
| Bottom CTA | "Scale globally without technical barriers — Noddi handles the complexity" | `rapid_onboarding.bottom_cta` | High |

---

### 1.6 CustomerJourney Component
**File:** `src/components/CustomerJourney.tsx`  
**Priority:** High  
**Page Location:** homepage

| Element | Current Text | Translation Key | Priority |
|---------|--------------|-----------------|----------|
| H2 | "Customer Journey" | `customer_journey.title` | Critical |
| Subtitle | "From booking to service and follow-up — seamlessly connected" | `customer_journey.subtitle` | High |
| Step 1 Title | "Customer discovers service" | `customer_journey.step_1.title` | High |
| Step 1 Description | "Browse available services online or mobile" | `customer_journey.step_1.description` | High |
| Step 2 Title | "Books online" | `customer_journey.step_2.title` | High |
| Step 2 Description | "Select service, time, and preferred location" | `customer_journey.step_2.description` | High |
| Step 3 Title | "Receives confirmation" | `customer_journey.step_3.title` | High |
| Step 3 Description | "Instant booking confirmation and reminders" | `customer_journey.step_3.description` | High |
| Step 4 Title | "Arrives at shop" | `customer_journey.step_4.title` | High |
| Step 4 Description | "Seamless check-in with lane optimization" | `customer_journey.step_4.description` | High |
| Step 5 Title | "Service completed" | `customer_journey.step_5.title` | High |
| Step 5 Description | "Real-time updates and service documentation" | `customer_journey.step_5.description` | High |
| Step 6 Title | "Follow-up/recall" | `customer_journey.step_6.title` | High |
| Step 6 Description | "Automated recall campaigns and feedback" | `customer_journey.step_6.description` | High |

---

### 1.7 TeamHighlight Component
**File:** `src/components/TeamHighlight.tsx`  
**Priority:** Medium  
**Page Location:** homepage

| Element | Current Text | Translation Key | Priority |
|---------|--------------|-----------------|----------|
| H2 | "Built by Route-Planning Pioneers" | `team_highlight.title` | High |
| Subtitle | "World-class team combining deep technical expertise with business acumen" | `team_highlight.subtitle` | High |
| Expertise 1 Title | "AI & Route Planning" | `team_highlight.expertise_1.title` | High |
| Expertise 1 Description | "Pioneers from Oda and delivery-tech startups" | `team_highlight.expertise_1.description` | High |
| Expertise 2 Title | "B2B Sales" | `team_highlight.expertise_2.title` | High |
| Expertise 2 Description | "Deep expertise in SaaS and enterprise sales" | `team_highlight.expertise_2.description` | High |
| Expertise 3 Title | "Operations" | `team_highlight.expertise_3.title` | High |
| Expertise 3 Description | "Proven track record in logistics and automation" | `team_highlight.expertise_3.description` | High |
| Footer Text | "Our founding team brings together experience from Oda, leading delivery-tech startups, and enterprise software companies—combining cutting-edge AI, logistics automation, and B2B expertise to transform automotive services." | `team_highlight.footer_text` | Medium |

---

### 1.8 FinalCTA Component
**File:** `src/components/FinalCTA.tsx`  
**Priority:** Critical  
**Page Location:** homepage

| Element | Current Text | Translation Key | Priority |
|---------|--------------|-----------------|----------|
| H2 | "Let's build your digital workshop" | `final_cta.title` | Critical |
| Subtitle | "Schedule a personalized demo or see how your specific use case can be automated with Noddi" | `final_cta.subtitle` | High |
| Button Primary | "Book a Demo" | `final_cta.button_primary` | High |
| Button Secondary | "See Technical Overview" | `final_cta.button_secondary` | High |
| Footer Text | "No credit card required • Free consultation • See results in 30 days" | `final_cta.footer_text` | Medium |

---

## 2. Functions Page Components

### 2.1 FunctionsHero Component
**File:** `src/components/functions/FunctionsHero.tsx`  
**Priority:** Critical  
**Page Location:** functions

| Element | Current Text | Translation Key | Priority |
|---------|--------------|-----------------|----------|
| H1 | "Every function. One platform." | `functions_hero.h1` | Critical |
| Subtitle | "From booking to billing, everything connects — automatically." | `functions_hero.subtitle` | High |
| Button Primary | "Book a demo" | `functions_hero.button_primary` | High |
| Button Secondary | "See how the system thinks" | `functions_hero.button_secondary` | High |

---

### 2.2 CoreLoop Component
**File:** `src/components/functions/CoreLoop.tsx`  
**Priority:** High  
**Page Location:** functions

| Element | Current Text | Translation Key | Priority |
|---------|--------------|-----------------|----------|
| H2 | "The Core Loop" | `core_loop.title` | Critical |
| Subtitle | "Every step feeds the next. No gaps. No manual handoffs." | `core_loop.subtitle` | High |
| Step 1 Title | "Book." | `core_loop.step_1.title` | High |
| Step 1 Description | "The customer picks a time — Noddi handles the rest." | `core_loop.step_1.description` | High |
| Step 2 Title | "Plan." | `core_loop.step_2.title` | High |
| Step 2 Description | "Routes and lanes auto-optimize in real time." | `core_loop.step_2.description` | High |
| Step 3 Title | "Execute." | `core_loop.step_3.title` | High |
| Step 3 Description | "Technicians get clear, connected workflows." | `core_loop.step_3.description` | High |
| Step 4 Title | "Analyze." | `core_loop.step_4.title` | High |
| Step 4 Description | "Data flows instantly into insights." | `core_loop.step_4.description` | High |
| Step 5 Title | "Re-engage." | `core_loop.step_5.title` | High |
| Step 5 Description | "Customers return before they even think to." | `core_loop.step_5.description` | High |
| Footer Text | "It's not automation. It's orchestration." | `core_loop.footer_text` | High |

---

### 2.3 FunctionCards Component
**File:** `src/components/functions/FunctionCards.tsx`  
**Priority:** High  
**Page Location:** functions

| Element | Current Text | Translation Key | Priority |
|---------|--------------|-----------------|----------|
| H2 | "Functions That Talk to Each Other" | `function_cards.title` | Critical |
| Subtitle | "Every module shares the same data model. No syncing. No waiting." | `function_cards.subtitle` | High |
| Function 1 Title | "Booking Flow" | `function_cards.function_1.title` | High |
| Function 1 Headline | "One minute from address to confirmed slot." | `function_cards.function_1.headline` | High |
| Function 1 Description | "No fluff — just speed and clarity." | `function_cards.function_1.description` | High |
| Function 1 Feature 1 | "Smart time-slot planning" | `function_cards.function_1.feature_1` | Medium |
| Function 1 Feature 2 | "Automatic reminders" | `function_cards.function_1.feature_2` | Medium |
| Function 1 Feature 3 | "Multichannel (web, mobile, in-garage)" | `function_cards.function_1.feature_3` | Medium |
| Function 2 Title | "Tire Sales & Inventory" | `function_cards.function_2.title` | High |
| Function 2 Headline | "Knows your stock, margin, and timing — and sells accordingly." | `function_cards.function_2.headline` | High |
| Function 2 Description | "Connected from warehouse to wheel." | `function_cards.function_2.description` | High |
| Function 2 Feature 1 | "Real-time inventory sync" | `function_cards.function_2.feature_1` | Medium |
| Function 2 Feature 2 | "Margin-aware recommendations" | `function_cards.function_2.feature_2` | Medium |
| Function 2 Feature 3 | "Laser scanner integration" | `function_cards.function_2.feature_3` | Medium |
| Function 3 Title | "Auto Recall Engine" | `function_cards.function_3.title` | High |
| Function 3 Headline | "Reminds like a human, responds like software." | `function_cards.function_3.headline` | High |
| Function 3 Description | "77.9% acceptance rate. Automation that feels personal." | `function_cards.function_3.description` | High |
| Function 3 Feature 1 | "AI-powered timing" | `function_cards.function_3.feature_1` | Medium |
| Function 3 Feature 2 | "SMS + email automation" | `function_cards.function_3.feature_2` | Medium |
| Function 3 Feature 3 | "Seasonal campaign logic" | `function_cards.function_3.feature_3` | Medium |
| Function 4 Title | "Capacity & Route Optimization" | `function_cards.function_4.title` | High |
| Function 4 Headline | "Always on time, always utilized." | `function_cards.function_4.headline` | High |
| Function 4 Description | "AI plans daily schedules based on location, staff, and load." | `function_cards.function_4.description` | High |
| Function 4 Feature 1 | "Route optimization" | `function_cards.function_4.feature_1` | Medium |
| Function 4 Feature 2 | "Lane balancing for garages" | `function_cards.function_4.feature_2` | Medium |
| Function 4 Feature 3 | "Real-time rescheduling" | `function_cards.function_4.feature_3` | Medium |
| Function 5 Title | "Workflow Automation" | `function_cards.function_5.title` | High |
| Function 5 Headline | "Rules you set once, results you see always." | `function_cards.function_5.headline` | High |
| Function 5 Description | "No sync meetings required." | `function_cards.function_5.description` | High |
| Function 5 Feature 1 | "Automated storage handling" | `function_cards.function_5.feature_1` | Medium |
| Function 5 Feature 2 | "Service completion triggers" | `function_cards.function_5.feature_2` | Medium |
| Function 5 Feature 3 | "Overage and follow-up logic" | `function_cards.function_5.feature_3` | Medium |
| Function 6 Title | "Reporting & Insights" | `function_cards.function_6.title` | High |
| Function 6 Headline | "Data that's actually useful." | `function_cards.function_6.headline` | High |
| Function 6 Description | "Clear dashboards for revenue, capacity, and performance." | `function_cards.function_6.description` | High |
| Function 6 Feature 1 | "Real-time dashboards" | `function_cards.function_6.feature_1` | Medium |
| Function 6 Feature 2 | "Drill-down by service" | `function_cards.function_6.feature_2` | Medium |
| Function 6 Feature 3 | "Export & API-ready" | `function_cards.function_6.feature_3` | Medium |
| Function 7 Title | "B2B & Fleet Portal" | `function_cards.function_7.title` | High |
| Function 7 Headline | "For partners that manage fleets." | `function_cards.function_7.headline` | High |
| Function 7 Description | "Centralized fleet bookings, reports, and permissions." | `function_cards.function_7.description` | High |
| Function 7 Feature 1 | "Multi-vehicle management" | `function_cards.function_7.feature_1` | Medium |
| Function 7 Feature 2 | "API integrations" | `function_cards.function_7.feature_2` | Medium |
| Function 7 Feature 3 | "Secure access control" | `function_cards.function_7.feature_3` | Medium |

---

### 2.4 FunctionsCTA Component
**File:** `src/components/functions/FunctionsCTA.tsx`  
**Priority:** High  
**Page Location:** functions

| Element | Current Text | Translation Key | Priority |
|---------|--------------|-----------------|----------|
| H2 | "Want to see how the logic plays out?" | `functions_cta.title` | High |
| Button Primary | "Book a live walkthrough" | `functions_cta.button_primary` | High |
| Button Secondary | "See the architecture" | `functions_cta.button_secondary` | High |

---

## 3. Partners Page Components

### 3.1 PartnersHero Component
**File:** `src/components/partners/PartnersHero.tsx`  
**Priority:** Critical  
**Page Location:** partners

| Element | Current Text | Translation Key | Priority |
|---------|--------------|-----------------|----------|
| H1 | "Trusted by those who keep the world moving." | `partners_hero.h1` | Critical |
| Subtitle | "20,000+ bookings and counting — powered by one platform." | `partners_hero.subtitle` | High |
| Button Text | "Become a partner" | `partners_hero.button` | High |

---

### 3.2 PartnershipModel Component
**File:** `src/components/partners/PartnershipModel.tsx`  
**Priority:** High  
**Page Location:** partners

| Element | Current Text | Translation Key | Priority |
|---------|--------------|-----------------|----------|
| H2 | "A SaaS model that scales with performance — not promises." | `partnership_model.title` | Critical |
| Subtitle | "Our partners pay per booking. As they grow, we grow." | `partnership_model.subtitle` | High |
| Benefit 1 | "White-label ready" | `partnership_model.benefit_1` | High |
| Benefit 2 | "Plug-in brand setup (< 1 day)" | `partnership_model.benefit_2` | High |
| Benefit 3 | "Pay per booking" | `partnership_model.benefit_3` | High |
| Benefit 4 | "Grow together" | `partnership_model.benefit_4` | High |
| Button Text | "Let's talk setup" | `partnership_model.button` | High |

---

### 3.3 CaseStudies Component
**File:** `src/components/partners/CaseStudies.tsx`  
**Priority:** High  
**Page Location:** partners

| Element | Current Text | Translation Key | Priority |
|---------|--------------|-----------------|----------|
| H2 | "Partners in Action" | `case_studies.title` | Critical |
| Subtitle | "Before and after. Short stories, big impact." | `case_studies.subtitle` | High |
| Case 1 Title | "Nordic Fleet Partner" | `case_studies.case_1.title` | High |
| Case 1 Before | "Three disconnected systems." | `case_studies.case_1.before` | High |
| Case 1 After | "Full automation. 20% fewer support tickets, 35% faster bookings." | `case_studies.case_1.after` | High |
| Case 2 Title | "Dealer Group" | `case_studies.case_2.title` | High |
| Case 2 Before | "Manual reminders." | `case_studies.case_2.before` | High |
| Case 2 After | "Auto recall campaigns with 77.9% acceptance rate." | `case_studies.case_2.after` | High |
| Case 3 Title | "Regional Service Chain" | `case_studies.case_3.title` | High |
| Case 3 Before | "Route planning by spreadsheet." | `case_studies.case_3.before` | High |
| Case 3 After | "AI-powered optimization. 25% more daily capacity." | `case_studies.case_3.after` | High |
| Before Label | "Before" | `case_studies.label_before` | Medium |
| After Label | "After" | `case_studies.label_after` | Medium |
| Footer Text | "When everything connects, customers come back." | `case_studies.footer_text` | High |

---

## 4. Architecture Page Components

### 4.1 ArchitectureHero
**Already using translations** ✅ - No migration needed

### 4.2 ArchitectureCTA
**Already using translations** ✅ - No migration needed

---

## 5. Contact Page Components

### 5.1 ContactHero
**Already using CMS** ✅ - Uses `useHeadings` hook

---

## 6. Pricing Page Components

### 6.1 PricingHero
**Already using CMS** ✅ - Uses `textContent` prop

### 6.2 PricingFAQ Component
**File:** `src/components/pricing/PricingFAQ.tsx`  
**Priority:** High  
**Page Location:** pricing

| Element | Current Text | Translation Key | Priority |
|---------|--------------|-----------------|----------|
| H2 | "Frequently Asked Questions" | `pricing_faq.title` | Critical |
| Subtitle | "Everything you need to know about our pricing" | `pricing_faq.subtitle` | High |
| Question 1 | "Is there a free tier?" | `pricing_faq.question_1` | High |
| Answer 1 | "No. Billing starts from your first euro of revenue..." | `pricing_faq.answer_1` | High |
| Question 2 | "Why revenue-based pricing?" | `pricing_faq.question_2` | High |
| Answer 2 | "Revenue-based pricing ensures you pay in proportion to the value you get..." | `pricing_faq.answer_2` | High |
| Question 3 | "How are rates calculated?" | `pricing_faq.question_3` | High |
| Answer 3 | "Rates are calculated using a single-tier flat-rate system..." | `pricing_faq.answer_3` | High |
| Question 4 | "Do you offer discounts?" | `pricing_faq.question_4` | High |
| Answer 4 | "Yes! We offer two types of contract discounts..." | `pricing_faq.answer_4` | High |
| Question 5 | "Is there a minimum commitment?" | `pricing_faq.question_5` | High |
| Answer 5 | "No minimum commitment is required for the standard pay-as-you-go model..." | `pricing_faq.answer_5` | High |
| Question 6 | "What happens if my revenue changes?" | `pricing_faq.question_6` | High |
| Answer 6 | "Your pricing automatically adjusts as your revenue changes..." | `pricing_faq.answer_6` | High |
| Question 7 | "Are there any hidden fees?" | `pricing_faq.question_7` | High |
| Answer 7 | "No hidden fees whatsoever. The usage fee includes everything..." | `pricing_faq.answer_7` | High |

### 6.3 NoHiddenCosts Component
**Already using CMS** ✅ - Uses `textContent` prop

---

## Migration Statistics

### Total Estimated Translation Keys: ~250+

### By Priority:
- **Critical:** ~30 keys (Hero titles, main headlines)
- **High:** ~180 keys (Major content, descriptions, CTAs)
- **Medium:** ~40 keys (Labels, supporting text)

### By Page:
- **Homepage:** ~150 keys
- **Functions:** ~50 keys
- **Partners:** ~25 keys
- **Pricing:** ~25 keys
- **Other:** ~20 keys

---

## Next Steps

1. **Review this audit** - Confirm translation key naming conventions
2. **Create SQL migration** - Insert all English translations into database
3. **Component migration** - Update components to use `useAppTranslation` hook
4. **AI Translation** - Generate translations for enabled languages
5. **Testing** - Verify all pages render correctly with translation system

---

## Notes

- Components already using CMS (`useHeadings`, `textContent` props) may need special consideration
- Some components like Architecture and Contact are already using translation/CMS systems
- Testimonial names and Norwegian text should remain as-is or be handled separately
- Numeric values and metrics should be kept separate from translations where possible
