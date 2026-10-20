// Solved-lab counts per module, persisted in this browser.
import { store } from "./util.js";

const progress = store.get("progress", {});
const listeners = [];

export const getProgress = () => progress;
export const onProgress = cb => listeners.push(cb);

export function addSolved(m) {
  progress[m] = (progress[m] || 0) + 1;
  store.set("progress", progress);
  listeners.forEach(cb => cb(progress));
}
