// Performance monitoring utilities for debugging and optimization
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, {
    count: number;
    totalTime: number;
    minTime: number;
    maxTime: number;
    avgTime: number;
  }> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Start timing an operation
  startTiming(operation: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.recordMetric(operation, duration);
    };
  }

  // Record a metric manually
  recordMetric(operation: string, duration: number): void {
    const existing = this.metrics.get(operation);
    
    if (existing) {
      existing.count++;
      existing.totalTime += duration;
      existing.minTime = Math.min(existing.minTime, duration);
      existing.maxTime = Math.max(existing.maxTime, duration);
      existing.avgTime = existing.totalTime / existing.count;
    } else {
      this.metrics.set(operation, {
        count: 1,
        totalTime: duration,
        minTime: duration,
        maxTime: duration,
        avgTime: duration
      });
    }

    // Log slow operations (>1000ms)
    if (duration > 1000) {
      console.warn(`🐌 Slow operation detected: ${operation} took ${Math.round(duration)}ms`);
    }
  }

  // Get metrics for a specific operation
  getMetric(operation: string) {
    return this.metrics.get(operation);
  }

  // Get all metrics
  getAllMetrics() {
    return Object.fromEntries(this.metrics.entries());
  }

  // Get performance report
  getReport(): string {
    let report = '\n📊 Performance Report:\n';
    report += '=' .repeat(50) + '\n';

    const sortedMetrics = Array.from(this.metrics.entries())
      .sort((a, b) => b[1].avgTime - a[1].avgTime);

    sortedMetrics.forEach(([operation, metric]) => {
      const avgTime = Math.round(metric.avgTime);
      const minTime = Math.round(metric.minTime);
      const maxTime = Math.round(metric.maxTime);
      
      let status = '🟢'; // Green - fast
      if (avgTime > 500) status = '🟡'; // Yellow - medium  
      if (avgTime > 1000) status = '🔴'; // Red - slow

      report += `${status} ${operation}:\n`;
      report += `   Count: ${metric.count} | Avg: ${avgTime}ms | Min: ${minTime}ms | Max: ${maxTime}ms\n`;
    });

    return report;
  }

  // Log report to console
  logReport(): void {
    console.log(this.getReport());
  }

  // Reset all metrics
  reset(): void {
    this.metrics.clear();
    console.log('📊 Performance metrics reset');
  }

  // Enable automatic reporting every N minutes
  enableAutoReporting(intervalMinutes: number = 5): void {
    setInterval(() => {
      if (this.metrics.size > 0) {
        this.logReport();
      }
    }, intervalMinutes * 60 * 1000);
    
    console.log(`📊 Auto-reporting enabled every ${intervalMinutes} minutes`);
  }
}

// Utility functions for common performance monitoring
export function measureAPICall<T>(
  operation: string,
  apiCall: () => Promise<T>
): Promise<T> {
  const monitor = PerformanceMonitor.getInstance();
  const stopTiming = monitor.startTiming(`API: ${operation}`);

  return apiCall().finally(() => {
    stopTiming();
  });
}

export function measureFunction<T>(
  operation: string,
  fn: () => T
): T {
  const monitor = PerformanceMonitor.getInstance();
  const stopTiming = monitor.startTiming(`Function: ${operation}`);

  try {
    return fn();
  } finally {
    stopTiming();
  }
}

// React hook for measuring component render times
export function usePerfMonitor(componentName: string) {
  const monitor = PerformanceMonitor.getInstance();
  
  return {
    measureRender: () => {
      const stopTiming = monitor.startTiming(`Render: ${componentName}`);
      return stopTiming;
    },
    measureEffect: (effectName: string) => {
      const stopTiming = monitor.startTiming(`Effect: ${componentName}.${effectName}`);
      return stopTiming;
    }
  };
}

// Initialize performance monitoring in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const monitor = PerformanceMonitor.getInstance();
  monitor.enableAutoReporting(5); // Report every 5 minutes
  
  // Add to window for debugging
  (window as any).performanceMonitor = monitor;
  
  console.log('📊 Performance monitoring enabled');
  console.log('Use window.performanceMonitor.logReport() to see metrics');
}