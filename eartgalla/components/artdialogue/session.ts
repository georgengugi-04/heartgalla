import type { Annotation } from "@/lib/annotations";
import type { CollectionItem } from "@/lib/collection";

/** A work as the Dialogue sees it: the shared collection item plus its observations. */
export type DialogueWork = CollectionItem & { annotations: Annotation[] };

/**
 * LOOK → NOTICE → EXPLORE → UNDERSTAND → REVEAL → RETURN
 *  noticed   details the visitor has found (by pausing on them, or from the list)
 *  opened    details they have actually read
 *  activeId  the detail currently shown
 *  revealed  the work's own information is showing
 */
export type Session = {
  noticed: string[];
  opened: string[];
  activeId: string | null;
  revealed: boolean;
};

export const emptySession: Session = { noticed: [], opened: [], activeId: null, revealed: false };

export type Action =
  | { type: "notice"; id: string }
  | { type: "open"; id: string; threshold: number }
  | { type: "close" }
  | { type: "reveal" }
  | { type: "hideReveal" }
  | { type: "reset" };

const add = (list: string[], id: string) => (list.includes(id) ? list : [...list, id]);

export function sessionReducer(s: Session, a: Action): Session {
  switch (a.type) {
    case "notice":
      return s.noticed.includes(a.id) ? s : { ...s, noticed: add(s.noticed, a.id) };
    case "open": {
      const opened = add(s.opened, a.id);
      return {
        noticed: add(s.noticed, a.id),
        opened,
        activeId: a.id,
        revealed: s.revealed || opened.length >= a.threshold,
      };
    }
    case "close":
      return { ...s, activeId: null };
    case "reveal":
      return { ...s, revealed: true };
    case "hideReveal":
      return { ...s, revealed: false, activeId: null };
    case "reset":
      return emptySession;
  }
}
