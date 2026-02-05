import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import { OverviewPage } from './pages/OverviewPage';
import { ModelRouterPage } from './pages/ModelRouterPage';
import { AnomalyPage } from './pages/AnomalyPage';
import { PolicyPage } from './pages/PolicyPage';
import { LoginPage } from './pages/LoginPage';

export default function App() {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem('ramp_auth') === 'true'
  );

  if (!authenticated) {
    return <LoginPage onAuthenticated={() => setAuthenticated(true)} />;
  }

  return (
    <Shell>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/router" element={<ModelRouterPage />} />
        <Route path="/anomalies" element={<AnomalyPage />} />
        <Route path="/policy" element={<PolicyPage />} />
      </Routes>
    </Shell>
  );
}
