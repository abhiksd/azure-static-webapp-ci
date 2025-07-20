import React, { createContext, useContext, useState, useCallback } from 'react';

// Health Context
const HealthContext = createContext();

// Provider component
export function HealthProvider({ children }) {
  const [healthData, setHealthData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);

  // Simulate health check API call
  const runHealthCheck = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock health check results
      const mockHealthData = {
        timestamp: new Date(),
        overall: {
          status: Math.random() > 0.2 ? 'healthy' : 'warning',
          score: Math.floor(Math.random() * 30) + 70 // 70-100
        },
        api: {
          status: Math.random() > 0.1 ? 'healthy' : 'error',
          responseTime: Math.floor(Math.random() * 200) + 50,
          lastCheck: new Date()
        },
        database: {
          status: Math.random() > 0.05 ? 'healthy' : 'warning',
          connectionPool: Math.floor(Math.random() * 20) + 80,
          queryTime: Math.floor(Math.random() * 50) + 10
        },
        external: {
          status: Math.random() > 0.15 ? 'healthy' : 'warning',
          services: [
            {
              name: 'Azure Storage',
              status: Math.random() > 0.1 ? 'healthy' : 'error',
              responseTime: Math.floor(Math.random() * 100) + 30
            },
            {
              name: 'Azure CDN',
              status: Math.random() > 0.05 ? 'healthy' : 'warning',
              responseTime: Math.floor(Math.random() * 80) + 20
            },
            {
              name: 'External API',
              status: Math.random() > 0.2 ? 'healthy' : 'error',
              responseTime: Math.floor(Math.random() * 300) + 100
            }
          ]
        },
        performance: {
          memoryUsage: Math.floor(Math.random() * 30) + 40, // 40-70%
          cpuUsage: Math.floor(Math.random() * 25) + 15,    // 15-40%
          diskUsage: Math.floor(Math.random() * 20) + 60    // 60-80%
        },
        security: {
          certificates: {
            status: 'healthy',
            expiresIn: 45 // days
          },
          dependencies: {
            status: Math.random() > 0.1 ? 'healthy' : 'warning',
            vulnerabilities: Math.floor(Math.random() * 3)
          }
        }
      };

      setHealthData(mockHealthData);
      setLastCheck(new Date());
      
      return mockHealthData;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get health status summary
  const getHealthSummary = useCallback(() => {
    if (!healthData) return null;

    const checks = [
      healthData.api.status,
      healthData.database.status,
      healthData.external.status
    ];

    const healthyCount = checks.filter(status => status === 'healthy').length;
    const warningCount = checks.filter(status => status === 'warning').length;
    const errorCount = checks.filter(status => status === 'error').length;

    return {
      total: checks.length,
      healthy: healthyCount,
      warning: warningCount,
      error: errorCount,
      score: healthData.overall.score
    };
  }, [healthData]);

  // Check if health data is stale
  const isHealthDataStale = useCallback(() => {
    if (!lastCheck) return true;
    const staleThreshold = 5 * 60 * 1000; // 5 minutes
    return Date.now() - lastCheck.getTime() > staleThreshold;
  }, [lastCheck]);

  const value = {
    healthData,
    isLoading,
    lastCheck,
    runHealthCheck,
    getHealthSummary,
    isHealthDataStale
  };

  return (
    <HealthContext.Provider value={value}>
      {children}
    </HealthContext.Provider>
  );
}

// Hook to use the context
export function useHealth() {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
}