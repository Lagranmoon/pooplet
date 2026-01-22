/**
 * RLS Integration Tests
 * 
 * These tests verify RLS policies against a real Supabase instance.
 * They require proper environment variables and test user accounts.
 * 
 * To run these tests:
 * 1. Set up a test Supabase project
 * 2. Configure test environment variables
 * 3. Create test user accounts
 * 4. Run: npm run test -- rls-integration
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import fc from 'fast-check'
import { createClient, SupabaseClient, User } from '@supabase/supabase-js'
import { Database, BowelMovementRecord, CreateRecordRequest } from '../types/database'

// Test configuration - only run if environment is properly configured
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
const TEST_USER_1_EMAIL = process.env.TEST_USER_1_EMAIL
const TEST_USER_1_PASSWORD = process.env.TEST_USER_1_PASSWORD
const TEST_USER_2_EMAIL = process.env.TEST_USER_2_EMAIL
const TEST_USER_2_PASSWORD = process.env.TEST_USER_2_PASSWORD

const isIntegrationTestEnabled = SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  TEST_USER_1_EMAIL && 
  TEST_USER_1_PASSWORD && 
  TEST_USER_2_EMAIL && 
  TEST_USER_2_PASSWORD

// Skip integration tests if not properly configured
const describeIf = (condition: boolean) => condition ? describe : describe.skip

describeIf(isIntegrationTestEnabled)('RLS Integration Tests', () => {
  let supabaseUser1: SupabaseClient<Database>
  let supabaseUser2: SupabaseClient<Database>
  let user1: User
  let user2: User
  let testRecordIds: string[] = []

  beforeAll(async () => {
    if (!isIntegrationTestEnabled) return

    // Create clients for both test users
    supabaseUser1 = createClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!)
    supabaseUser2 = createClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!)

    // Authenticate test users
    const { data: user1Data, error: user1Error } = await supabaseUser1.auth.signInWithPassword({
      email: TEST_USER_1_EMAIL!,
      password: TEST_USER_1_PASSWORD!
    })

    const { data: user2Data, error: user2Error } = await supabaseUser2.auth.signInWithPassword({
      email: TEST_USER_2_EMAIL!,
      password: TEST_USER_2_PASSWORD!
    })

    if (user1Error || user2Error || !user1Data.user || !user2Data.user) {
      throw new Error('Failed to authenticate test users')
    }

    user1 = user1Data.user
    user2 = user2Data.user
  })

  afterAll(async () => {
    if (!isIntegrationTestEnabled) return

    // Clean up test records
    if (testRecordIds.length > 0) {
      await Promise.all([
        supabaseUser1.from('bowel_movements').delete().in('id', testRecordIds),
        supabaseUser2.from('bowel_movements').delete().in('id', testRecordIds)
      ])
    }

    // Sign out users
    await Promise.all([
      supabaseUser1.auth.signOut(),
      supabaseUser2.auth.signOut()
    ])
  })

  beforeEach(() => {
    testRecordIds = []
  })

  afterEach(async () => {
    // Clean up records created in this test
    if (testRecordIds.length > 0) {
      await Promise.all([
        supabaseUser1.from('bowel_movements').delete().in('id', testRecordIds),
        supabaseUser2.from('bowel_movements').delete().in('id', testRecordIds)
      ])
      testRecordIds = []
    }
  })

  describe('SELECT Policy Integration', () => {
    it('**Validates: Requirements 2.1, 2.2** - users can only select their own records', async () => {
      // Create a record for user 1
      const recordData: CreateRecordRequest = {
        occurred_at: new Date().toISOString(),
        quality_rating: 4,
        notes: 'Test record for user 1'
      }

      const { data: createdRecord, error: createError } = await supabaseUser1
        .from('bowel_movements')
        .insert({
          user_id: user1.id,
          occurred_at: recordData.occurred_at,
          quality_rating: recordData.quality_rating,
          notes: recordData.notes
        })
        .select()
        .single()

      expect(createError).toBeNull()
      expect(createdRecord).toBeTruthy()
      if (createdRecord) {
        testRecordIds.push(createdRecord.id)
      }

      // User 1 should be able to see their record
      const { data: user1Records, error: user1Error } = await supabaseUser1
        .from('bowel_movements')
        .select()
        .eq('id', createdRecord!.id)

      expect(user1Error).toBeNull()
      expect(user1Records).toHaveLength(1)
      expect(user1Records![0].user_id).toBe(user1.id)

      // User 2 should NOT be able to see user 1's record
      const { data: user2Records, error: user2Error } = await supabaseUser2
        .from('bowel_movements')
        .select()
        .eq('id', createdRecord!.id)

      expect(user2Error).toBeNull()
      expect(user2Records).toHaveLength(0)
    })
  })

  describe('INSERT Policy Integration', () => {
    it('**Validates: Requirements 2.1, 2.2** - users can only insert records with their own user_id', async () => {
      const recordData: CreateRecordRequest = {
        occurred_at: new Date().toISOString(),
        quality_rating: 3,
        notes: 'Valid insert test'
      }

      // User 1 should be able to create a record with their own user_id
      const { data: validInsert, error: validError } = await supabaseUser1
        .from('bowel_movements')
        .insert({
          user_id: user1.id,
          occurred_at: recordData.occurred_at,
          quality_rating: recordData.quality_rating,
          notes: recordData.notes
        })
        .select()
        .single()

      expect(validError).toBeNull()
      expect(validInsert).toBeTruthy()
      expect(validInsert!.user_id).toBe(user1.id)
      if (validInsert) {
        testRecordIds.push(validInsert.id)
      }

      // User 1 should NOT be able to create a record with user 2's user_id
      const { data: invalidInsert, error: invalidError } = await supabaseUser1
        .from('bowel_movements')
        .insert({
          user_id: user2.id, // Wrong user_id
          occurred_at: recordData.occurred_at,
          quality_rating: recordData.quality_rating,
          notes: 'Invalid insert attempt'
        })
        .select()
        .single()

      expect(invalidError).toBeTruthy()
      expect(invalidInsert).toBeNull()
    })
  })

  describe('UPDATE Policy Integration', () => {
    it('**Validates: Requirements 2.1, 2.2** - users can only update their own records', async () => {
      // Create a record for user 1
      const { data: user1Record, error: createError } = await supabaseUser1
        .from('bowel_movements')
        .insert({
          user_id: user1.id,
          occurred_at: new Date().toISOString(),
          quality_rating: 2,
          notes: 'Original note'
        })
        .select()
        .single()

      expect(createError).toBeNull()
      expect(user1Record).toBeTruthy()
      if (user1Record) {
        testRecordIds.push(user1Record.id)
      }

      // User 1 should be able to update their own record
      const { data: updatedRecord, error: updateError } = await supabaseUser1
        .from('bowel_movements')
        .update({
          quality_rating: 5,
          notes: 'Updated note'
        })
        .eq('id', user1Record!.id)
        .select()
        .single()

      expect(updateError).toBeNull()
      expect(updatedRecord).toBeTruthy()
      expect(updatedRecord!.quality_rating).toBe(5)
      expect(updatedRecord!.notes).toBe('Updated note')

      // User 2 should NOT be able to update user 1's record
      const { data: unauthorizedUpdate, error: unauthorizedError } = await supabaseUser2
        .from('bowel_movements')
        .update({
          quality_rating: 1,
          notes: 'Unauthorized update'
        })
        .eq('id', user1Record!.id)
        .select()

      expect(unauthorizedUpdate).toHaveLength(0) // No rows affected
    })
  })

  describe('DELETE Policy Integration', () => {
    it('**Validates: Requirements 2.1, 2.2** - users can only delete their own records', async () => {
      // Create records for both users
      const { data: user1Record, error: create1Error } = await supabaseUser1
        .from('bowel_movements')
        .insert({
          user_id: user1.id,
          occurred_at: new Date().toISOString(),
          quality_rating: 3,
          notes: 'User 1 record'
        })
        .select()
        .single()

      const { data: user2Record, error: create2Error } = await supabaseUser2
        .from('bowel_movements')
        .insert({
          user_id: user2.id,
          occurred_at: new Date().toISOString(),
          quality_rating: 4,
          notes: 'User 2 record'
        })
        .select()
        .single()

      expect(create1Error).toBeNull()
      expect(create2Error).toBeNull()
      expect(user1Record).toBeTruthy()
      expect(user2Record).toBeTruthy()

      if (user1Record) testRecordIds.push(user1Record.id)
      if (user2Record) testRecordIds.push(user2Record.id)

      // User 1 should be able to delete their own record
      const { error: delete1Error } = await supabaseUser1
        .from('bowel_movements')
        .delete()
        .eq('id', user1Record!.id)

      expect(delete1Error).toBeNull()

      // User 1 should NOT be able to delete user 2's record
      const { error: delete2Error } = await supabaseUser1
        .from('bowel_movements')
        .delete()
        .eq('id', user2Record!.id)

      // The delete should not affect any rows (RLS blocks it)
      // Verify user 2's record still exists
      const { data: stillExists, error: checkError } = await supabaseUser2
        .from('bowel_movements')
        .select()
        .eq('id', user2Record!.id)

      expect(checkError).toBeNull()
      expect(stillExists).toHaveLength(1)
    })
  })

  describe('Property-Based RLS Tests', () => {
    it('**Validates: Requirements 2.1, 2.2** - data isolation holds for any valid record data', async () => {
      await fc.assert(fc.asyncProperty(
        fc.array(fc.record({
          occurred_at: fc.date({ min: new Date('2020-01-01'), max: new Date() }).map(d => d.toISOString()),
          quality_rating: fc.integer({ min: 1, max: 7 }),
          notes: fc.option(fc.string({ maxLength: 100 }), { nil: null })
        }), { minLength: 1, maxLength: 5 }),
        async (recordsData) => {
          const createdRecords: string[] = []

          try {
            // Create records for both users
            for (const recordData of recordsData) {
              // User 1 creates a record
              const { data: user1Record, error: user1Error } = await supabaseUser1
                .from('bowel_movements')
                .insert({
                  user_id: user1.id,
                  occurred_at: recordData.occurred_at,
                  quality_rating: recordData.quality_rating,
                  notes: recordData.notes
                })
                .select()
                .single()

              expect(user1Error).toBeNull()
              if (user1Record) {
                createdRecords.push(user1Record.id)
              }

              // User 2 creates a record
              const { data: user2Record, error: user2Error } = await supabaseUser2
                .from('bowel_movements')
                .insert({
                  user_id: user2.id,
                  occurred_at: recordData.occurred_at,
                  quality_rating: recordData.quality_rating,
                  notes: recordData.notes
                })
                .select()
                .single()

              expect(user2Error).toBeNull()
              if (user2Record) {
                createdRecords.push(user2Record.id)
              }
            }

            // Verify isolation: each user should only see their own records
            const { data: user1Records, error: user1QueryError } = await supabaseUser1
              .from('bowel_movements')
              .select()
              .in('id', createdRecords)

            const { data: user2Records, error: user2QueryError } = await supabaseUser2
              .from('bowel_movements')
              .select()
              .in('id', createdRecords)

            expect(user1QueryError).toBeNull()
            expect(user2QueryError).toBeNull()

            // Each user should see exactly their own records
            expect(user1Records!.every(record => record.user_id === user1.id)).toBe(true)
            expect(user2Records!.every(record => record.user_id === user2.id)).toBe(true)

            // Total records should equal what we created
            expect(user1Records!.length + user2Records!.length).toBe(recordsData.length * 2)

          } finally {
            // Clean up
            testRecordIds.push(...createdRecords)
          }
        }
      ), { numRuns: 10 }) // Reduced runs for integration tests
    })
  })
})