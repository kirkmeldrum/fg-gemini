
import { smartSearch, getCoverageStats } from '../db/searchRepository.js';

async function testSearch() {
    try {
        const userId = 5; // Jane
        const householdId = null;

        console.log('Testing coverage stats...');
        const stats = await getCoverageStats(userId, householdId);
        console.log(JSON.stringify(stats, null, 2));

        console.log('\nTesting smart search...');
        const results = await smartSearch(userId, householdId, { max_missing: 5, assume_pantry_staples: false });
        console.log(`Found ${results.length} results.`);

        results.forEach(r => {
            console.log(`${r.title}: ${r.coverage_percentage}% coverage. Missing: [${r.missing_ingredients.join(', ')}]`);
        });

        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
}

testSearch();
