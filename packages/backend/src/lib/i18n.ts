import type { Request } from 'express';

export type SupportedLocale = 'zh-CN' | 'en-US';

const messages = {
  'en-US': {
    'common.notFound': 'Resource not found',
    'common.internal': 'An unexpected error occurred',
    'auth.unauthorized': 'Authentication required',
    'auth.invalidToken': 'Invalid or expired token',
    'auth.invalidCredentials': 'Invalid email, password, or tenant',
    'auth.accountLocked': 'Account is temporarily locked',
    'auth.registerConflict': 'Tenant slug already exists',
    'auth.otpRequired': 'One-time code required',
    'auth.otpInvalid': 'One-time code is invalid',
    'auth.otpNotSetup': 'TOTP has not been configured',
    'auth.currentPasswordRequired': 'Current password is required',
    'auth.invalidPassword': 'Current password is incorrect',
    'tenant.notFound': 'Tenant not found',
    'user.notFound': 'User not found',
    'user.exists': 'User already exists in this tenant',
    'user.cannotDeactivateSelf': 'Cannot deactivate yourself',
    'permission.forbidden': 'You do not have permission to perform this action',
    'agent.notFound': 'Agent is not registered',
    'agent.timeout': 'Agent execution timed out',
    'agent.rateLimited': 'Agent call rate limit exceeded',
    'validation.failed': 'Request validation failed'
  },
  'zh-CN': {
    'common.notFound': '资源不存在',
    'common.internal': '发生了未预期的错误',
    'auth.unauthorized': '需要先完成身份认证',
    'auth.invalidToken': '令牌无效或已过期',
    'auth.invalidCredentials': '租户、邮箱或密码不正确',
    'auth.accountLocked': '账户已被临时锁定',
    'auth.registerConflict': '租户标识已存在',
    'auth.otpRequired': '需要提供一次性验证码',
    'auth.otpInvalid': '一次性验证码不正确',
    'auth.otpNotSetup': '尚未完成 TOTP 配置',
    'auth.currentPasswordRequired': '修改密码时必须提供当前密码',
    'auth.invalidPassword': '当前密码不正确',
    'tenant.notFound': '租户不存在',
    'user.notFound': '用户不存在',
    'user.exists': '当前租户内已存在该用户',
    'user.cannotDeactivateSelf': '不能停用当前登录用户自己',
    'permission.forbidden': '你没有执行该操作的权限',
    'agent.notFound': 'Agent 未注册',
    'agent.timeout': 'Agent 执行超时',
    'agent.rateLimited': 'Agent 调用频率过高',
    'validation.failed': '请求校验失败'
  }
} as const;

export function resolveLocale(req: Request): SupportedLocale {
  const raw = req.headers['accept-language'];
  if (typeof raw === 'string') {
    if (raw.toLowerCase().includes('zh')) {
      return 'zh-CN';
    }
  }

  const queryLocale = req.query.locale;
  if (queryLocale === 'en-US' || queryLocale === 'zh-CN') {
    return queryLocale;
  }

  return 'en-US';
}

export function t(req: Request, key: keyof (typeof messages)['en-US']): string {
  const locale = req.locale ?? resolveLocale(req);
  return messages[locale][key] ?? messages['en-US'][key] ?? key;
}
