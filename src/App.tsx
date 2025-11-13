
import { useState } from "react";
import { Dashboard } from "./pages/Dashboard";
import { Scenarios } from "./pages/Scenarios";
import { Causality } from "./pages/Causality";
import { Insights } from "./pages/Insights";

type Page = "dashboard" | "scenarios" | "causality" | "insights";

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard />;
      case "scenarios":
        return <Scenarios />;
      case "causality":
        return <Causality />;
      case "insights":
        return <Insights />;
      default:
        return <Dashboard />;
    }
  };

  return (
<div
  style={{
    minHeight: "100vh",
    backgroundColor: "#e5e7eb", 
  }}
>

     <div
  style={{
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "32px 24px 48px",
  }}
>

        {/* App header */}
<header
  style={{
    marginBottom: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
  }}
>
  <div>
    <h1
      style={{
        margin: 0,
        fontSize: "1.6rem",
        fontWeight: 700,
        color: "#111827", // zorla koyu
      }}
    >
      KPI Causality Explorer
    </h1>
    <p
      style={{
        margin: 0,
        fontSize: "0.9rem",
        color: "#6b7280",
      }}
    >
      Synthetic KPI analytics · Causality · AI insights
    </p>
  </div>
</header>

<div style={{ height: "8px" }} />



        <nav
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "24px",
            borderBottom: "1px solid #ddd",
            paddingBottom: "8px",
          }}
        >
          <NavButton
            label="Dashboard"
            active={page === "dashboard"}
            onClick={() => setPage("dashboard")}
          />
          <NavButton
            label="Scenarios"
            active={page === "scenarios"}
            onClick={() => setPage("scenarios")}
          />
          <NavButton
            label="Causality"
            active={page === "causality"}
            onClick={() => setPage("causality")}
          />
          <NavButton
            label="Insights"
            active={page === "insights"}
            onClick={() => setPage("insights")}
          />
        </nav>

      <main
        style={{
        backgroundColor: "#f9fafb",         
        border: "1px solid #d1d5db",        
        borderRadius: "10px",
        padding: "20px 24px 24px",
        boxShadow: "0 8px 20px rgba(15,23,42,0.06)",
        }}
      >

          {renderPage()}
        </main>
      </div>
    </div>
  );
}

interface NavButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavButton({ label, active, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 12px",
        borderRadius: "999px",
        border: active ? "2px solid #111827" : "1px solid #cbd5e1",
        backgroundColor: active ? "#111827" : "#e5e7eb",
        color: active ? "#fff" : "#111827",
        fontSize: "0.9rem",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
