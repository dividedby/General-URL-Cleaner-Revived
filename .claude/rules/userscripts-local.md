---
paths:
  - "**/*.user.js"
---

# Userscript: deliberate exceptions

The global rule `~/.claude/rules/userscripts.md` holds the engineering checklist. These deviations from it are intentional here:

- The script also runs in subframes (for Disqus comment embeds).
- It patches `history.pushState`/`replaceState` on Google to clean Instant-search URLs; any change there must keep the original arguments, `this` and return value.
