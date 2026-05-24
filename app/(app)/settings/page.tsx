'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Moon, 
  Sun,
  HelpCircle, 
  FileText, 
  Shield, 
  LogOut,
  ChevronRight,
  Trash2,
  ExternalLink,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUIStore } from '@/stores/useUIStore';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { LensCharacter } from '@/features/shared/lens-character/LensCharacter';
import { deleteAllOrders } from '@/lib/actions/scan.actions';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { isDemo, showToast } = useUIStore();
  
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleLogout = async () => {
    if (isDemo) {
      showToast('로그아웃 되었어요 (데모)', 'info');
      router.push('/');
      return;
    }
    
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      showToast('로그아웃에 실패했어요', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (isDemo) {
      showToast('계정이 삭제되었어요 (데모)', 'info');
      router.push('/');
      return;
    }

    try {
      await deleteAllOrders();
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Delete account error:', error);
      showToast('계정 삭제에 실패했어요', 'error');
    }
  };

  const settingsGroups = [
    {
      title: '알림',
      items: [
        {
          icon: Bell,
          label: '푸시 알림',
          description: '주간 리포트 알림 받기',
          type: 'switch' as const,
          value: notifications,
          onChange: setNotifications,
        },
      ],
    },
    {
      title: '화면',
      items: [
        {
          icon: darkMode ? Moon : Sun,
          label: '다크 모드',
          description: '어두운 테마 사용',
          type: 'switch' as const,
          value: darkMode,
          onChange: (value: boolean) => {
            setDarkMode(value);
            document.documentElement.classList.toggle('dark', value);
          },
        },
      ],
    },
    {
      title: '지원',
      items: [
        {
          icon: HelpCircle,
          label: '도움말',
          type: 'link' as const,
          href: '/help',
        },
        {
          icon: Mail,
          label: '문의하기',
          type: 'link' as const,
          href: 'mailto:support@baedallens.app',
        },
      ],
    },
    {
      title: '정보',
      items: [
        {
          icon: FileText,
          label: '이용약관',
          type: 'link' as const,
          href: '/terms',
        },
        {
          icon: Shield,
          label: '개인정보처리방침',
          type: 'link' as const,
          href: '/privacy',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">설정</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                {isDemo ? (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                    <LensCharacter expression="excited" size="small" />
                  </div>
                ) : (
                  <>
                    <AvatarImage src={user?.imageUrl} alt={user?.firstName || ''} />
                    <AvatarFallback>
                      <User className="w-8 h-8" />
                    </AvatarFallback>
                  </>
                )}
              </Avatar>
              <div className="flex-1">
                <h2 className="font-semibold text-lg">
                  {isDemo ? '데모 사용자' : user?.firstName || '사용자'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isDemo ? 'demo@baedallens.app' : user?.primaryEmailAddress?.emailAddress}
                </p>
                {isDemo && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                    데모 모드
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">
              {group.title}
            </h3>
            <Card>
              <CardContent className="p-0">
                {group.items.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    {itemIndex > 0 && <Separator />}
                    {item.type === 'switch' ? (
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{item.label}</p>
                            {item.description && (
                              <p className="text-sm text-muted-foreground">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <Switch
                          checked={item.value}
                          onCheckedChange={item.onChange}
                        />
                      </div>
                    ) : (
                      <button
                        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                        onClick={() => {
                          if (item.href?.startsWith('mailto:')) {
                            window.location.href = item.href;
                          } else if (item.href) {
                            router.push(item.href);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5 text-muted-foreground" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        {item.href?.startsWith('mailto:') ? (
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ))}

        {/* Logout Button */}
        <Card>
          <CardContent className="p-0">
            <button
              className="w-full flex items-center gap-3 p-4 text-destructive hover:bg-destructive/5 transition-colors"
              onClick={() => setShowLogoutDialog(true)}
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">로그아웃</span>
            </button>
          </CardContent>
        </Card>

        {/* Delete Account */}
        <div className="pt-4">
          <button
            className="w-full text-center text-sm text-muted-foreground hover:text-destructive transition-colors"
            onClick={() => setShowDeleteDialog(true)}
          >
            계정 삭제
          </button>
        </div>

        {/* Version */}
        <p className="text-center text-xs text-muted-foreground pt-4">
          배달렌즈 v1.0.0
        </p>
      </main>

      {/* Logout Confirmation */}
      <ConfirmDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        title="로그아웃"
        description="정말 로그아웃 하시겠어요?"
        confirmText="로그아웃"
        onConfirm={handleLogout}
      />

      {/* Delete Account Confirmation */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="계정 삭제"
        description="계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없어요."
        confirmText="계정 삭제"
        onConfirm={handleDeleteAccount}
        variant="destructive"
      />
    </div>
  );
}
