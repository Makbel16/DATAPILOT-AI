import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, Dataset, DashboardMetrics } from '../api/client';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  timestamp: string;
}

interface AppContextType {
  datasets: Dataset[];
  activeDataset: Dataset | null;
  setActiveDataset: (ds: Dataset | null) => void;
  metrics: DashboardMetrics | null;
  isLoading: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  refreshDatasets: () => Promise<void>;
  refreshMetrics: () => Promise<void>;
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  isAssistantOpen: boolean;
  setIsAssistantOpen: (open: boolean) => void;
  notifications: AppNotification[];
  dismissNotification: (id: string) => void;
  loadDemo: () => Promise<Dataset | null>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeDataset, setActiveDataset] = useState<Dataset | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      title: 'Demo Dataset Active',
      message: 'Global SaaS Revenue sample is loaded and ready for natural-language queries.',
      type: 'info',
      timestamp: 'Just now'
    },
    {
      id: 'notif-2',
      title: 'Anomaly Engine Ready',
      message: 'Statistical Z-score and Isolation Forest detection models available.',
      type: 'success',
      timestamp: '2m ago'
    }
  ]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const refreshDatasets = async () => {
    try {
      const data = await api.getDatasets();
      setDatasets(data);
      if (data.length > 0 && !activeDataset) {
        // Select demo or first dataset
        const demo = data.find(d => d.is_demo) || data[0];
        setActiveDataset(demo);
      }
    } catch (err) {
      console.error('Failed to fetch datasets:', err);
    }
  };

  const refreshMetrics = async () => {
    try {
      const m = await api.getMetrics();
      setMetrics(m);
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
    }
  };

  const loadDemo = async (): Promise<Dataset | null> => {
    try {
      setIsLoading(true);
      const ds = await api.loadDemoDataset();
      await refreshDatasets();
      setActiveDataset(ds);
      await refreshMetrics();
      setNotifications(prev => [
        {
          id: `demo-${Date.now()}`,
          title: 'Demo Dataset Loaded',
          message: 'Loaded Global SaaS Revenue dataset with 1,500+ records.',
          type: 'success',
          timestamp: 'Just now'
        },
        ...prev
      ]);
      return ds;
    } catch (err) {
      console.error('Failed to load demo:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([refreshDatasets(), refreshMetrics()]);
      setIsLoading(false);
    };
    init();
  }, []);

  return (
    <AppContext.Provider
      value={{
        datasets,
        activeDataset,
        setActiveDataset,
        metrics,
        isLoading,
        theme,
        toggleTheme,
        refreshDatasets,
        refreshMetrics,
        isUploadModalOpen,
        setIsUploadModalOpen,
        isAssistantOpen,
        setIsAssistantOpen,
        notifications,
        dismissNotification,
        loadDemo
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
