// Debug script for pagination issues
console.log('=== Debugging Pagination Issues ===');

// Check current page state
console.log('Current URL:', window.location.href);
console.log('Current page in URL params:', new URLSearchParams(window.location.search).get('page'));

// Check localStorage
console.log('LocalStorage data:');
console.log('- Token:', localStorage.getItem('token') ? 'EXISTS' : 'NOT FOUND');
console.log('- User:', localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : 'NOT FOUND');
console.log('- Filters:', localStorage.getItem('bigquery-dashboard-filters'));

// Monitor clicks on pagination buttons
function monitorPagination() {
    // Find pagination buttons
    const paginationButtons = document.querySelectorAll('button');
    const pageButtons = Array.from(paginationButtons).filter(btn => 
        btn.textContent.match(/^\d+$/) || 
        btn.textContent.includes('ถัดไป') || 
        btn.textContent.includes('ก่อนหน้า')
    );
    
    console.log('Found pagination buttons:', pageButtons.length);
    
    pageButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            console.log('Pagination button clicked:', btn.textContent);
            console.log('Button element:', btn);
            
            // Log network requests after button click
            setTimeout(() => {
                console.log('Checking for API calls...');
                // This will be visible in Network tab
            }, 500);
        });
    });
}

// Run after DOM loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', monitorPagination);
} else {
    monitorPagination();
}

// Monitor for React state changes
let originalFetch = window.fetch;
window.fetch = function(...args) {
    console.log('API Call:', args[0]);
    return originalFetch.apply(this, args);
};

console.log('Debug script loaded. Check console for pagination activity.');