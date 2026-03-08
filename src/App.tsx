import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { DesktopGate } from "@/components/DesktopGate";
import { useAnalytics } from "@/hooks/useAnalytics";
import { HomePage } from "@/pages/HomePage";
import { SchedulePage } from "@/pages/SchedulePage";
import { MeditationsPage } from "@/pages/MeditationsPage";
import { GuidePage } from "@/pages/GuidePage";
import { AboutPage } from "@/pages/AboutPage";
import { ContactPage } from "@/pages/ContactPage";
import { TestimonialsPage } from "@/pages/TestimonialsPage";

function AnalyticsTracker() {
  useAnalytics();
  return null;
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <LanguageProvider>
        <DesktopGate>
        <AuthProvider>
        <BrowserRouter>
          <AnalyticsTracker />
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/meditations" element={<MeditationsPage />} />
              <Route path="/guide" element={<GuidePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/testimonials" element={<TestimonialsPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
        </AuthProvider>
        </DesktopGate>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
