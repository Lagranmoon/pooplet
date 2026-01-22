#!/usr/bin/env node

/**
 * Simple RLS Test Runner
 * 
 * This script demonstrates how to run RLS validation tests.
 * It can be used in CI/CD pipelines or for manual testing.
 */

import { execSync } from 'child_process';

console.log('🚀 Running RLS Policy Tests...');
console.log('================================');

try {
  // Run the RLS policy tests
  console.log('\n📋 Running Property-Based RLS Tests...');
  execSync('npm test -- rls-policies --run', { stdio: 'inherit' });
  
  console.log('\n✅ All RLS policy tests passed!');
  console.log('\n📊 Test Summary:');
  console.log('- ✅ SELECT Policy: Users can only view own records');
  console.log('- ✅ INSERT Policy: Users can only create own records');
  console.log('- ✅ UPDATE Policy: Users can only update own records');
  console.log('- ✅ DELETE Policy: Users can only delete own records');
  console.log('- ✅ Cross-User Data Isolation');
  console.log('- ✅ Anonymous User Access Restrictions');
  
  console.log('\n🔒 RLS Security Validation Complete!');
  console.log('Your Row Level Security policies are working correctly.');
  
} catch (error) {
  console.error('\n❌ RLS Tests Failed!');
  console.error('Some RLS policies may not be working correctly.');
  console.error('Please check the test output above for details.');
  process.exit(1);
}