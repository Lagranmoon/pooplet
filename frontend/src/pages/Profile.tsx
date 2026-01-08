import { useAuth } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, Calendar, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface ProfilePageProps {
  onLogout?: () => void;
}

export function ProfilePage({ onLogout }: ProfilePageProps) {
  const { user } = useAuth();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-1">个人资料</h2>
        <p className="text-gray-500">管理你的账户信息</p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
              <span className="text-4xl">💩</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <User className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-gray-500">昵称</p>
                <p className="font-medium text-gray-800">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-gray-500">邮箱</p>
                <p className="font-medium text-gray-800">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-gray-500">注册时间</p>
                <p className="font-medium text-gray-800">
                  {format(new Date(user.created_at), 'yyyy年M月d日', { locale: zhCN })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="pt-4">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full h-12 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        >
          <LogOut className="mr-2 h-5 w-5" />
          退出登录
        </Button>
      </div>
    </div>
  );
}
