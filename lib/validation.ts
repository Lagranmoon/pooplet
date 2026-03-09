/**
 * 共享验证模块 - 前后端共用
 * 提供用户输入验证函数和常量
 */

// 用户名验证正则：字母、数字、下划线、中文
export const USERNAME_PATTERN = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;

// 验证规则常量
export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: USERNAME_PATTERN,
    PATTERN_MESSAGE: '用户名只能包含字母、数字、下划线和中文',
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 128,
  },
} as const;

// 用户名验证结果类型
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * 验证用户名
 * @param username 用户名
 * @returns 验证结果
 */
export function validateUsername(username: string): ValidationResult {
  const trimmed = username.trim();

  if (!trimmed) {
    return { valid: false, error: '用户名不能为空' };
  }

  if (trimmed.length < VALIDATION_RULES.USERNAME.MIN_LENGTH) {
    return {
      valid: false,
      error: `用户名长度至少 ${VALIDATION_RULES.USERNAME.MIN_LENGTH} 个字符`,
    };
  }

  if (trimmed.length > VALIDATION_RULES.USERNAME.MAX_LENGTH) {
    return {
      valid: false,
      error: `用户名长度不能超过 ${VALIDATION_RULES.USERNAME.MAX_LENGTH} 个字符`,
    };
  }

  if (!VALIDATION_RULES.USERNAME.PATTERN.test(trimmed)) {
    return {
      valid: false,
      error: VALIDATION_RULES.USERNAME.PATTERN_MESSAGE,
    };
  }

  return { valid: true };
}

/**
 * 验证密码
 * @param password 密码
 * @returns 验证结果
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { valid: false, error: '密码不能为空' };
  }

  if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
    return {
      valid: false,
      error: `密码长度至少 ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} 个字符`,
    };
  }

  if (password.length > VALIDATION_RULES.PASSWORD.MAX_LENGTH) {
    return {
      valid: false,
      error: `密码长度不能超过 ${VALIDATION_RULES.PASSWORD.MAX_LENGTH} 个字符`,
    };
  }

  return { valid: true };
}

/**
 * 验证密码确认
 * @param password 密码
 * @param confirmPassword 确认密码
 * @returns 验证结果
 */
export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): ValidationResult {
  if (!confirmPassword) {
    return { valid: false, error: '请确认密码' };
  }

  if (password !== confirmPassword) {
    return { valid: false, error: '两次输入的密码不一致' };
  }

  return { valid: true };
}

/**
 * 验证注册请求体
 * @param body 请求体
 * @returns 验证结果
 */
export function validateRegisterBody(body: {
  username?: string;
  password?: string;
  confirmPassword?: string;
}): ValidationResult {
  const { username, password, confirmPassword } = body;

  // 检查必填字段
  if (!username || !password || !confirmPassword) {
    return { valid: false, error: '用户名、密码和确认密码不能为空' };
  }

  // 验证用户名
  const usernameResult = validateUsername(username);
  if (!usernameResult.valid) {
    return usernameResult;
  }

  // 验证密码
  const passwordResult = validatePassword(password);
  if (!passwordResult.valid) {
    return passwordResult;
  }

  // 验证密码确认
  const matchResult = validatePasswordMatch(password, confirmPassword);
  if (!matchResult.valid) {
    return matchResult;
  }

  return { valid: true };
}

/**
 * 验证登录请求体
 * @param body 请求体
 * @returns 验证结果
 */
export function validateLoginBody(body: {
  username?: string;
  password?: string;
}): ValidationResult {
  const { username, password } = body;

  if (!username || !password) {
    return { valid: false, error: '用户名和密码不能为空' };
  }

  return { valid: true };
}
