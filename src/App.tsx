import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { CreatorVerseProvider } from "./context/CreatorVerseContext";
import { ToastRegion } from "./components/ToastRegion";
import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { MyIdeasPage } from "./pages/MyIdeasPage";
import { PublicHubPage } from "./pages/PublicHubPage";
import { TrendingAudioPage } from "./pages/TrendingAudioPage";
import { AIGeneratorPage } from "./pages/AIGeneratorPage";
import { CollaboratePage } from "./pages/CollaboratePage";
import { BrandsPage } from "./pages/BrandsPage";
import { CreatorEarnPage } from "./pages/CreatorEarnPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
  return (
    <CreatorVerseProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/ideas" element={<MyIdeasPage />} />
          <Route path="/hub" element={<PublicHubPage />} />
          <Route path="/audio" element={<TrendingAudioPage />} />
          <Route path="/ai-generator" element={<AIGeneratorPage />} />
          <Route path="/collaborate" element={<CollaboratePage />} />
          <Route path="/brands" element={<BrandsPage />} />
          <Route path="/earn" element={<CreatorEarnPage />} />
          <Route path="/earn/:section" element={<CreatorEarnPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastRegion />
      </BrowserRouter>
    </CreatorVerseProvider>
  );
}
