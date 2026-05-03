# Implementation Plan - UI & Agent Interaction Upgrade

This plan addresses the user's request to improve the debate section's scroll behavior and upgrade the personal agent chat to be more reactive and persona-driven.

## Proposed Changes

### [Debate Section] Scroll Control & UI Improvements

#### [MODIFY] [index.html](file:///d:/Hackathon/index.html)
- Add a floating "Jump to Latest" button and a "New messages below" indicator in the `debate-section`.

#### [MODIFY] [style.css](file:///d:/Hackathon/style.css)
- Add styles for the "Jump to Latest" button and "New messages" indicator.

#### [MODIFY] [main.js](file:///d:/Hackathon/main.js)
- Remove `window.scrollTo` from `appendExchangePair`.
- Add a scroll listener to detect if the user is at the bottom.
- Track new content and show the button if the user is not at the bottom.

---

### [Personal Agent Chat] Reactive Persona Upgrade

#### [MODIFY] [src/orchestrator.js](file:///d:/Hackathon/src/orchestrator.js)
- Upgrade `generateAgentResponse` to be more dynamic.
- Use a structured prompt-like logic for each persona.
- Ensure the agent acknowledges the user's specific point, references their own stance/debate history, and asks follow-up questions.

#### [MODIFY] [main.js](file:///d:/Hackathon/main.js)
- Ensure the typing indicator is visible.
- Update modal UI.
