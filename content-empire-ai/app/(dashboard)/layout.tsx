import Sidebar from "../components/Sidebar";
import OnboardingGuard from "../components/OnboardingGuard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OnboardingGuard />
      <div className="app-shell">
        <Sidebar />
        <div className="main-content">{children}</div>
      </div>
    </>
  );
}
