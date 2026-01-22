/**
 * RLS Validation Script
 * 
 * This script can be run to manually validate RLS policies against a Supabase instance.
 * It performs a series of operations to ensure that RLS policies are working correctly.
 * 
 * Usage:
 * 1. Set up environment variables for Supabase connection
 * 2. Create test user accounts
 * 3. Run: npx tsx src/test/rls-validation-script.ts
 */

import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

interface TestResult {
  test: string
  passed: boolean
  message: string
  details?: any
}

class RLSValidator {
  private results: TestResult[] = []
  private supabase1: any
  private supabase2: any
  private user1: any
  private user2: any

  constructor() {
    this.supabase1 = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
    this.supabase2 = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
  }

  private addResult(test: string, passed: boolean, message: string, details?: any) {
    this.results.push({ test, passed, message, details })
    const status = passed ? '✅' : '❌'
    console.log(`${status} ${test}: ${message}`)
    if (details && !passed) {
      console.log('   Details:', details)
    }
  }

  async setupTestUsers() {
    console.log('\n🔧 Setting up test users...')
    
    // For this validation, we'll use test credentials if provided
    const testUser1Email = process.env.TEST_USER_1_EMAIL || 'test1@example.com'
    const testUser1Password = process.env.TEST_USER_1_PASSWORD || 'testpassword123'
    const testUser2Email = process.env.TEST_USER_2_EMAIL || 'test2@example.com'
    const testUser2Password = process.env.TEST_USER_2_PASSWORD || 'testpassword123'

    try {
      // Try to sign in existing users first
      const { data: user1Data, error: user1Error } = await this.supabase1.auth.signInWithPassword({
        email: testUser1Email,
        password: testUser1Password
      })

      const { data: user2Data, error: user2Error } = await this.supabase2.auth.signInWithPassword({
        email: testUser2Email,
        password: testUser2Password
      })

      if (user1Error || user2Error) {
        this.addResult('User Authentication', false, 'Failed to authenticate test users', {
          user1Error: user1Error?.message,
          user2Error: user2Error?.message
        })
        return false
      }

      this.user1 = user1Data.user
      this.user2 = user2Data.user

      this.addResult('User Authentication', true, 'Test users authenticated successfully')
      return true
    } catch (error) {
      this.addResult('User Authentication', false, 'Exception during user setup', error)
      return false
    }
  }

  async testSelectPolicy() {
    console.log('\n🔍 Testing SELECT policy...')

    try {
      // Create a test record for user 1
      const testRecord = {
        user_id: this.user1.id,
        occurred_at: new Date().toISOString(),
        quality_rating: 4,
        notes: 'RLS test record'
      }

      const { data: createdRecord, error: createError } = await this.supabase1
        .from('bowel_movements')
        .insert(testRecord)
        .select()
        .single()

      if (createError) {
        this.addResult('SELECT Policy - Record Creation', false, 'Failed to create test record', createError)
        return
      }

      // User 1 should be able to see their record
      const { data: user1Records, error: user1Error } = await this.supabase1
        .from('bowel_movements')
        .select()
        .eq('id', createdRecord.id)

      if (user1Error) {
        this.addResult('SELECT Policy - Own Record', false, 'User 1 cannot select own record', user1Error)
      } else if (user1Records.length === 1) {
        this.addResult('SELECT Policy - Own Record', true, 'User 1 can select own record')
      } else {
        this.addResult('SELECT Policy - Own Record', false, `Expected 1 record, got ${user1Records.length}`)
      }

      // User 2 should NOT be able to see user 1's record
      const { data: user2Records, error: user2Error } = await this.supabase2
        .from('bowel_movements')
        .select()
        .eq('id', createdRecord.id)

      if (user2Error) {
        this.addResult('SELECT Policy - Other User Record', false, 'Error when user 2 tries to select user 1 record', user2Error)
      } else if (user2Records.length === 0) {
        this.addResult('SELECT Policy - Other User Record', true, 'User 2 cannot see user 1 record (correct)')
      } else {
        this.addResult('SELECT Policy - Other User Record', false, `User 2 can see user 1 record (security violation!)`)
      }

      // Clean up
      await this.supabase1.from('bowel_movements').delete().eq('id', createdRecord.id)

    } catch (error) {
      this.addResult('SELECT Policy', false, 'Exception during SELECT policy test', error)
    }
  }

  async testInsertPolicy() {
    console.log('\n➕ Testing INSERT policy...')

    try {
      // User 1 should be able to insert with their own user_id
      const validRecord = {
        user_id: this.user1.id,
        occurred_at: new Date().toISOString(),
        quality_rating: 3,
        notes: 'Valid insert test'
      }

      const { data: validInsert, error: validError } = await this.supabase1
        .from('bowel_movements')
        .insert(validRecord)
        .select()
        .single()

      if (validError) {
        this.addResult('INSERT Policy - Valid Insert', false, 'User cannot insert with own user_id', validError)
      } else {
        this.addResult('INSERT Policy - Valid Insert', true, 'User can insert with own user_id')
        // Clean up
        await this.supabase1.from('bowel_movements').delete().eq('id', validInsert.id)
      }

      // User 1 should NOT be able to insert with user 2's user_id
      const invalidRecord = {
        user_id: this.user2.id, // Wrong user_id
        occurred_at: new Date().toISOString(),
        quality_rating: 3,
        notes: 'Invalid insert test'
      }

      const { data: invalidInsert, error: invalidError } = await this.supabase1
        .from('bowel_movements')
        .insert(invalidRecord)
        .select()
        .single()

      if (invalidError) {
        this.addResult('INSERT Policy - Invalid Insert', true, 'User cannot insert with other user_id (correct)')
      } else {
        this.addResult('INSERT Policy - Invalid Insert', false, 'User can insert with other user_id (security violation!)')
        // Clean up if somehow it succeeded
        if (invalidInsert) {
          await this.supabase1.from('bowel_movements').delete().eq('id', invalidInsert.id)
        }
      }

    } catch (error) {
      this.addResult('INSERT Policy', false, 'Exception during INSERT policy test', error)
    }
  }

  async testUpdatePolicy() {
    console.log('\n✏️ Testing UPDATE policy...')

    try {
      // Create records for both users
      const user1Record = {
        user_id: this.user1.id,
        occurred_at: new Date().toISOString(),
        quality_rating: 2,
        notes: 'User 1 record for update test'
      }

      const user2Record = {
        user_id: this.user2.id,
        occurred_at: new Date().toISOString(),
        quality_rating: 2,
        notes: 'User 2 record for update test'
      }

      const { data: created1, error: create1Error } = await this.supabase1
        .from('bowel_movements')
        .insert(user1Record)
        .select()
        .single()

      const { data: created2, error: create2Error } = await this.supabase2
        .from('bowel_movements')
        .insert(user2Record)
        .select()
        .single()

      if (create1Error || create2Error) {
        this.addResult('UPDATE Policy - Setup', false, 'Failed to create test records', { create1Error, create2Error })
        return
      }

      // User 1 should be able to update their own record
      const { data: updated1, error: update1Error } = await this.supabase1
        .from('bowel_movements')
        .update({ quality_rating: 5, notes: 'Updated by user 1' })
        .eq('id', created1.id)
        .select()

      if (update1Error) {
        this.addResult('UPDATE Policy - Own Record', false, 'User cannot update own record', update1Error)
      } else if (updated1.length === 1) {
        this.addResult('UPDATE Policy - Own Record', true, 'User can update own record')
      } else {
        this.addResult('UPDATE Policy - Own Record', false, `Expected 1 updated record, got ${updated1.length}`)
      }

      // User 1 should NOT be able to update user 2's record
      const { data: updated2, error: update2Error } = await this.supabase1
        .from('bowel_movements')
        .update({ quality_rating: 1, notes: 'Unauthorized update' })
        .eq('id', created2.id)
        .select()

      if (update2Error) {
        this.addResult('UPDATE Policy - Other User Record', false, 'Error when trying to update other user record', update2Error)
      } else if (updated2.length === 0) {
        this.addResult('UPDATE Policy - Other User Record', true, 'User cannot update other user record (correct)')
      } else {
        this.addResult('UPDATE Policy - Other User Record', false, 'User can update other user record (security violation!)')
      }

      // Clean up
      await Promise.all([
        this.supabase1.from('bowel_movements').delete().eq('id', created1.id),
        this.supabase2.from('bowel_movements').delete().eq('id', created2.id)
      ])

    } catch (error) {
      this.addResult('UPDATE Policy', false, 'Exception during UPDATE policy test', error)
    }
  }

  async testDeletePolicy() {
    console.log('\n🗑️ Testing DELETE policy...')

    try {
      // Create records for both users
      const user1Record = {
        user_id: this.user1.id,
        occurred_at: new Date().toISOString(),
        quality_rating: 3,
        notes: 'User 1 record for delete test'
      }

      const user2Record = {
        user_id: this.user2.id,
        occurred_at: new Date().toISOString(),
        quality_rating: 3,
        notes: 'User 2 record for delete test'
      }

      const { data: created1, error: create1Error } = await this.supabase1
        .from('bowel_movements')
        .insert(user1Record)
        .select()
        .single()

      const { data: created2, error: create2Error } = await this.supabase2
        .from('bowel_movements')
        .insert(user2Record)
        .select()
        .single()

      if (create1Error || create2Error) {
        this.addResult('DELETE Policy - Setup', false, 'Failed to create test records', { create1Error, create2Error })
        return
      }

      // User 1 should NOT be able to delete user 2's record
      const { error: delete2Error } = await this.supabase1
        .from('bowel_movements')
        .delete()
        .eq('id', created2.id)

      // Check if user 2's record still exists
      const { data: stillExists, error: checkError } = await this.supabase2
        .from('bowel_movements')
        .select()
        .eq('id', created2.id)

      if (checkError) {
        this.addResult('DELETE Policy - Other User Record', false, 'Error checking if record still exists', checkError)
      } else if (stillExists.length === 1) {
        this.addResult('DELETE Policy - Other User Record', true, 'User cannot delete other user record (correct)')
      } else {
        this.addResult('DELETE Policy - Other User Record', false, 'User can delete other user record (security violation!)')
      }

      // User 1 should be able to delete their own record
      const { error: delete1Error } = await this.supabase1
        .from('bowel_movements')
        .delete()
        .eq('id', created1.id)

      if (delete1Error) {
        this.addResult('DELETE Policy - Own Record', false, 'User cannot delete own record', delete1Error)
        // Clean up manually
        await this.supabase1.from('bowel_movements').delete().eq('id', created1.id)
      } else {
        this.addResult('DELETE Policy - Own Record', true, 'User can delete own record')
      }

      // Clean up user 2's record
      await this.supabase2.from('bowel_movements').delete().eq('id', created2.id)

    } catch (error) {
      this.addResult('DELETE Policy', false, 'Exception during DELETE policy test', error)
    }
  }

  async testAnonymousAccess() {
    console.log('\n👤 Testing anonymous access...')

    try {
      const anonymousClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
      
      // Anonymous user should not be able to select any records
      const { data: anonymousRecords, error: anonymousError } = await anonymousClient
        .from('bowel_movements')
        .select()
        .limit(1)

      if (anonymousError) {
        this.addResult('Anonymous Access - SELECT', true, 'Anonymous user cannot select records (correct)')
      } else if (anonymousRecords.length === 0) {
        this.addResult('Anonymous Access - SELECT', true, 'Anonymous user sees no records (correct)')
      } else {
        this.addResult('Anonymous Access - SELECT', false, 'Anonymous user can see records (security violation!)')
      }

      // Anonymous user should not be able to insert records
      const { data: anonymousInsert, error: insertError } = await anonymousClient
        .from('bowel_movements')
        .insert({
          user_id: 'fake-user-id',
          occurred_at: new Date().toISOString(),
          quality_rating: 4,
          notes: 'Anonymous insert attempt'
        })
        .select()

      if (insertError) {
        this.addResult('Anonymous Access - INSERT', true, 'Anonymous user cannot insert records (correct)')
      } else {
        this.addResult('Anonymous Access - INSERT', false, 'Anonymous user can insert records (security violation!)')
        // Clean up if somehow it succeeded
        if (anonymousInsert && anonymousInsert.length > 0) {
          await anonymousClient.from('bowel_movements').delete().eq('id', anonymousInsert[0].id)
        }
      }

    } catch (error) {
      this.addResult('Anonymous Access', false, 'Exception during anonymous access test', error)
    }
  }

  async runAllTests() {
    console.log('🚀 Starting RLS Policy Validation...')
    console.log('=====================================')

    const setupSuccess = await this.setupTestUsers()
    if (!setupSuccess) {
      console.log('\n❌ Cannot proceed without test users')
      return this.generateReport()
    }

    await this.testSelectPolicy()
    await this.testInsertPolicy()
    await this.testUpdatePolicy()
    await this.testDeletePolicy()
    await this.testAnonymousAccess()

    return this.generateReport()
  }

  generateReport() {
    console.log('\n📊 RLS Validation Report')
    console.log('========================')

    const passed = this.results.filter(r => r.passed).length
    const failed = this.results.filter(r => !r.passed).length
    const total = this.results.length

    console.log(`Total Tests: ${total}`)
    console.log(`Passed: ${passed}`)
    console.log(`Failed: ${failed}`)
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`)

    if (failed > 0) {
      console.log('\n❌ Failed Tests:')
      this.results.filter(r => !r.passed).forEach(result => {
        console.log(`  - ${result.test}: ${result.message}`)
      })
    }

    const allPassed = failed === 0
    console.log(`\n${allPassed ? '✅ All RLS policies are working correctly!' : '❌ Some RLS policies need attention!'}`)

    return {
      success: allPassed,
      results: this.results,
      summary: { total, passed, failed }
    }
  }
}

// Run the validation if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new RLSValidator()
  validator.runAllTests().then(report => {
    process.exit(report.success ? 0 : 1)
  }).catch(error => {
    console.error('❌ Validation script failed:', error)
    process.exit(1)
  })
}

export { RLSValidator }