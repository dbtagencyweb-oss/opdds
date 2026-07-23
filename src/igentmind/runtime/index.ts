// src/igentmind/runtime/index.ts

import {
  IGentMindRuntime,
} from "./igentmind.runtime";

export {
  IGentMindRuntime,
} from "./igentmind.runtime";

export async function createIGentMindRuntime():
  Promise<IGentMindRuntime> {
  return new IGentMindRuntime();
}

export async function createBlock20Adapter():
  Promise<IGentMindRuntime> {
  return new IGentMindRuntime();
}

export async function createRuntime():
  Promise<IGentMindRuntime> {
  return new IGentMindRuntime();
}

export default createIGentMindRuntime;
