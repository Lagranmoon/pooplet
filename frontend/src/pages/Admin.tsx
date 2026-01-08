import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/contexts/ToastContext';
import { api, type UserListResponse, type UserRole } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Shield, Users, Settings, Loader2, UserPlus, Trash2, Globe, Lock } from 'lucide-react';

type Tab = 'users' | 'settings';

// 系统配置项类型定义
interface ConfigItem {
  key: string;
  label: string;
  description: string;
  type: 'boolean';
  value: boolean;
  category: 'general' | 'security';
  icon: React.ReactNode;
}

export function AdminPage() {
  const { isAdmin } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserListResponse[]>([]);
  const [saving, setSaving] = useState<string | null>(null);

  // 系统配置项
  const [configs, setConfigs] = useState<ConfigItem[]>([]);

  // 添加用户相关状态
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as UserRole,
  });

  // 删除用户确认相关状态
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    userId: '',
    userName: '',
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      const usersData = await api.getAllUsers();

      // 定义所有配置项
      const allConfigs: ConfigItem[] = [
        {
          key: 'registration_enabled',
          label: '开放注册',
          description: '允许新用户通过注册页面创建账号',
          type: 'boolean',
          value: true,
          category: 'general',
          icon: <UserPlus className="h-5 w-5" />,
        },
      ];

      // 加载所有配置项
      const updatedConfigs = await Promise.all(
        allConfigs.map(async (config) => {
          try {
            const result = await api.getSystemConfig(config.key);
            return { ...config, value: result.value === 'true' };
          } catch (error) {
            console.error(`Failed to load config ${config.key}:`, error);
            return config; // 保持默认值
          }
        })
      );

      setUsers(usersData);
      setConfigs(updatedConfigs);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    const user = users.find((u) => u.id === userId);

    // 防止最后一个管理员被降级为普通用户
    if (user?.role === 'admin' && newRole === 'user') {
      const adminCount = users.filter(u => u.role === 'admin').length;
      if (adminCount <= 1) {
        showError('系统至少需要保留一个管理员账号');
        return;
      }
    }

    try {
      await api.updateUserRole(userId, newRole);
      await loadData();
      showSuccess('用户角色更新成功');
    } catch (error) {
      console.error('Failed to update user role:', error);
      showError('更新用户角色失败');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    // 防止最后一个管理员被删除
    if (user.role === 'admin') {
      const adminCount = users.filter(u => u.role === 'admin').length;
      if (adminCount <= 1) {
        showError('系统至少需要保留一个管理员账号');
        return;
      }
    }

    // 打开确认对话框
    setDeleteDialog({
      isOpen: true,
      userId: userId,
      userName: user.name,
    });
  };

  const confirmDeleteUser = async () => {
    setDeleteLoading(true);
    try {
      await api.deleteUser(deleteDialog.userId);
      setDeleteDialog({ isOpen: false, userId: '', userName: '' });
      await loadData();
      showSuccess('用户删除成功');
    } catch (error) {
      console.error('Failed to delete user:', error);
      showError('删除用户失败');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleConfig = async (configKey: string, newValue: boolean) => {
    setSaving(configKey);
    try {
      await api.setSystemConfig(configKey, newValue ? 'true' : 'false');
      setConfigs(configs.map(c =>
        c.key === configKey ? { ...c, value: newValue } : c
      ));
      showSuccess('设置更新成功');
    } catch (error) {
      console.error('Failed to update config:', error);
      showError('更新设置失败');
    } finally {
      setSaving(null);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      showWarning('请填写所有必填字段');
      return;
    }

    setAddUserLoading(true);
    try {
      await api.createUser(newUser);
      setShowAddUserDialog(false);
      setNewUser({ name: '', email: '', password: '', role: 'user' });
      await loadData();
      showSuccess('用户创建成功');
    } catch (error) {
      console.error('Failed to create user:', error);
      showError(error instanceof Error ? error.message : '创建用户失败');
    } finally {
      setAddUserLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">需要管理员权限</h2>
            <p className="text-gray-500">您没有访问此页面的权限</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Shield className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold text-gray-800">管理中心</h2>
        </div>
        <p className="text-gray-500">管理用户和系统设置</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
            activeTab === 'users'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="h-5 w-5" />
          用户管理
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
            activeTab === 'settings'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Settings className="h-5 w-5" />
          系统设置
        </button>
      </div>

      {loading ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-500">加载中...</p>
          </CardContent>
        </Card>
      ) : activeTab === 'users' ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">用户列表</h3>
              <Button
                onClick={() => setShowAddUserDialog(true)}
                className="bg-[#22c55e] text-white hover:bg-[#16a34a]"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                添加用户
              </Button>
            </div>
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">👤</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {user.role === 'admin' ? '管理员' : '用户'}
                      </span>
                    </div>
                    {user.role !== 'admin' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateRole(user.id, 'admin')}
                        className="text-xs"
                      >
                        设为管理员
                      </Button>
                    )}
                    {user.role === 'admin' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateRole(user.id, 'user')}
                        className="text-xs"
                      >
                        设为用户
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteUser(user.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* 系统通用设置 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-800">系统通用设置</h3>
            </div>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4 space-y-3">
                {configs
                  .filter(c => c.category === 'general')
                  .map((config) => (
                    <div
                      key={config.key}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          {config.icon}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{config.label}</p>
                          <p className="text-sm text-gray-500">{config.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleConfig(config.key, !config.value)}
                        disabled={saving === config.key}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          config.value ? 'bg-[#22c55e]' : 'bg-gray-300'
                        }`}
                      >
                        {saving === config.key ? (
                          <Loader2 className="h-4 w-4 animate-spin text-white absolute left-1" />
                        ) : (
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              config.value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        )}
                      </button>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>

          {/* 安全设置 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-800">安全设置</h3>
            </div>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                {configs.filter(c => c.category === 'security').length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    暂无安全设置项
                  </div>
                ) : (
                  <div className="space-y-3">
                    {configs
                      .filter(c => c.category === 'security')
                      .map((config) => (
                        <div
                          key={config.key}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              {config.icon}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{config.label}</p>
                              <p className="text-sm text-gray-500">{config.description}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleConfig(config.key, !config.value)}
                            disabled={saving === config.key}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              config.value ? 'bg-[#22c55e]' : 'bg-gray-300'
                            }`}
                          >
                            {saving === config.key ? (
                              <Loader2 className="h-4 w-4 animate-spin text-white absolute left-1" />
                            ) : (
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  config.value ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            )}
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 系统状态提示 */}
          <Card className="border-0 shadow-md bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Settings className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800 mb-1">系统说明</p>
                  <p className="text-sm text-gray-600">
                    修改系统设置后会立即生效。关闭注册功能后，新用户只能通过管理员添加账号。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 添加用户对话框 */}
      {showAddUserDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">添加用户</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="请输入姓名"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    邮箱 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    密码 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="至少6位字符"
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    角色 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="user">普通用户</option>
                    <option value="admin">管理员</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => {
                    setShowAddUserDialog(false);
                    setNewUser({ name: '', email: '', password: '', role: 'user' });
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={addUserLoading}
                >
                  取消
                </Button>
                <Button
                  onClick={handleAddUser}
                  disabled={addUserLoading}
                  className="flex-1 bg-[#22c55e] text-white hover:bg-[#16a34a]"
                >
                  {addUserLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      创建中...
                    </>
                  ) : (
                    '创建'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 删除用户确认对话框 */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="确认删除用户"
        message={`确定要删除用户「${deleteDialog.userName}」吗？此操作将同时删除该用户的所有记录数据，且不可恢复。`}
        confirmText="确认删除"
        cancelText="取消"
        onConfirm={confirmDeleteUser}
        onCancel={() => setDeleteDialog({ isOpen: false, userId: '', userName: '' })}
        loading={deleteLoading}
      />
    </div>
  );
}
