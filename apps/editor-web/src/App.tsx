import * as React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useUiStore } from '@/stores/uiStore';
import { Dashboard } from '@/pages/Dashboard';
import { DocumentViewer } from '@/pages/DocumentViewer';
import { Settings } from '@/pages/Settings';
import { UpgradePage } from '@/pages/UpgradePage';

export function App(): React.ReactElement {
  const theme = useUiStore((state) => state.theme);

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/view" element={<DocumentViewer />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/upgrade" element={<UpgradePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
