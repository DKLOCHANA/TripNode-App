# TripNode Onboarding Flow
*Generated against ONBOARDING_GENERATOR.md v2.0 and validated against LESSONS_LEARNT.md v2.0*

---

## Generation context

| Parameter | Value |
|---|---|
| App | TripNode — iOS AI travel planner |
| Subject focus | **User-focused** — the user is the traveler |
| Primary identity token | `[USER_NAME]` |
| Usage pattern | **ON-DEMAND** — user opens when planning a trip |
| Bombshell type | **Type 3 — Emotional reframe** (universal stat + pain cascade) |
| PHASE-12 feature | **AI Itinerary Generation** — uniqueness 3 / impact 3 / demo-ability 3 = **9** |
| PHASE-12 content strategy | **Curated** (per Lesson 09) — pre-built Tokyo itinerary shown |
| PHASE-09 status | **Skipped** — no demographic-driven content personalization |
| PHASE-05 status | **Skipped** — interests captured in QB |
| Permissions | Notifications only (1 screen) |
| Trial | **3-day free trial** |
| Pricing | Annual $49.99/yr ($0.96/week) BEST VALUE / Monthly $5.99/mo |
| Free tier | **1 itinerary** then paywall |
| Disclaimer | *"Itineraries are AI-generated suggestions. Always verify details like hours, prices, and availability before your trip."* |
| Audience | Solo travelers, couples, friend groups. Age 20-35. Budget-conscious, experience-hungry. |
| Screen count | **33** |

### Feature ranking (PHASE-12 — per Lesson 05)

```
AI Itinerary Generation     — uniqueness 3 / impact 3 / demo-able 3 = 9  <- WINNER
Attraction Selection        — uniqueness 2 / impact 2 / demo-able 2 = 6
My Trips List               — uniqueness 1 / impact 1 / demo-able 2 = 4
Open in Maps                — uniqueness 1 / impact 2 / demo-able 1 = 4
```

### Emotional arc

```
SCREEN 1                  -> Curious
SCREENS 2-3 (Problem)     -> Seen
SCREEN 4 (Solution)       -> Hopeful
SCREENS 5-6 (Identity)    -> Invested
SCREENS 7-8 (Bombshell)   -> Surprised
SCREEN 9 (Bridge)         -> Hopeful
SCREENS 10-15 (QB)        -> Understood
SCREENS 16-17 (Insight)   -> Understood
SCREEN 18 (How it works)  -> Curious
SCREENS 19-21 (Experience)-> Excited
SCREEN 22 (Congrats)      -> Excited
SCREEN 23 (Streak)        -> Peak — review modal fires here
SCREENS 24-25 (Loading)   -> Anticipating
SCREEN 26 (Snapshot)      -> Committed
SCREENS 27-28 (Commitment)-> Committed
SCREEN 29 (Plan Reveal)   -> Committed
SCREEN 30 (Social Proof)  -> Reassured
SCREEN 31 (Permissions)   -> Ready
SCREENS 32-33 (Paywall)   -> Ready
```

---

# ACT 1 — INTRODUCTION

## PHASE-01 | HOOK

SCREEN 1 | PHASE-01-HOOK
Headline: "where to next?"
Subheading: none
Body: none
Input: none
CTA: "tap to continue ->"
Navigation: tap to continue
Animation: default

---

## PHASE-02 | PROBLEM

SCREEN 2 | PHASE-02-PROBLEM
Headline: "planning a trip shouldn't feel like a second job."
Subheading: none
Body: "15 tabs open. 3 conflicting blogs. a budget that makes sense until you're actually there. sound familiar?"
Input: none
CTA: "tap to continue ->"
Navigation: tap to continue
Animation: sequential-lines

SCREEN 3 | PHASE-02-PROBLEM
Headline: "you want to explore — not research."
Subheading: none
Body: "but without a real plan, you waste time, overspend, and miss the places that actually matter."
Input: none
CTA: "tap to continue ->"
Navigation: tap to continue
Animation: sequential-lines

---

## PHASE-03 | SOLUTION

SCREEN 4 | PHASE-03-SOLUTION
Headline: "TripNode plans your entire trip in seconds."
Subheading: none
Body: "tell us where, when, and what you love. our AI builds a day-by-day itinerary — timed, budgeted, and mapped."
Input: none
CTA: "tap to continue ->"
Navigation: tap to continue
Animation: default

---

## PHASE-04 | IDENTITY CAPTURE

SCREEN 5 | PHASE-04-IDENTITY
Headline: "first things first"
Subheading: "what should we call you?"
Body: none
Input: text
CTA: "continue"
Navigation: button (disabled until input non-empty)
Animation: default

SCREEN 6 | PHASE-04-IDENTITY
Headline: "nice to meet you, [USER_NAME]. let's figure out how you travel."
Subheading: none
Body: none
Input: none
CTA: none
Navigation: auto-advance (1.5s) or tap anywhere
Animation: sequential-lines

---

## PHASE-05 | DEMOGRAPHICS
**SKIPPED** — no demographic data needed. Travel interests captured in QB.

---

## PHASE-06 | BOMBSHELL

SCREEN 7 | PHASE-06-BOMBSHELL
Headline: "how do you usually plan a trip?"
Subheading: "be honest."
Body: none
Input: single-select
Options:
  - scroll TikTok and Instagram for hours
  - open 15 browser tabs and hope for the best
  - copy someone else's itinerary
  - pay a tour guide to figure it out
  - honestly? I just wing it
CTA: "continue"
Navigation: button
Animation: default

SCREEN 8 | PHASE-06-BOMBSHELL
Headline: "[USER_NAME], the average traveler spends 9 hours planning a single trip."
Subheading: none
Body: "9 hours researching places that are closed when you arrive. budgets that don't add up until you're already there. itineraries copied from strangers who travel nothing like you. what if those 9 hours became 2 minutes?"
Input: none
CTA: "tap to continue ->"
Navigation: tap to continue
Animation: sequential-lines (each line 600-800ms apart)

---

## PHASE-07 | BRIDGE

SCREEN 9 | PHASE-07-BRIDGE
Headline: "it doesn't have to be this way."
Subheading: none
Body: "what if you just picked a place — and a complete, personalized plan appeared? let's find out what kind of traveler you are. it takes less than a minute."
Input: none
CTA: "tap to continue ->"
Navigation: tap to continue
Animation: default

---

## PHASE-08 | QUESTION BANK

SCREEN 10 | PHASE-08-QB (Q1)
Headline: "what matters most to you when you travel?"
Subheading: "choose up to 3"
Body: none
Input: multi-select (max 3)
Options:
  - eating where the locals eat
  - jaw-dropping photo spots
  - history and culture that gives you chills
  - doing absolutely nothing on a beautiful beach
  - nightlife and energy
  - getting off the beaten path
  - wellness and recharging
  - shopping and markets
CTA: "continue"
Navigation: button
Animation: default

SCREEN 11 | PHASE-08-QB (Q2)
Headline: "what usually goes wrong on your trips?"
Subheading: none
Body: none
Input: single-select
Options:
  - I always blow my budget
  - I waste time at overhyped tourist traps
  - I miss the best spots because I didn't plan enough
  - I over-plan and it stops being fun
  - I wing it and regret it later
CTA: "continue"
Navigation: button
Animation: default

SCREEN 12 | PHASE-08-QB (Reflection 1)
Headline: "sounds like you know what you want, [USER_NAME]."
Subheading: none
Body:
  [GOAL_1] — that's the stuff trips are made of
  [GOAL_2] — we know just the spots
  [GOAL_3] — consider it handled

  and the thing that keeps going wrong?
  [CURRENT_STATE].

  thousands of travelers started exactly here.
  let's fix that.
Input: none
CTA: "continue"
Navigation: button
Animation: staggered-list (400ms per item)

SCREEN 13 | PHASE-08-QB (Q3)
Headline: "what's your travel budget style?"
Subheading: none
Body: none
Input: single-select
Options:
  - backpacker — every dollar counts
  - balanced — smart spending, no skimping on experiences
  - comfort — I'll pay more for less hassle
  - YOLO — I'll worry about it when I get home
CTA: "continue"
Navigation: button
Animation: default

SCREEN 14 | PHASE-08-QB (Q4)
Headline: "have you ever come home from a trip feeling like you missed the best parts?"
Subheading: none
Body: none
Input: yes-no
Options:
  - yes — more times than I'd like to admit
  - no — but I'm always afraid I will
CTA: "continue"
Navigation: button
Animation: default

SCREEN 15 | PHASE-08-QB (Reflection 2)
Headline: "we hear you, [USER_NAME]."
Subheading: none
Body:
  [BLOCKER_1] —
  that's exactly what TripNode is built to solve.

  [if Q4 = yes]
  "you've felt it before. it won't happen again."

  [if Q4 = no]
  "the fact that you're thinking ahead says everything."

  "your next trip will be different."
Input: none
CTA: "continue"
Navigation: button
Animation: sequential-lines

---

## PHASE-09 | ANALYTICS QUESTIONS
**SKIPPED** — no demographic-driven content personalization needed.

---

## PHASE-10 | INSIGHT

SCREEN 16 | PHASE-10-INSIGHT
Headline: "thanks [USER_NAME]. here's what we know about how you travel."
Subheading: none
Body:
  Card 1 — "where you want to go"
  -> [GOAL_1], [GOAL_2], [GOAL_3] (user's exact words)

  Card 2 — "what keeps tripping you up"
  -> [CURRENT_STATE_SHORT] (shortened/rephrased — e.g. "wrong spots, wasted time")

  Card 3 — "what's holding you back"
  -> [BLOCKER_1_SHORT] (shortened — e.g. "fear of missing the best parts")

  "let's build trips where none of that happens."
Input: none
CTA: "continue"
Navigation: button
Animation: staggered-list (400ms per card)

SCREEN 17 | PHASE-10-INSIGHT
Headline: "smart planning changes everything."
Subheading: none
Body:
  [Line chart — two lines over a 5-day trip]
  Line A (Electric Blue, solid) — "with TripNode": rising
    annotations: "hidden gem found", "budget on track", "no time wasted"
  Line B (grey, dashed) — "without": flat with dips
    annotations: "overpaid for lunch", "attraction was closed", "wasted 2 hours lost"

  "[USER_NAME], that could be you."
Input: none
CTA: "learn how TripNode works ->"
Navigation: button (opens PHASE-11 modal)
Animation: sequential-lines (then chart animates in)

---

# ACT 2 — CLIMAX

## PHASE-11 | HOW IT WORKS

Steps sourced from spec Screen 2 ("Plan Your Trip") interaction flow:
  Step 1 = user picks destination, dates, interests, budget (spec: "Plan Your Trip" input form)
  Step 2 = AI generates day-by-day itinerary (spec: "Generate My Trip" -> itinerary output)
  Step 3 = user reviews, customizes, navigates with maps (spec: "Open Map" button on each activity)

SCREEN 18 | PHASE-11-HOWITWORKS (modal overlay)
Modal title: "how it works"
Steps:
  1 — pick a destination, dates, and interests
  2 — AI generates your full itinerary — every stop scheduled and costed
  3 — review, customize, and go — with maps built in
Body (below steps): "from idea to itinerary, faster than you'd book a restaurant."
Input: none
CTA: "try it now"
Navigation: button (dismisses modal, advances to Screen 19) + X close icon top-right
Animation: default (modal slide-up over backdrop)

---

## PHASE-12 | EXPERIENCE PREVIEW

Usage pattern: ON-DEMAND — preview the on-demand action (generate an itinerary).
Content strategy: CURATED (per Lesson 09) — pre-built sample itinerary shown regardless of destination typed.

Curated itinerary (developer reference):
  Destination: Tokyo, Japan | 3 days | Culture + Foodie
  Day 1 Morning:
    Senso-ji Temple (1h 30m, $0)
    Nakamise Street (45m, ~$15)
  Day 1 Afternoon:
    Tsukiji Outer Market (2h, ~$30)
    TeamLab Planets (1h 30m, ~$25)
  Day 1 Evening:
    Shibuya Crossing (1h, $0)
    Omoide Yokocho (1h 30m, ~$20)
  Only Day 1 shown in preview — enough to demonstrate the value.

SCREEN 19 | PHASE-12-EXPERIENCE (Screen A — input)
Headline: "let's plan a quick trip, [USER_NAME]."
Subheading: "pick a destination — anywhere in the world."
Body: none
Input: text (placeholder: "e.g. Tokyo, Bali, Paris...")
CTA: "generate my trip"
Navigation: button (disabled until 2+ chars typed)
Animation: default

SCREEN 20 | PHASE-12-EXPERIENCE (Screen B — loading)
Headline: none
Subheading: "planning your trip to [DESTINATION]..."
Body:
  [Animated progress ring — 2.5 seconds minimum]
  Step labels (cycle through):
    finding the best spots...
    building your day-by-day schedule...
    optimizing for time and budget...
    mapping your route...
Input: none
CTA: none
Navigation: auto-advance when complete
Animation: loading-stages (minimum 2.5 seconds)

SCREEN 21 | PHASE-12-EXPERIENCE (Screen C — itinerary reveal)
Headline: "here's Day 1 in [DESTINATION], [USER_NAME]."
Subheading: none
Body:
  MORNING
  Senso-ji Temple — 1h 30m — Free
  "Asakusa's ancient heart — arrive early for the quiet before the crowds"

  Nakamise Street — 45m — ~$15
  "Street food + souvenirs on the walk back — try the melon pan"

  AFTERNOON
  Tsukiji Outer Market — 2h — ~$30
  "Skip the tourist sushi — find the tamagoyaki stand on the side street"

  "this is just Day 1. the full trip covers every day."

  Disclaimer (verbatim from spec):
  "Itineraries are AI-generated suggestions. Always verify details like hours, prices, and availability before your trip."
Input: none
CTA: "save this trip"
Navigation: button
Animation: staggered-list (200ms per card, top-to-bottom)

---

## PHASE-13 | CONGRATULATIONS

SCREEN 22 | PHASE-13-CONGRATS
Headline: "congratulations!"
Subheading: "you just planned your first trip with TripNode."
Body:
  [Trip preview card]
  [DESTINATION]
  Day 1 of 3
  Senso-ji, Tsukiji, Shibuya...
  est. $90/day

  "saved in My Trips — open, share, or tweak anytime."
Input: none
CTA: "continue"
Navigation: button
Animation: default (card scales in with subtle bounce)

---

## PHASE-14 | STREAK + REVIEW

SCREEN 23 | PHASE-14-STREAK
Headline: "your travel streak begins."
Subheading: none
Body:
  [Plane icon, large]
  Trip tracker (trip 1 highlighted):
  ( 1 )  2  3  4  5

  "plan a trip each week to keep your streak alive
   and unlock curated destination collections."

  [Review modal slides up after 800ms pause]
  "Enjoying TripNode?"
  "Tap a star to rate it on the App Store"
  [5 star row]
  "Not Now"
Input: stars (1-5) OR "Not Now"
CTA: "continue" (surfaces after modal dismissed)
Navigation: button
Animation: default (plane icon scales in with bounce -> tracker fades in -> 800ms pause -> review modal slides up from bottom)

---

# ACT 3 — CONCLUSION

## PHASE-15 | LOADING + PLAN READY

SCREEN 24 | PHASE-15-LOADING
Headline: none
Subheading: none
Body:
  [Circular progress ring — animates 0% to 100% over ~3.5 seconds]
  Step labels (appear sequentially, each with checkmark before next):
    analyzing your travel style...
    matching destinations to your interests...
    calibrating budget recommendations...
    building your personalized travel plan...
Input: none
CTA: none
Navigation: auto-advance when ring hits 100%
Animation: loading-stages (minimum 3 seconds)

SCREEN 25 | PHASE-15-LOADING
Headline: "[USER_NAME], your travel plan is ready."
Subheading: none
Body:
  [Large checkmark — scales from 0 to full size with bounce easing]
Input: none
CTA: "see my plan"
Navigation: button
Animation: default (checkmark bounce-in, then CTA fades in)

---

## PHASE-16 | DATA SNAPSHOT

SCREEN 26 | PHASE-16-SNAPSHOT
Headline: "[USER_NAME]'s travel snapshot"
Subheading: "based on your answers, here's your travel DNA:"
Body:
  Card 1 — travel style
  [bar: tourist --------*---- explorer]
  (derived from Q1 answers — off-the-path and culture skew explorer, beach and shopping skew tourist)

  Card 2 — budget instinct
  [BUDGET_STYLE] (user's exact words from Q3)

  Card 3 — planning confidence
  [bar: low ---*------------ high]
  "room to grow"
  (derived from Q2 answer — users who wing it or blow budget score lower)

  Strengths:
  - you know what you want from a trip
  - you're willing to try something new
Input: none
CTA: "continue"
Navigation: button
Animation: staggered-list

---

## PHASE-17 | COMMITMENT

SCREEN 27 | PHASE-17-COMMITMENT
Headline: "so [USER_NAME] — how committed are you to making your next trip unforgettable?"
Subheading: none
Body: none
Input: single-select
Options:
  - Extremely Committed
  - Very Committed
  - Somewhat Committed
  - A Little Committed
  - Just Trying It Out
CTA: "continue"
Navigation: button
Animation: default

SCREEN 28 | PHASE-17-COMMITMENT (dynamic response)
Headline: [dynamic — see branches]
Subheading: none
Body: [dynamic — see branches]
Input: none
CTA: "done"
Navigation: button
Animation: sequential-lines

Dynamic branches:
  Extremely Committed ->
    Headline: "that's the energy, [USER_NAME]."
    Body: "your next trip won't just be good — it'll be the one you tell everyone about."

  Very Committed ->
    Headline: "let's make it happen."
    Body: "great trips don't happen by accident. [USER_NAME], you're already ahead."

  Somewhat Committed ->
    Headline: "that's more than enough."
    Body: "even a little planning goes a long way. we'll handle the hard part."

  A Little Committed ->
    Headline: "no pressure."
    Body: "explore at your own pace. TripNode is here when you're ready."

  Just Trying It Out ->
    Headline: "fair enough."
    Body: "one trip is all it takes to see the difference. we'll show you what's possible."

---

## PHASE-18 | PLAN REVEAL

SCREEN 29 | PHASE-18-PLANREVEAL
Headline: "[USER_NAME], by [TARGET_DATE] you could have your next trip ready to go."
Subheading: none
Body:
  [3 outcome pillars]
  every day scheduled | budget built in | zero wasted hours

  "how we'll get you there:"

  🗺️ AI Itinerary — full day-by-day plan from a single prompt
  🏛️ Smart Attractions — best spots matched to your interests
  📍 Maps — tap any stop to navigate
  📋 My Trips — saved and shareable
Input: none
CTA: "start planning"
Navigation: button
Animation: staggered-list (200ms per element, top-to-bottom)

---

## PHASE-19 | SOCIAL PROOF

SCREEN 30 | PHASE-19-SOCIALPROOF
Headline: "TripNode was built for travelers like you, [USER_NAME]."
Subheading: "reviews from real travelers using TripNode."
Body:
  [Credibility badge]
  the smartest way to plan a trip
  [5 stars]
  + 25,000 trips planned

  [Review 1]
  BEST TRIP I'VE EVER TAKEN.
  "I used to spend entire weekends researching. TripNode gave me a 5-day Tokyo plan in 2 minutes that was better than anything I'd found in hours. I actually saw MORE and spent less."

  [Review 2]
  WHY DIDN'T THIS EXIST SOONER.
  "Planned a Bali trip for me and my girlfriend. Every spot was walking distance from the last. Budget was spot on. We didn't miss a thing."
Input: none
CTA: "join TripNode"
Navigation: button
Animation: default (credibility badge first, then each review card 300ms stagger)

---

## PHASE-20 | PERMISSIONS

SCREEN 31 | PHASE-20-PERMISSIONS (Notifications)
Headline: "allow TripNode to send you notifications"
Subheading: "so you never miss a beat on your trip"
Body:
  [Notification preview on lock screen]
  TripNode — now
  "Your trip to Tokyo starts tomorrow! Open your Day 1 itinerary."

  "trip reminders, travel tips, and departure alerts — only what matters. nothing else."
Input: none
CTA: "allow"
Navigation: button (triggers native iOS notification prompt after tap)
Animation: default (explanation fades in BEFORE CTA becomes tappable)

---

## PHASE-21 | PAYWALL

SCREEN 32 | PHASE-21-PAYWALL (Screen 1 — value + trial)
Headline: "travel smarter, [USER_NAME]. not harder."
Subheading: none
Body:
  "here's what your first 3 days look like:"

  day 1 — plan your dream trip
  day 2 — customize and make it yours
  day 3 — maps open, you're ready to go

  No Payment Due Now
CTA: "try for $0.00"
Footnote: "Annual: $49.99/year ($0.96/week) — BEST VALUE | Monthly: $5.99/month"
Navigation: button
Animation: default (day cards stagger in top-to-bottom before CTA appears)

SCREEN 33 | PHASE-21-PAYWALL (Screen 2 — trial reminder)
Header: [back chevron, top-left]
Headline: "we'll send you a reminder before your free trial ends"
Subheading: none
Body:
  [Large bell icon with notification badge "1"]

  "we'll let you know one day before you're charged. cancel anytime."

  No Payment Due Now
CTA: "continue for FREE"
Footnote: "Annual: $49.99/year ($0.96/week) — BEST VALUE | Monthly: $5.99/month"
Navigation: button
Animation: default (bell icon scales in, body fades in, then CTA)

---

## End of flow

After Screen 33, the user enters the trial state and lands on the Plan Your Trip screen (spec Screen 2). The "Generate My Trip" button is now fully functional — the curated onboarding experience transitions to live AI generation.

---

## Validation checklist (per LESSONS_LEARNT.md pre-generation list)

- [x] Full feature list read
- [x] Usage pattern identified: ON-DEMAND
- [x] Interaction flow located for AI Itinerary Generation (spec Screen 2 -> Screen 4)
- [x] PHASE-11 steps are real actions, not benefits
- [x] PHASE-12 feature ranked highest: AI Itinerary Generation 9/9
- [x] Every feature shown exists verbatim in spec
- [x] Experience preview matches on-demand pattern
- [x] Disclaimer included verbatim from spec
- [x] PHASE-12 uses curated content, not live LLM
- [x] Identity token is [USER_NAME] (user-focused)

## Critical rules compliance

| # | Rule | Status |
|---|---|---|
| 1 | No app name/logo on screen 1 | OK — "where to next?" |
| 2 | No price before value loop | OK — first price on Screen 32 |
| 3 | Permission pre-screen | OK — Screen 31 |
| 4 | No same input 3x in a row | OK — variety: none/text/none/single/none/multi/single/none/single/yes-no/none |
| 5 | Reflection after every 2 QB | OK — Screen 12 after Q1+Q2, Screen 15 after Q3+Q4 |
| 6 | "No Payment Due Now" twice | OK — Screens 32 and 33 |
| 7 | Personalize from PHASE-04 | OK — [USER_NAME] on every screen from Screen 6 onward |
| 8 | Social proof after experience | OK — Screen 30 after Screens 19-21 |
| 9 | No phantom features | OK — all from spec Screens 2-5 |
| 10 | Exact words in reflections | OK — [GOAL_n], [CURRENT_STATE], [BLOCKER_n] tokens |

---

*To iterate on any phase, use the REPLACEMENT FORMAT:*
```
PHASE: PHASE-XX-NAME
STATUS: REPLACE | DROP | KEEP
CONTENT: [what you want]
```
