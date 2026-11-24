# Shortcuts cookbook · Focus Tiger

Copy these steps. This is **not** an official Apple, Things, Raycast, or Alfred plugin. The app does **not** read Focus status, Health, or Things.

**Desktop sit URL (Mac app installed):**

`focus-tiger://app/?product=1&start=sit&min=5`

**Web sit URL:** same query on the practice page you already use (`?product=1&start=sit&min=5`). Do **not** put this on the marketing homepage (`twinsology.com` apex). If the Mac app is not installed, the `focus-tiger://` link does nothing.

Allowed sit minutes: `1`, `3`, `5`, `10`, `20`. Other numbers are ignored.

If the app is busy (paying, talking, already sitting), the link will not start a second session.

---

## 1. One tap · 5-minute sit

1. Open **Shortcuts**.
2. New shortcut → action **Open URL**.
3. Paste the desktop URL above (Mac app) or the web URL (Safari).
4. Save. On iPhone you may add it to the Home Screen.

Known limits: the Mac app must already be installed for `focus-tiger://`. The web page must open in a normal Safari window, not an in-app browser.

---

## 2. Calendar · add from the app

1. In the app, set a daily sit reminder first.
2. Use **Add to calendar**. That downloads a `.ics` file. Import it in Calendar.
3. Opening the event should open the same sit URL (desktop or web, matching how you exported).

This is **not** sync. If you change the time in the app, export again. Old events may stay. Some calendar apps add a second copy instead of replacing the first.

Do not write “always in sync with the app.”

---

## 3. Focus (Do Not Disturb) · open the same URL

The app does **not** read your Focus mode and does **not** install a Focus Filter.

1. Open **Shortcuts** → **Automation** (or System Settings → Focus, then an automation that runs a shortcut).
2. When a Focus turns **on** (or at a time you choose), run **Open URL** with the same sit URL as §1.
3. Turn **Ask Before Running** on if you do not want a sit to start during a meeting.

Mac Shortcuts automations vary by system version. If your Mac cannot run that automation, use the calendar event or a launcher instead.

---

## 4. Things · your own task, not a plugin

There is **no** official Things extension and **no** `things://` write-back of private notes.

Pick one:

- Put the sit URL in a Things task **notes** field. Open it when the task is due.
- Or make a Shortcuts action **Open URL** and call it from Things via a shortcut you own.

Never paste Confide / journal text into a Things URL.

---

## 5. Raycast or Alfred

| App | Steps | URL |
|---|---|---|
| Raycast | Create Quicklink → paste the desktop sit URL → name it (for example `Sit 5m`) → optional hotkey | `focus-tiger://app/?product=1&start=sit&min=5` |
| Alfred | Workflow → **Open URL** (or Custom Search) → same URL | same |

If you parameterize minutes, only `1` / `3` / `5` / `10` / `20` work. Other values are discarded.

If the Mac app is not installed, the Quicklink will appear to do nothing.

---

## Apple Health

Logging Mindful Minutes stays **off by default**. This guide does not turn it on. If you later enable it in Preferences, it still only writes via a shortcut you install; the app does not read Health.

---

## What this is not

- Official plugins for Things, Notion, Slack, Zapier
- A second URL scheme
- A promise that the first Mac install package includes in-app Help for these steps
