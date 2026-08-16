/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { YIN_SILHOUETTE_SVG } from "./_shared.js";

const STYLE = `
:host {
  display: block;
  font-family: var(--font-family);
  color: var(--color-ink);
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
  gap: 0.75rem;
}
.cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}
.item {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  background: var(--color-panel);
  border: 1px solid var(--color-ink-faint);
  display: grid;
  place-items: center;
  overflow: hidden;
  position: relative;
}
.item img {
  width: 70%;
  height: 70%;
  object-fit: contain;
}
.item[data-locked="1"] img {
  opacity: 0.22;
  filter: grayscale(0.35) contrast(0.9);
}
.item[data-locked="1"]::after {
  content: "";
  position: absolute;
  inset: 18%;
  border-radius: 50%;
  border: 1px dashed var(--color-ink-muted);
  opacity: 0.35;
  pointer-events: none;
}
.cap {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  text-align: center;
}
`;

/**
 * Design exploration for memorial keepsakes (Backlog).
 * Locked items use soft silhouettes — no lock icons.
 */
export class CollectionShelf extends HTMLElement {
  static get observedAttributes() {
    return ["items"];
  }

  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this._root.innerHTML = `
      <style>${STYLE}</style>
      <div class="grid" part="grid"></div>
    `;
    this._grid = this._root.querySelector(".grid");
  }

  connectedCallback() {
    this._render();
  }

  attributeChangedCallback() {
    this._render();
  }

  /**
   * items JSON: [{ id, label, unlocked, src? }]
   */
  _parseItems() {
    const raw = this.getAttribute("items");
    if (!raw) {
      return [
        { id: "cloak", label: "Soft cloak", unlocked: true },
        { id: "lantern", label: "Evening lantern", unlocked: false },
        { id: "teacup", label: "Daytime teacup", unlocked: false },
        { id: "embroidery", label: "Cushion stitch", unlocked: true },
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
    const items = this._parseItems();
    this._grid.innerHTML = "";
    for (const item of items) {
      const wrap = document.createElement("div");
      wrap.className = "cell";
      const cell = document.createElement("div");
      cell.className = "item";
      cell.dataset.locked = item.unlocked ? "0" : "1";
      cell.title = item.unlocked ? item.label || "" : "Not yet revealed";
      const img = document.createElement("img");
      img.src = item.src || YIN_SILHOUETTE_SVG;
      img.alt = item.unlocked ? item.label || "" : "";
      cell.appendChild(img);
      wrap.appendChild(cell);
      if (item.label) {
        const cap = document.createElement("div");
        cap.className = "cap";
        cap.textContent = item.unlocked ? item.label : "···";
        wrap.appendChild(cap);
      }
      this._grid.appendChild(wrap);
    }
  }
}

export const COLLECTION_SHELF_TAG = "collection-shelf";
