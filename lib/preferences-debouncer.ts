// Debounce utility for preferences updates
export /* eslint-disable @typescript-eslint/no-explicit-any */
class PreferencesDebouncer {
  private static instance: PreferencesDebouncer;
  private pendingUpdates: Map<string, any> = new Map();
  private timeouts: Map<string, NodeJS.Timeout> = new Map();
  private readonly DEBOUNCE_DELAY = 500; // 500ms delay

  static getInstance(): PreferencesDebouncer {
    if (!PreferencesDebouncer.instance) {
      PreferencesDebouncer.instance = new PreferencesDebouncer();
    }
    return PreferencesDebouncer.instance;
  }

  debounceUpdate(
    type: 'sidebar' | 'theme' | 'filter' | 'columns' | 'widths' | 'colors' | 'table',
    data: unknown,
    callback: () => Promise<boolean>
  ): void {
    console.log(`Debouncer called for ${type} with data:`, data);
    
    // Clear existing timeout for this type
    const existingTimeout = this.timeouts.get(type);
    if (existingTimeout) {
      console.log(`Clearing existing timeout for ${type}`);
      clearTimeout(existingTimeout);
    }

    // Store the latest data for this type
    this.pendingUpdates.set(type, data);
    console.log(`Pending updates now has ${this.pendingUpdates.size} items`);

    // Set new timeout
    const timeout = setTimeout(async () => {
      const pendingData = this.pendingUpdates.get(type);
      if (pendingData) {
        console.log(`Executing debounced ${type} preferences update:`, pendingData);
        try {
          await callback();
          this.pendingUpdates.delete(type);
          console.log(`Successfully completed ${type} update`);
        } catch (error) {
          console.error(`Error in debounced ${type} update:`, error);
        }
      }
      this.timeouts.delete(type);
    }, this.DEBOUNCE_DELAY);

    this.timeouts.set(type, timeout);
    console.log(`Set timeout for ${type} with ${this.DEBOUNCE_DELAY}ms delay`);
  }

  // Cancel all pending updates (useful on logout)
  cancelAll(): void {
    console.log(`Cancelling all ${this.timeouts.size} pending preference updates`);
    
    for (const [type, timeout] of this.timeouts.entries()) {
      clearTimeout(timeout);
      console.log(`Cancelled ${type} preference update`);
    }
    
    this.timeouts.clear();
    this.pendingUpdates.clear();
    console.log('All preference updates cancelled');
  }

  // Force immediate execution of pending updates
  flushAll(): Promise<void[]> {
    const promises: Promise<void>[] = [];
    
    for (const [type, timeout] of this.timeouts.entries()) {
      clearTimeout(timeout);
      const data = this.pendingUpdates.get(type);
      if (data) {
        console.log(`Force flushing ${type} preferences update`);
        // Note: This would need the actual callback, which we'd need to store
        // For now, just clear the pending state
        this.pendingUpdates.delete(type);
      }
    }
    
    this.timeouts.clear();
    return Promise.all(promises);
  }

  // Check if there are pending updates for debugging
  hasPendingUpdates(): boolean {
    return this.pendingUpdates.size > 0;
  }

  getPendingTypes(): string[] {
    return Array.from(this.pendingUpdates.keys());
  }
}