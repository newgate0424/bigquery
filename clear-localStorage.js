// Clear corrupted localStorage data
console.log('🧹 Clearing localStorage data...');

// Clear all monitor-related data
localStorage.removeItem('monitor-column-visibility');
localStorage.removeItem('monitor-filter-settings');
localStorage.removeItem('bigquery-dashboard-columns');
localStorage.removeItem('bigquery-dashboard-filters');

console.log('✅ LocalStorage cleared. Please refresh the page.');