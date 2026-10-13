<!-- Shared across the dividedby userscript repos (games-scripts, General-URL-Cleaner-Revived, rtings-links, reddit-redirect); keep the copies identical. Each repo's CLAUDE.md lists its most important rules and its deliberate exceptions. -->

# Browser Userscript Engineering

## Objective
Create, improve, and maintain the smallest reliable userscript.
Optimize for correctness, low runtime overhead, readability, and easy maintenance.
Minimal code means fewer moving parts—not code golf or missing safeguards.

## Before changing code
- Read the existing script and preserve its intended behavior.
- Identify target sites/routes, browsers, userscript managers, and required permissions.
- Determine whether the page is static, dynamically updated, or an SPA.
- Establish acceptance criteria; ask only questions that materially affect implementation.
- Verify manager-specific APIs and metadata against official documentation.
- Do not invent DOM selectors, page globals, endpoints, or compatibility claims.
- If the actual page cannot be inspected, identify assumptions and required DOM examples.

## Scope and architecture
- Prefer plain JavaScript and browser APIs.
- Default to one readable .user.js file; preserve useful existing tooling.
- Add dependencies, build steps, modules, classes, or compatibility layers only when justified.
- Use small functions with clear responsibilities; extract helpers when they clarify
  behavior or remove meaningful duplication.
- Avoid generic frameworks for one-site, one-feature scripts.
- Keep selectors, settings, storage keys, and script identifiers easy to locate.
- Fix the relevant problem without unrelated rewrites.
- Remove dead code, unused permissions, dependencies, and obsolete fallbacks.

## Metadata and execution context
- Use narrow @match patterns; exclude unsupported routes when needed.
- Declare only required @grant entries.
- Use @grant none explicitly only when privileged APIs are unnecessary.
- Restrict @connect to required destinations; avoid wildcard permissions by default.
- Choose @run-at based on required timing:
  - document-start only for genuine early interception.
  - document-end or document-idle for ordinary DOM work.
- Add @noframes when execution in frames is unnecessary.
- Preserve identity, namespace, update URLs, and existing release conventions.
- Do not add placeholder update/download URLs.
- Verify manager-specific directives and supported API styles.
- Prefer DOM-only operation. Access page globals or inject into page context only
  when necessary; document the reason and compatibility implications.
- Do not assume userscript globals and page globals share the same execution realm.

## DOM behavior and lifecycle
- Prefer CSS for purely visual changes; use JavaScript for behavior.
- Prefer stable IDs, semantic attributes, and scoped selectors.
- Avoid generated class names, positional selectors, and text matching unless necessary.
- Use event delegation when it simplifies handling dynamic descendants.
- Make repeated initialization safe: no duplicate UI, listeners, styles, or requests.
- Distinguish an element being seen from it being fully processed.
- Do not permanently mark an element processed before successful work.
- Handle missing elements and delayed rendering without arbitrary sleep calls.
- Handle target-container replacement when the host page can replace it.
- Avoid retaining detached DOM nodes in long-lived collections.
- Clean up feature-owned listeners, observers, timers, and pending work when the
  feature is disabled or its route/container is no longer active.
- For SPAs, handle relevant route changes and rerenders without reloading the page.
- Use the least invasive supported navigation signal.
- Do not assume popstate detects pushState or replaceState calls.
- Patch page APIs only when necessary; preserve arguments, return values, and this.
- Avoid overwriting window.onload, window.onclick, or equivalent shared handlers.
- Do not add unload cleanup merely for ceremony; focus on lifecycle changes while
  the document remains alive.

## MutationObserver and scheduling
- Perform an initial scan, then process relevant changes.
- Observe the smallest stable ancestor that satisfies the requirement.
- Enable only needed mutation types; use attributeFilter when observing attributes.
- Inspect added nodes and relevant descendants rather than rescanning the document
  for every mutation.
- Ensure inserted subtrees and added nodes that are themselves matches are covered.
- Keep callbacks short and guard against feedback from the script's own mutations.
- Disconnect one-shot observers once their job is complete.
- A broad observer is acceptable when necessary, but keep filtering and callbacks cheap.
- Prefer event-driven work over permanent polling.
- If polling is necessary, bound its interval, duration, and lifecycle.
- Coalesce visual work with requestAnimationFrame when useful.
- Debounce or throttle only when it solves an actual repeated-work problem.

## Performance
- Optimize algorithmic work and lifecycle behavior before shortening syntax.
- Avoid repeated full-page scans, duplicate network calls, and excessive DOM writes.
- Batch layout reads before layout writes when layout measurement is needed.
- Cache stable values; do not retain stale nodes or indefinitely cache dynamic state.
- Avoid unnecessary observers, timers, listeners, dependencies, and page-context bridges.
- Use bounded caches or queues when long-lived data can grow.
- Cancel or ignore stale asynchronous results after route or configuration changes.
- Measure before adding complex performance machinery.
- Do not equate fewer lines with lower CPU usage or better maintainability.

## Security and privacy
- Treat page content, remote responses, and stored values as untrusted.
- Use textContent and DOM construction for untrusted text.
- Do not interpolate untrusted values into innerHTML.
- Do not use eval, new Function, or remote code execution.
- Never embed secrets or send page data elsewhere without an explicit requirement.
- Prefer native fetch when its origin/CORS/credential behavior meets the requirement.
- Use privileged GM networking only when necessary and with narrow permissions.
- Validate destinations and message payloads at privileged boundaries.
- Never expose a generic privileged request bridge to arbitrary page messages.
- Pin unavoidable external dependencies to immutable versions; verify integrity
  where the distribution mechanism supports it.
- Do not disable browser security mechanisms to make a script work.

## Async work and persistence
- Pick the GM API style supported by the target manager(s); do not mix styles casually.
- Use the API's actual timeout/cancellation capabilities.
- Check HTTP status and validate response shape.
- Handle expected failures explicitly; do not silently swallow unexpected errors.
- Retry only appropriate transient failures, with bounded attempts and delay.
- Prevent overlapping runs or stale results when they could corrupt state.
- Use manager storage for script settings when separation from site storage matters.
- Namespace storage keys and validate persisted settings.
- Add schema migrations only when stored-format changes require them.
- Do not store derivable data unless caching has a clear benefit.

## Formatting and code style
- Follow the existing formatter; otherwise use:
  - 2-space indentation.
  - Semicolons.
  - Single-quoted strings; template literals for interpolation.
  - const by default; let only for reassignment; no var.
  - Strict equality and early returns.
  - Named functions for meaningful operations.
- Use descriptive names, not cryptic abbreviations.
- Use an IIFE when appropriate to contain script-local state.
- Use async/await when it improves clarity and is supported by the target environment.
- Comments explain intent, constraints, or non-obvious site quirks—not obvious syntax.
- Add JSDoc only where types or contracts are otherwise unclear.
- Avoid banner comments, gratuitous sectioning, and speculative abstractions.
- Log actionable errors with a script-specific prefix.
- Keep routine debug logging disabled by default.

## Validation
- Run existing lint, formatting, and tests when available.
- Match lint globals to the actual userscript APIs and execution environment.
- Test relevant cases:
  - Initial load and delayed content.
  - Repeated initialization.
  - Added and replaced elements.
  - SPA route entry, exit, back, and forward.
  - Missing or changed selectors.
  - Network failure and stale async results.
  - Missing or malformed stored settings.
  - Frames, keyboard interaction, and accessibility where applicable.
- Verify installation and execution in the actual userscript manager.
- A browser test harness alone does not prove GM APIs, injection, permissions,
  CSP behavior, or installation metadata work.
- For performance changes, compare relevant measurements before and after.
- State exactly what was tested and what remains unverified.

## Delivery
- For creation: return a complete installable userscript.
- For maintenance: prefer a focused diff unless a full file is requested.
- Summarize:
  1. What changed and why.
  2. Permissions or compatibility implications.
  3. Validation performed and remaining limitations.
- Do not claim testing, compatibility, or performance improvements without evidence.
