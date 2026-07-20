import { YIN_SILHOUETTE_SVG } from "./_shared.js";

const STYLE = `
:host {
  display: block;
  font-family: var(--font-family);
  color: var(--color-ink);
  max-width: 320px;
}
.card {
  background: var(--color-panel);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-ink-faint);
  box-shadow: var(--shadow-soft);
  padding: 1rem 1.1rem;
}
.heading {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 0.75rem;
}
.heading img {
  width: 28px;
  height: 28px;
  opacity: 0.7;
}
.heading h3 {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: 600;
}
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.55rem;
}
.row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: var(--font-size-sm);
  color: var(--color-ink-muted);
}
.check {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1.5px solid var(--color-ink-faint);
  background: var(--color-bg);
  flex-shrink: 0;
  display: grid;
  place-items: center;
  overflow: hidden;
}
.check img {
  width: 16px;
  height: 16px;
  opacity: 0;
  transform: scale(0.8);
  transition: opacity 280ms var(--ease-calm), transform 280ms var(--ease-calm);
}
.row[data-done="1"] .check {
  border-color: transparent;
  background: var(--color-accent-soft);
}
.row[data-done="1"] .check img {
  opacity: 0.9;
  transform: scale(1);
  animation: wink 600ms var(--ease-calm) 1;
}
.row[data-done="1"] .text {
  color: var(--color-ink);
}
@keyframes wink {
  0% { transform: scale(0.85); opacity: 0.4; }
  40% { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); opacity: 0.9; }
}
`;

/**
 * Gentle daily practice suggestions — design exploration.
 * Completion feedback = tiny Yin wink, not modal + sound barrage.
 */
export class DailyQuestCard extends HTMLElement {
  static get observedAttributes() {
    return ["quests"];
  }

  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this._root.innerHTML = `
      <style>${STYLE}</style>
      <div class="card" part="card">
        <div class="heading">
          <img alt="" />
          <h3>Today, gently</h3>
        </div>
        <ul class="list" part="list"></ul>
      </div>
    `;
    this._list = this._root.querySelector(".list");
    this._root.querySelector(".heading img").src = YIN_SILHOUETTE_SVG;
  }

  connectedCallback() {
    this._render();
  }

  attributeChangedCallback() {
    this._render();
  }

  _parse() {
    const raw = this.getAttribute("quests");
    if (!raw) {
      return [
        { id: "ten", text: "Sit for 10 quiet minutes", done: false },
        { id: "breath", text: "Take three slow breaths together", done: true },
        { id: "return", text: "Return once after you wander", done: false },
      ];
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  _render() {
    const quests = this._parse().slice(0, 3);
    this._list.innerHTML = "";
    for (const q of quests) {
      const li = document.createElement("li");
      li.className = "row";
      li.dataset.done = q.done ? "1" : "0";
      li.innerHTML = `
        <span class="check" aria-hidden="true"><img alt="" /></span>
        <span class="text"></span>
      `;
      li.querySelector("img").src = YIN_SILHOUETTE_SVG;
      li.querySelector(".text").textContent = q.text || "";
      li.addEventListener("click", () => {
        if (li.dataset.done === "1") return;
        li.dataset.done = "1";
        this.dispatchEvent(
          new CustomEvent("ft-quest-complete", {
            bubbles: true,
            composed: true,
            detail: { id: q.id, text: q.text },
          })
        );
      });
      this._list.appendChild(li);
    }
  }
}

export const DAILY_QUEST_CARD_TAG = "daily-quest-card";
