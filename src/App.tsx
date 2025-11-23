import React from 'react';
import Navigation from './components/Navigation';

interface NavigationItem {
  name: string;
  link: string;
}

const App: React.FC = () => {
  // This data would normally come from Jekyll's data files
  // For now, we'll hardcode it, but we can inject it from Jekyll later
  const navigationItems: NavigationItem[] = (window as any).navigationData || [
    { name: 'Home', link: '/' },
    { name: 'Projects', link: '/projects' }
  ];

  return (
    <>
      <Navigation items={navigationItems} />
    </>
  );
};

export default App;
