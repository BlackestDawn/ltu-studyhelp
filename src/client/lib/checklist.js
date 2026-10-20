// Ticked objectives and reading, persisted in this browser. Keys are
// `${moduleId}${i}` for objectives and `r${moduleId}${i}` for reading.
import { store } from "./util.js";

const state = store.get("obj", {});

export const isChecked = k => !!state[k];

export const countChecked = (prefix, n) =>
  Array.from({ length: n }, (_, i) => state[prefix + i]).filter(Boolean).length;

export const checkbox = (key, label) =>
  `<li><label><input type="checkbox" data-ck="${key}" ${state[key] ? "checked" : ""}><span>${label}</span></label></li>`;

export function bindChecklists(root) {
  root.addEventListener("change", e => {
    const t = e.target;
    if (!t.matches("input[data-ck]")) return;
    state[t.dataset.ck] = t.checked;
    store.set("obj", state);
  });
}
