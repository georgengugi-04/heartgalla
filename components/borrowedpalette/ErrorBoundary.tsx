"use client";
import { Component, type ReactNode } from "react";

/** If anything in the studio throws, show a calm message instead of a blank page. The autosave (if any) is untouched. */
export default class ErrorBoundary extends Component<{ children: ReactNode; onReset?: () => void }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) { console.error("Borrowed Palette crashed:", error); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="mx-auto my-16 max-w-xl px-6 text-center">
        <h2 className="font-editorial text-3xl">Something went wrong in the studio.</h2>
        <p className="mt-4 text-ivory/70">Your last autosave, if there is one, is still on this device. Reload the studio and choose “Continue where you left off”.</p>
        <button type="button" onClick={() => { this.setState({ error: null }); this.props.onReset?.(); }} className="label-mono mt-8 min-h-12 rounded-full border border-gold px-8 text-gold hover:bg-gold hover:text-charcoal">Reload the studio</button>
      </div>
    );
  }
}
