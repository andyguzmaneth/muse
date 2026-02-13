import { create } from "zustand";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface Session {
  id: string;
  name: string;
  messages: ChatMessage[];
  isStreaming: boolean;
  cwd: string;
  totalCost: number;
}

interface AppState {
  // Sessions
  sessions: Record<string, Session>;
  activeSessionId: string | null;

  // File tree
  rootDir: string | null;

  // Settings
  apiKey: string;
  model: string;

  // Actions
  createSession: (cwd: string) => string;
  removeSession: (id: string) => void;
  setActiveSession: (id: string) => void;
  addMessage: (sessionId: string, message: ChatMessage) => void;
  appendToLastMessage: (sessionId: string, text: string) => void;
  setStreaming: (sessionId: string, streaming: boolean) => void;
  addCost: (sessionId: string, cost: number) => void;
  setRootDir: (dir: string) => void;
  setApiKey: (key: string) => void;
  setModel: (model: string) => void;
}

let sessionCounter = 0;

export const useStore = create<AppState>((set) => ({
  sessions: {},
  activeSessionId: null,
  rootDir: null,
  apiKey: "",
  model: "sonnet",

  createSession: (cwd: string) => {
    sessionCounter++;
    const id = `session-${sessionCounter}`;
    const session: Session = {
      id,
      name: `Chat ${sessionCounter}`,
      messages: [],
      isStreaming: false,
      cwd,
      totalCost: 0,
    };
    set((state) => ({
      sessions: { ...state.sessions, [id]: session },
      activeSessionId: id,
    }));
    return id;
  },

  removeSession: (id: string) => {
    set((state) => {
      const { [id]: _, ...rest } = state.sessions;
      const ids = Object.keys(rest);
      return {
        sessions: rest,
        activeSessionId:
          state.activeSessionId === id ? (ids[0] ?? null) : state.activeSessionId,
      };
    });
  },

  setActiveSession: (id: string) => set({ activeSessionId: id }),

  addMessage: (sessionId: string, message: ChatMessage) => {
    set((state) => {
      const session = state.sessions[sessionId];
      if (!session) return state;
      return {
        sessions: {
          ...state.sessions,
          [sessionId]: {
            ...session,
            messages: [...session.messages, message],
          },
        },
      };
    });
  },

  appendToLastMessage: (sessionId: string, text: string) => {
    set((state) => {
      const session = state.sessions[sessionId];
      if (!session) return state;
      const messages = [...session.messages];
      const last = messages[messages.length - 1];
      if (last && last.role === "assistant") {
        messages[messages.length - 1] = {
          ...last,
          content: last.content + text,
        };
      }
      return {
        sessions: {
          ...state.sessions,
          [sessionId]: { ...session, messages },
        },
      };
    });
  },

  setStreaming: (sessionId: string, streaming: boolean) => {
    set((state) => {
      const session = state.sessions[sessionId];
      if (!session) return state;
      return {
        sessions: {
          ...state.sessions,
          [sessionId]: { ...session, isStreaming: streaming },
        },
      };
    });
  },

  addCost: (sessionId: string, cost: number) => {
    set((state) => {
      const session = state.sessions[sessionId];
      if (!session) return state;
      return {
        sessions: {
          ...state.sessions,
          [sessionId]: {
            ...session,
            totalCost: session.totalCost + cost,
          },
        },
      };
    });
  },

  setRootDir: (dir: string) => set({ rootDir: dir }),
  setApiKey: (key: string) => set({ apiKey: key }),
  setModel: (model: string) => set({ model }),
}));
