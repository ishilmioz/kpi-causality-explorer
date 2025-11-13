import { create } from "zustand";
import type { ScenarioInputs, ScenarioState } from "../types/domain";
import { DEFAULT_SCENARIO } from "../types/domain";


export const useScenarioStore = create<ScenarioState>((set) => ({
  inputs: DEFAULT_SCENARIO,

  setInput: (key, value) =>
    set((state) => ({
      inputs: {
        ...state.inputs,
        [key]: value,
      },
    })),

  reset: () =>
    set(() => ({
      inputs: DEFAULT_SCENARIO,
    })),
}));

export const useScenarioInputs = (): ScenarioInputs =>
  useScenarioStore((state) => state.inputs);
