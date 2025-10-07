/**
 * Performance monitoring utilities for tracking loading times and user experience
 */

interface PerformanceMetric {
	name: string;
	startTime: number;
	endTime?: number;
	duration?: number;
	metadata?: Record<string, any>;
}

class PerformanceMonitor {
	private metrics: Map<string, PerformanceMetric> = new Map();
	private observers: PerformanceObserver[] = [];

	constructor() {
		this.initializeObservers();
	}

	/**
	 * Start tracking a performance metric
	 */
	startMetric(name: string, metadata?: Record<string, any>): void {
		this.metrics.set(name, {
			name,
			startTime: performance.now(),
			metadata
		});
	}

	/**
	 * End tracking a performance metric
	 */
	endMetric(name: string): number | null {
		const metric = this.metrics.get(name);
		if (!metric) {
			console.warn(`Performance metric "${name}" not found`);
			return null;
		}

		const endTime = performance.now();
		const duration = endTime - metric.startTime;

		metric.endTime = endTime;
		metric.duration = duration;

		// Log slow operations
		if (duration > 1000) {
			console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`, metric.metadata);
		} else {
			console.log(`Performance: ${name} completed in ${duration.toFixed(2)}ms`);
		}

		return duration;
	}

	/**
	 * Track subscription check performance
	 */
	trackSubscriptionCheck(userId: string): () => void {
		const metricName = `subscription_check_${userId}`;
		this.startMetric(metricName, { userId, timestamp: new Date().toISOString() });
		
		return () => this.endMetric(metricName);
	}

	/**
	 * Track page load performance
	 */
	trackPageLoad(pageName: string): () => void {
		const metricName = `page_load_${pageName}`;
		this.startMetric(metricName, { pageName, timestamp: new Date().toISOString() });
		
		return () => this.endMetric(metricName);
	}

	/**
	 * Track API call performance
	 */
	trackApiCall(endpoint: string, method: string = 'GET'): () => void {
		const metricName = `api_call_${method}_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`;
		this.startMetric(metricName, { endpoint, method, timestamp: new Date().toISOString() });
		
		return () => this.endMetric(metricName);
	}

	/**
	 * Get all metrics
	 */
	getMetrics(): PerformanceMetric[] {
		return Array.from(this.metrics.values());
	}

	/**
	 * Get slow metrics (over threshold)
	 */
	getSlowMetrics(threshold: number = 1000): PerformanceMetric[] {
		return this.getMetrics().filter(metric => 
			metric.duration && metric.duration > threshold
		);
	}

	/**
	 * Clear all metrics
	 */
	clearMetrics(): void {
		this.metrics.clear();
	}

	/**
	 * Initialize performance observers
	 */
	private initializeObservers(): void {
		// Track navigation timing
		if ('PerformanceObserver' in window) {
			try {
				const navObserver = new PerformanceObserver((list) => {
					const entries = list.getEntries();
					entries.forEach((entry) => {
						if (entry.entryType === 'navigation') {
							const navEntry = entry as PerformanceNavigationTiming;
							console.log('Navigation Performance:', {
								loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
								domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
								firstPaint: navEntry.responseEnd - navEntry.requestStart
							});
						}
					});
				});
				navObserver.observe({ entryTypes: ['navigation'] });
				this.observers.push(navObserver);
			} catch (error) {
				console.warn('PerformanceObserver not supported:', error);
			}
		}
	}

	/**
	 * Cleanup observers
	 */
	cleanup(): void {
		this.observers.forEach(observer => observer.disconnect());
		this.observers = [];
	}
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export types
export type { PerformanceMetric };
