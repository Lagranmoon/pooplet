# RLS (Row Level Security) Testing

This directory contains comprehensive tests for validating the Row Level Security policies implemented in the Supabase database.

## Test Files

### 1. `rls-policies.test.ts`
Property-based tests that verify RLS policy logic using mock data. These tests run quickly and don't require a live database connection.

**Features:**
- Property-based testing with fast-check
- Tests all CRUD operations (SELECT, INSERT, UPDATE, DELETE)
- Validates data isolation between users
- Tests anonymous user access restrictions

### 2. `rls-integration.test.ts`
Integration tests that validate RLS policies against a real Supabase instance.

**Features:**
- Tests against live Supabase database
- Requires test user accounts
- Validates actual RLS policy enforcement
- Property-based testing with real data

### 3. `rls-validation-script.ts`
Standalone validation script for manual testing and CI/CD pipelines.

**Features:**
- Can be run independently
- Provides detailed reporting
- Suitable for automated testing
- Manual validation capabilities

## Setup

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Test User Accounts (for integration tests)
TEST_USER_1_EMAIL=test1@example.com
TEST_USER_1_PASSWORD=testpassword123
TEST_USER_2_EMAIL=test2@example.com
TEST_USER_2_PASSWORD=testpassword123
```

### Test User Setup

For integration tests, you need to create test user accounts in your Supabase project:

1. Go to your Supabase dashboard
2. Navigate to Authentication > Users
3. Create two test users with the emails specified in your environment variables
4. Ensure both users are confirmed and active

## Running Tests

### Unit Tests (Mock-based)
```bash
# Run all RLS unit tests
npm test rls-policies

# Run with coverage
npm test rls-policies -- --coverage
```

### Integration Tests
```bash
# Run integration tests (requires live database)
npm test rls-integration

# Run integration tests with specific environment
TEST_USER_1_EMAIL=test1@example.com npm test rls-integration
```

### Validation Script
```bash
# Run standalone validation
npx tsx src/test/rls-validation-script.ts

# Run with specific environment
VITE_SUPABASE_URL=your_url npx tsx src/test/rls-validation-script.ts
```

### All Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch
```

## Test Coverage

The RLS tests cover the following security requirements:

### SELECT Policy
- ✅ Users can only view their own records
- ✅ Users cannot view other users' records
- ✅ Anonymous users cannot view any records

### INSERT Policy
- ✅ Users can create records with their own user_id
- ✅ Users cannot create records with other user_ids
- ✅ Anonymous users cannot create records

### UPDATE Policy
- ✅ Users can update their own records
- ✅ Users cannot update other users' records
- ✅ Anonymous users cannot update any records

### DELETE Policy
- ✅ Users can delete their own records
- ✅ Users cannot delete other users' records
- ✅ Anonymous users cannot delete any records

### Data Isolation
- ✅ Complete data isolation between users
- ✅ No cross-user data leakage
- ✅ Proper authentication enforcement

## Property-Based Testing

The tests use property-based testing with fast-check to validate RLS policies across a wide range of inputs:

- **Record Data**: Random dates, quality ratings (1-7), and notes
- **User Scenarios**: Multiple users with different permissions
- **Edge Cases**: Empty data, boundary values, invalid inputs
- **Bulk Operations**: Multiple records, batch operations

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Ensure test user accounts exist in Supabase
   - Verify email/password combinations
   - Check that users are confirmed

2. **Environment Variables**
   - Verify all required environment variables are set
   - Check that Supabase URL and keys are correct
   - Ensure .env.local is properly loaded

3. **RLS Policy Errors**
   - Verify RLS is enabled on the bowel_movements table
   - Check that all policies are created correctly
   - Ensure policies use `auth.uid()` function

4. **Network Issues**
   - Check internet connection
   - Verify Supabase project is accessible
   - Check for firewall or proxy issues

### Debugging

Enable debug logging:

```bash
DEBUG=true npm test rls-integration
```

Run tests with verbose output:

```bash
npm test -- --verbose
```

## CI/CD Integration

The validation script can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions step
- name: Validate RLS Policies
  run: |
    npm install
    npx tsx src/test/rls-validation-script.ts
  env:
    VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
    TEST_USER_1_EMAIL: ${{ secrets.TEST_USER_1_EMAIL }}
    TEST_USER_1_PASSWORD: ${{ secrets.TEST_USER_1_PASSWORD }}
    TEST_USER_2_EMAIL: ${{ secrets.TEST_USER_2_EMAIL }}
    TEST_USER_2_PASSWORD: ${{ secrets.TEST_USER_2_PASSWORD }}
```

## Security Considerations

- Test user accounts should only be used for testing
- Use separate Supabase projects for testing and production
- Regularly rotate test user passwords
- Monitor test database for unauthorized access
- Clean up test data after test runs

## Contributing

When adding new RLS tests:

1. Follow the existing test structure
2. Use property-based testing where appropriate
3. Include both positive and negative test cases
4. Add proper error handling and cleanup
5. Update this README with new test descriptions