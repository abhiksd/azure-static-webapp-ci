import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Monitoring Context
const MonitoringContext = createContext();

// Provider component
export function MonitoringProvider({ children }) {
  const [metrics, setMetrics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [realTimeData, setRealTimeData] = useState(null);

  // Generate mock metrics
  const generateMetrics = useCallback(() => {
    return {
      responseTime: Math.floor(Math.random() * 200) + 80,
      uptime: (99.5 + Math.random() * 0.49).toFixed(2),
      requests: Math.floor(Math.random() * 1000) + 500,
      errors: Math.floor(Math.random() * 10),
      bandwidth: Math.floor(Math.random() * 50) + 10,
      activeUsers: Math.floor(Math.random() * 100) + 50,
      cacheHitRate: (85 + Math.random() * 10).toFixed(1),
      timestamp: new Date()
    };
  }, []);

  // Generate mock alerts
  const generateAlerts = useCallback(() => {
    const possibleAlerts = [
      {
        id: '1',
        title: 'High response time detected',
        message: 'Average response time exceeded 500ms threshold',
        severity: 'warning',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        resolved: false
      },
      {
        id: '2',
        title: 'Certificate expiring soon',
        message: 'SSL certificate will expire in 7 days',
        severity: 'warning',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        resolved: false
      },
      {
        id: '3',
        title: 'High memory usage',
        message: 'Memory usage reached 85%',
        severity: 'critical',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        resolved: true
      }
    ];

    // Randomly return some alerts
    return possibleAlerts.filter(() => Math.random() > 0.6);
  }, []);

  // Fetch monitoring data
  const fetchMonitoringData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newMetrics = generateMetrics();
      const newAlerts = generateAlerts();
      
      setMetrics(newMetrics);
      setAlerts(newAlerts);
      
      return { metrics: newMetrics, alerts: newAlerts };
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [generateMetrics, generateAlerts]);

  // Start real-time monitoring
  const startRealTimeMonitoring = useCallback(() => {
    const interval = setInterval(() => {
      const newData = {
        responseTime: Math.floor(Math.random() * 200) + 80,
        activeUsers: Math.floor(Math.random() * 100) + 50,
        requestsPerMinute: Math.floor(Math.random() * 50) + 20,
        errorRate: (Math.random() * 2).toFixed(2),
        timestamp: new Date()
      };
      
      setRealTimeData(newData);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Get performance score
  const getPerformanceScore = useCallback(() => {
    if (!metrics) return 0;
    
    let score = 100;
    
    // Response time penalty
    if (metrics.responseTime > 300) score -= 20;
    else if (metrics.responseTime > 200) score -= 10;
    
    // Error rate penalty
    if (metrics.errors > 5) score -= 15;
    else if (metrics.errors > 2) score -= 5;
    
    // Uptime bonus/penalty
    const uptimeNum = parseFloat(metrics.uptime);
    if (uptimeNum < 99) score -= 30;
    else if (uptimeNum < 99.5) score -= 10;
    
    return Math.max(0, score);
  }, [metrics]);

  // Add new alert
  const addAlert = useCallback((alert) => {
    const newAlert = {
      id: Date.now().toString(),
      timestamp: new Date(),
      resolved: false,
      ...alert
    };
    
    setAlerts(prev => [newAlert, ...prev]);
  }, []);

  // Resolve alert
  const resolveAlert = useCallback((alertId) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, resolved: true, resolvedAt: new Date() }
          : alert
      )
    );
  }, []);

  // Get active alerts count
  const getActiveAlertsCount = useCallback(() => {
    return alerts.filter(alert => !alert.resolved).length;
  }, [alerts]);

  // Initialize monitoring data on mount
  useEffect(() => {
    fetchMonitoringData();
  }, [fetchMonitoringData]);

  // Start real-time monitoring on mount
  useEffect(() => {
    const cleanup = startRealTimeMonitoring();
    return cleanup;
  }, [startRealTimeMonitoring]);

  const value = {
    metrics,
    alerts,
    realTimeData,
    isLoading,
    fetchMonitoringData,
    getPerformanceScore,
    addAlert,
    resolveAlert,
    getActiveAlertsCount,
    startRealTimeMonitoring
  };

  return (
    <MonitoringContext.Provider value={value}>
      {children}
    </MonitoringContext.Provider>
  );
}

// Hook to use the context
export function useMonitoring() {
  const context = useContext(MonitoringContext);
  if (!context) {
    throw new Error('useMonitoring must be used within a MonitoringProvider');
  }
  return context;
}