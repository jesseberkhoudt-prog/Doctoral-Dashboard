// Import script for 51 annotated bibliography sources
// Run this in the browser console after logging into the Dashboard

async function importSources() {
  try {
    // Fetch the sources JSON
    const response = await fetch('/sources-data.json');
    const sources = await response.json();
    
    console.log(`Importing ${sources.length} sources...`);
    
    // Add unique IDs and timestamps
    const sourcesWithIds = sources.map((source, index) => ({
      ...source,
      id: `source_${Date.now()}_${index}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    // Save to localStorage
    localStorage.setItem('doctoral_dashboard_sources', JSON.stringify(sourcesWithIds));
    
    console.log('✅ Import complete!');
    console.log(`Total sources imported: ${sourcesWithIds.length}`);
    console.log('Breakdown by bucket:');
    
    const bucketCounts = {};
    sourcesWithIds.forEach(s => {
      const bucket = s.bucket || 'Unclassified';
      bucketCounts[bucket] = (bucketCounts[bucket] || 0) + 1;
    });
    
    Object.entries(bucketCounts).forEach(([bucket, count]) => {
      console.log(`  ${bucket}: ${count} sources`);
    });
    
    console.log('\nLens classification:');
    const lensCounts = {};
    sourcesWithIds.forEach(s => {
      const lens = s.mega_macro_micro || 'Unclassified';
      lensCounts[lens] = (lensCounts[lens] || 0) + 1;
    });
    
    Object.entries(lensCounts).forEach(([lens, count]) => {
      console.log(`  ${lens}: ${count} sources`);
    });
    
    alert(`Successfully imported ${sourcesWithIds.length} sources! Please refresh the page.`);
    
  } catch (error) {
    console.error('Import failed:', error);
    alert('Import failed. Check console for details.');
  }
}

// Auto-run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('Sources import script loaded. Run importSources() to begin import.');
  });
} else {
  console.log('Sources import script loaded. Run importSources() to begin import.');
}
