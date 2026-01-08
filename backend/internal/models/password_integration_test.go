package models_test

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/Lagranmoon/pooplet/internal/models"
)

// TestPasswordValidationRequirements verifies that password validation
// is properly enforced with all required complexity rules
func TestPasswordValidationRequirements(t *testing.T) {
	tests := []struct {
		name        string
		password    string
		shouldPass  bool
		description string
	}{
		// Valid passwords
		{
			name:        "valid_10_chars_with_all_requirements",
			password:    "Abc1234567",
			shouldPass:  true,
			description: "10 chars with upper, lower, and digit",
		},
		{
			name:        "valid_longer_password",
			password:    "MySecure123",
			shouldPass:  true,
			description: "Longer password with all requirements",
		},
		{
			name:        "valid_with_special_chars",
			password:    "Abc123!@#$%",
			shouldPass:  true,
			description: "Password with special characters",
		},

		// Invalid passwords - length issues
		{
			name:        "invalid_only_9_chars",
			password:    "Abc123456",
			shouldPass:  false,
			description: "9 characters - too short",
		},
		{
			name:        "invalid_very_short",
			password:    "Abc123",
			shouldPass:  false,
			description: "6 characters - way too short",
		},
		{
			name:        "invalid_empty",
			password:    "",
			shouldPass:  false,
			description: "Empty password",
		},

		// Invalid passwords - missing uppercase
		{
			name:        "invalid_no_uppercase",
			password:    "abcdef1234",
			shouldPass:  false,
			description: "No uppercase letter",
		},
		{
			name:        "invalid_no_uppercase_10_chars",
			password:    "abcdefgh12",
			shouldPass:  false,
			description: "10 chars but no uppercase",
		},

		// Invalid passwords - missing lowercase
		{
			name:        "invalid_no_lowercase",
			password:    "ABCDEF1234",
			shouldPass:  false,
			description: "No lowercase letter",
		},
		{
			name:        "invalid_no_lowercase_10_chars",
			password:    "ABCDEFGH12",
			shouldPass:  false,
			description: "10 chars but no lowercase",
		},

		// Invalid passwords - missing digit
		{
			name:        "invalid_no_digit",
			password:    "Abcdefghij",
			shouldPass:  false,
			description: "No digit",
		},
		{
			name:        "invalid_only_letters",
			password:    "AbcDEFGhij",
			shouldPass:  false,
			description: "Only letters, no digits",
		},

		// Edge cases
		{
			name:        "invalid_digits_only",
			password:    "1234567890",
			shouldPass:  false,
			description: "Only digits",
		},
		{
			name:        "invalid_uppercase_only",
			password:    "ABCDEFGHIJ",
			shouldPass:  false,
			description: "Only uppercase letters",
		},
		{
			name:        "invalid_lowercase_only",
			password:    "abcdefghij",
			shouldPass:  false,
			description: "Only lowercase letters",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := models.ValidatePassword(tt.password)

			if tt.shouldPass {
				assert.NoError(t, err, "Password should be valid: %s (%s)", tt.password, tt.description)
			} else {
				assert.Error(t, err, "Password should be invalid: %s (%s)", tt.password, tt.description)
			}
		})
	}
}

// TestPasswordValidationEdgeCases tests specific edge cases
func TestPasswordValidationEdgeCases(t *testing.T) {
	tests := []struct {
		name     string
		password string
		checkErr string
	}{
		{
			name:     "exactly_10_chars_all_requirements",
			password: "A1b2c3d4e5",
			checkErr: "",
		},
		{
			name:     "starts_with_digit",
			password: "1Abcdefghij",
			checkErr: "",
		},
		{
			name:     "ends_with_digit",
			password: "Abcdefghij1",
			checkErr: "",
		},
		{
			name:     "multiple_digits",
			password: "Abc123def456",
			checkErr: "",
		},
		{
			name:     "special_chars_valid",
			password: "Abc123!@#$%",
			checkErr: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := models.ValidatePassword(tt.password)

			if tt.checkErr == "" {
				assert.NoError(t, err, "Password should be valid")
			} else {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.checkErr)
			}
		})
	}
}
