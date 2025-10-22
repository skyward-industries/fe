#!/usr/bin/env node

// Test the middleware regex patterns

const testUrls = [
  '/catalog/34/metalworking-machinery/3460/nsn-machine-tool-accessories/nsn-3460-01-574-5652',
  '/catalog/30/mechanical-power-transmission-equipment/3040/nsn-miscellaneous-power-transmission-equipment/nsn-3040-00-074-9541',
  '/catalog/16/aerospace-craft-components-and-accessories/1670/nsn-parachutes-aerial-pick-up-delivery-recovery-systems-and-cargo-tie-down-equipment/nsn-1670-01-629-3423',
  '/catalog/34/metalworking-machinery/3460/machine-tool-accessories/3460-01-574-5652', // New format (should NOT match)
];

const catalogPattern = /^\/catalog\/(\d+)\/([^\/]+)\/(\d+)\/(nsn-[^\/]+)\/(nsn-[\d-]+)$/;
const nsnOnlyPattern = /^\/catalog\/(\d+)\/([^\/]+)\/(\d+)\/([^\/]+)\/(nsn-[\d-]+)$/;

console.log('Testing Middleware Redirect Patterns\n');
console.log('='.repeat(80));

testUrls.forEach((url, i) => {
  console.log(`\nTest ${i + 1}: ${url}`);
  console.log('-'.repeat(80));

  const match1 = url.match(catalogPattern);
  const match2 = url.match(nsnOnlyPattern);

  if (match1) {
    console.log('✅ Matched catalogPattern (both nsn- prefixes)');
    const [, groupId, groupName, subgroupId, subgroupName, nsn] = match1;
    console.log(`   Captured groups:`);
    console.log(`   - groupId: ${groupId}`);
    console.log(`   - groupName: ${groupName}`);
    console.log(`   - subgroupId: ${subgroupId}`);
    console.log(`   - subgroupName: ${subgroupName}`);
    console.log(`   - nsn: ${nsn}`);

    const cleanSubgroupName = subgroupName.replace(/^nsn-/, '');
    const cleanNsn = nsn.replace(/^nsn-/, '');
    const newPath = `/catalog/${groupId}/${groupName}/${subgroupId}/${cleanSubgroupName}/${cleanNsn}`;
    console.log(`   → Would redirect to: ${newPath}`);
  } else if (match2) {
    console.log('✅ Matched nsnOnlyPattern (only NSN has prefix)');
    const [, groupId, groupName, subgroupId, subgroupName, nsn] = match2;
    console.log(`   Captured groups:`);
    console.log(`   - groupId: ${groupId}`);
    console.log(`   - groupName: ${groupName}`);
    console.log(`   - subgroupId: ${subgroupId}`);
    console.log(`   - subgroupName: ${subgroupName}`);
    console.log(`   - nsn: ${nsn}`);

    const cleanSubgroupName = subgroupName.replace(/^nsn-/, '');
    const cleanNsn = nsn.replace(/^nsn-/, '');

    if (subgroupName !== cleanSubgroupName || nsn !== cleanNsn) {
      const newPath = `/catalog/${groupId}/${groupName}/${subgroupId}/${cleanSubgroupName}/${cleanNsn}`;
      console.log(`   → Would redirect to: ${newPath}`);
    } else {
      console.log(`   → No redirect needed (already clean)`);
    }
  } else {
    console.log('❌ No match - URL would pass through without redirect');
  }
});

console.log('\n' + '='.repeat(80));
console.log('\nConclusion:');
console.log('If the patterns match correctly above but redirects are not working,');
console.log('the issue is likely with:');
console.log('1. Next.js middleware not being triggered');
console.log('2. Build not including middleware');
console.log('3. Middleware matcher configuration');
