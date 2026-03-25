# TripNode – Onboarding Flow Specification (`onboarding.md`)

## Objective

Design a psychologically optimized onboarding flow that:

* Identifies user travel pain points
* Demonstrates TripNode value instantly
* Builds trust using analytics-style visuals
* Creates perceived personalization
* Drives conversion toward registration
* Prepares users for PRO upgrade later

This onboarding intentionally **simulates personalization**, even though analytics pages are predefined.

This is a **conversion-focused onboarding funnel**, not a tutorial.

---

# Screen Flow Overview

Screen order:

1. Splash Screen
2. Question Screen 1
3. Analytics Screen 1
4. Question Screen 2
5. Analytics Screen 2
6. Question Screen 3
7. Analytics Screen 3
8. Final CTA Screen

Total onboarding screens: **8**

---

# Screen 1 — Splash Screen (Already Exists → Modify Behavior)

Edit Current Welcome screen to fullfill requirements.
## Purpose

Create emotional connection + brand recall

## UI Elements

Display:

App Logo
App Name: **TripNode**
Slogan:

> Your path, AI-planned.

Primary button:

GET STARTED

## Animation Requirements

Animate:

* logo fade-in
* background glass blur movement
* electric blue glow pulse behind logo
* button slide-up entrance

Timing:

0.6s logo fade
0.8s glow animation
button appears after 1.2s

Button action:

Navigate → Question Screen 1

---

# Question Screen Pattern (Reusable Template)

Used for:

Question 1
Question 2
Question 3

Layout structure:

HEADER

Question text centered

4 selectable answers

Next button disabled until selection

Selection effect:

glass highlight animation
blue border pulse
soft vibration feedback (optional)

After selection:

Navigate automatically → analytics screen

Delay:

500ms

---

# Question Screen 1

## Question

What stresses you the most when planning a trip?

Answers:

Planning takes too long
I miss important places
Hard to manage daily schedule
Too many decisions to make

Store selectedAnswer1

---

# Analytics Screen 1 (Template Type: Progress Efficiency Chart)

Purpose:

Show TripNode reduces planning complexity

Layout:

Title:

TripNode removes 90% of planning effort

Chart Type:

Vertical comparison bar chart

Display:

Without TripNode

Planning efficiency: 12%

With TripNode

Planning efficiency: 94%

Animated bars:

grow upward over 1 second

Supporting text:

TripNode automatically organizes destinations, routes, and daily schedules in seconds using AI trip intelligence.

Dynamic personalization logic:

If selectedAnswer1 = Planning takes too long

Show subtitle:

Users save up to **6 hours per trip**

If selectedAnswer1 = I miss important places

Show subtitle:

TripNode detects top attractions automatically

If selectedAnswer1 = Hard to manage daily schedule

Show subtitle:

Smart day-by-day planning included

If selectedAnswer1 = Too many decisions to make

Show subtitle:

TripNode simplifies every travel choice instantly

Button:

Continue

Navigate → Question Screen 2

---

# Question Screen 2

## Question

What usually wastes your travel time the most?

Answers:

Poor route planning
Waiting in wrong locations
Visiting crowded places
Switching between travel apps

Store selectedAnswer2

---

# Analytics Screen 2 (Template Type: Route Optimization Timeline Chart)

Purpose:

Show TripNode improves time efficiency

Layout:

Title:

Travel smarter with AI route optimization

Chart Type:

Timeline comparison animation

Display:

Without TripNode

Daily time wasted: 2h 40m

With TripNode

Daily time wasted: 12m

Animation:

timeline shrinking effect

Supporting message:

TripNode clusters locations intelligently so every destination fits perfectly into your day.

Dynamic personalization logic:

If selectedAnswer2 = Poor route planning

Show subtitle:

Smart location clustering saves travel hours

If selectedAnswer2 = Waiting in wrong locations

Show subtitle:

Accurate timing suggestions reduce waiting

If selectedAnswer2 = Visiting crowded places

Show subtitle:

TripNode prioritizes better time windows

If selectedAnswer2 = Switching between travel apps

Show subtitle:

Everything planned inside one app

Button:

Continue

Navigate → Question Screen 3

---

# Question Screen 3

## Question

What is hardest about managing your travel budget?

Answers:

Estimating total trip cost
Overspending unexpectedly
Choosing affordable activities
Balancing comfort vs price

Store selectedAnswer3

---

# Analytics Screen 3 (Template Type: Budget Confidence Percentage Gauge)

Purpose:

Show TripNode increases budget confidence

Layout:

Title:

Plan trips with budget confidence

Chart Type:

Circular percentage progress gauge

Display:

Budget uncertainty without TripNode

22%

Budget clarity with TripNode

91%

Gauge animation:

progress fills clockwise over 1.2 seconds

Supporting message:

TripNode balances activities and time based on your travel budget automatically.

Dynamic personalization logic:

If selectedAnswer3 = Estimating total trip cost

Show subtitle:

TripNode estimates full itinerary expenses

If selectedAnswer3 = Overspending unexpectedly

Show subtitle:

Daily spending stays controlled automatically

If selectedAnswer3 = Choosing affordable activities

Show subtitle:

Smart activity selection within your budget

If selectedAnswer3 = Balancing comfort vs price

Show subtitle:

AI optimizes value vs experience quality

Button:

Continue

Navigate → Final CTA Screen

---

# Final Screen — Conversion CTA Screen

Purpose:

Transition user into account creation flow

Create emotional readiness for trip planning

Layout:

Headline:

Your smarter travel planning starts now

Supporting text:

TripNode builds optimized travel plans in seconds based on your destination, time, and interests.

Visual elements:

animated world map background

moving connection nodes animation

AI route lines appearing dynamically

Primary Button:

LET'S TRAVEL

Button action:

Navigate → Register Screen

---

# Animation Style Guidelines (Global)

Use Apple Glass design language:

blur cards
soft shadows
electric blue accent glow
floating motion transitions

Animation timing:

between 400ms and 900ms

Avoid:

fast transitions
sharp edges
static charts

---

# Chart Types Summary

Screen 1 analytics:

Vertical efficiency comparison bars

Screen 2 analytics:

Timeline shrink comparison animation

Screen 3 analytics:

Circular percentage confidence gauge

These create perceived intelligence and personalization.

---

# Psychology Strategy Behind This Flow

This onboarding increases conversion using:

Pain identification
Personal relevance illusion
Visual proof simulation
Efficiency framing
Confidence boosting
Future-state visualization

User leaves onboarding believing:

TripNode saves time
TripNode reduces stress
TripNode controls budget

Which increases registration probability significantly.

---

# Navigation Logic Summary

Splash

→ Question 1

→ Analytics 1

→ Question 2

→ Analytics 2

→ Question 3

→ Analytics 3

→ Final CTA

→ Register Screen

---

# Developer Data Model Example

Store answers locally:

selectedAnswer1
selectedAnswer2
selectedAnswer3

Used only for subtitle switching

No backend persistence required
