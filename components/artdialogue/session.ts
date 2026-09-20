export type SessionState = {
  noticed: string[];
  opened: string[];
  activeId: string | null;
  revealed: boolean;
};

export type SessionAction =
  | { type: "notice"; id: string }
  | { type: "open"; id: string }
  | { type: "close" }
  | { type: "reveal" }
  | { type: "hideReveal" }
  | { type: "reset" };

export const initialSessionState: SessionState = {
  noticed: [],
  opened: [],
  activeId: null,
  revealed: false,
};

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "notice":
      if (state.noticed.includes(action.id)) return state;
      return { ...state, noticed: [...state.noticed, action.id] };
    case "open": {
      const opened = state.opened.includes(action.id) ? state.opened : [...state.opened, action.id];
      const revealed = state.revealed || opened.length >= 3;
      return { ...state, activeId: action.id, opened, revealed };
    }
    case "close":
      return { ...state, activeId: null };
    case "reveal":
      return { ...state, revealed: true };
    case "hideReveal":
      return { ...state, revealed: false };
    case "reset":
      return initialSessionState;
    default:
      return state;
  }
}
