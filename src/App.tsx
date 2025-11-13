
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
        backgroundColor: "#f3f4f6",
      }}
    >
      <div
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          padding: "24px 16px 40px",
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
            backgroundColor: "#fff",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "16px 20px 20px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.04)",
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
        border: active ? "2px solid #000" : "1px solid #ccc",
        backgroundColor: active ? "#000" : "#f8f8f8",
        color: active ? "#fff" : "#333",
        fontSize: "0.9rem",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
