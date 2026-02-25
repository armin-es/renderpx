"use client";

import { useState, useRef, type ReactNode } from "react";
import { FormContext } from "./FormContext";
import { StickyActionBar } from "./StickyActionBar";
import { FormContent } from "./FormContent";

function useRenderCount() {
  const count = useRef(0);
  count.current += 1;
  return count.current;
}

function Sidebar() {
  const renders = useRenderCount();
  return (
    <aside
      className="w-28 shrink-0 flex flex-col gap-1.5 px-3 py-3 border-r text-xs"
      style={{
        backgroundColor: "hsl(var(--preview-bg))",
        borderColor: "hsl(var(--content-border))",
        color: "hsl(var(--content-text))",
      }}
    >
      <span className="font-medium mb-1">Settings</span>
      <span style={{ color: "hsl(var(--content-text-muted))" }}>Profile</span>
      <span style={{ color: "hsl(var(--content-text-muted))" }}>Security</span>
      <span style={{ color: "hsl(var(--content-text-muted))" }}>Billing</span>
      <span
        className="tabular-nums mt-auto pt-2 border-t"
        style={{
          borderColor: "hsl(var(--content-border) / 0.4)",
          color: "hsl(var(--content-text-muted))",
        }}
      >
        Renders: {renders}
      </span>
    </aside>
  );
}

function Footer() {
  const renders = useRenderCount();
  return (
    <footer
      className="flex items-center justify-between px-4 py-2.5 border-t text-xs"
      style={{
        backgroundColor: "hsl(var(--card-toolbar-bg))",
        borderColor: "hsl(var(--content-border))",
        color: "hsl(var(--content-text))",
      }}
    >
      <span style={{ color: "hsl(var(--content-text-muted))" }}>
        Changes auto-save
      </span>
      <span
        className="tabular-nums"
        style={{ color: "hsl(var(--content-text-muted))" }}
      >
        Renders: {renders}
      </span>
    </footer>
  );
}

// State + Provider live here. Only ActionBar and Content are children.
function FormStateWrapper({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState({ email: "", phone: "" });
  return (
    <FormContext.Provider value={{ formData, setFormData }}>
      <div className="flex-1 min-w-0 flex flex-col">{children}</div>
    </FormContext.Provider>
  );
}

export function SolutionDemo() {
  const [key, setKey] = useState(0);

  return (
    <div className="w-full max-w-md mx-auto text-left space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setKey((k) => k + 1)}
          className="text-xs px-2.5 py-1.5 rounded border focus:outline-none focus:ring-2"
          style={{
            borderColor: "hsl(var(--content-border))",
            color: "hsl(var(--content-text-muted))",
          }}
        >
          Reset
        </button>
        <span
          className="text-[11px]"
          style={{ color: "hsl(var(--content-text-muted))" }}
        >
          Provider wraps only sticky bar &amp; form → Sidebar &amp; Footer never
          re-render.
        </span>
      </div>
      <div
        key={key}
        className="rounded-lg overflow-hidden border shadow-sm"
        style={{
          borderColor: "hsl(var(--content-border))",
          backgroundColor: "hsl(var(--card-bg))",
        }}
      >
        <div className="flex min-h-[140px]">
          <Sidebar />
          <FormStateWrapper>
            <StickyActionBar />
            <FormContent />
          </FormStateWrapper>
        </div>
        <Footer />
      </div>
    </div>
  );
}
