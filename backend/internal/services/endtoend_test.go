package services_test

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/Lagranmoon/pooplet/internal/models"
)

// TestValidatePasswordFunction tests the actual password validation function
// that is used by Register and CreateUser services
func TestValidatePasswordFunction(t *testing.T) {
	// These tests verify the actual function that gets called in the service layer

	// Test 1: Valid password
	err := models.ValidatePassword("Abc1234567")
	assert.NoError(t, err, "Valid password should pass")

	// Test 2: Too short
	err = models.ValidatePassword("Short1")
	assert.Error(t, err, "Short password should fail")
	assert.Contains(t, err.Error(), "10 characters")

	// Test 3: Missing uppercase
	err = models.ValidatePassword("abcdef1234")
	assert.Error(t, err, "Password without uppercase should fail")
	assert.Contains(t, err.Error(), "uppercase")

	// Test 4: Missing lowercase
	err = models.ValidatePassword("ABCD123456")
	assert.Error(t, err, "Password without lowercase should fail")
	assert.Contains(t, err.Error(), "lowercase")

	// Test 5: Missing digit
	err = models.ValidatePassword("Abcdefghij")
	assert.Error(t, err, "Password without digit should fail")
	assert.Contains(t, err.Error(), "digit")

	// Test 6: Exactly 10 characters (minimum)
	err = models.ValidatePassword("Abc1234567")
	assert.NoError(t, err, "10 character password with all requirements should pass")

	// Test 7: Only 9 characters (just below minimum)
	err = models.ValidatePassword("Abc123456")
	assert.Error(t, err, "9 character password should fail")
}
