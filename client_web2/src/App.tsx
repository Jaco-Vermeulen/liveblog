import { Navigate, Route, Routes } from 'react-router-dom';
import { BlogListPage } from '@/mechanisms/blog-list-manager';
import { EditorPage, SettingsPage } from '@/mechanisms/editor-manager';
import {
  GeneralSettingsPage,
  InstanceFeaturesProvider,
  InstanceSettingsPage,
} from '@/mechanisms/settings-manager';
import { IntegrationsPage } from '@/mechanisms/integrations-manager';
import { ThemesManagerPage } from '@/mechanisms/themes-manager';
import { BlogAnalyticsPage } from '@/mechanisms/analytics-manager';
import { FreetypesManagerPage } from '@/mechanisms/freetypes-manager';
import { AdvertisingManagerPage } from '@/mechanisms/advertising-manager';
import { MarketplaceManagerPage } from '@/mechanisms/marketplace-manager';
import { SyndicationManagerPage } from '@/mechanisms/syndication-manager';
import { UsersManagerPage } from '@/mechanisms/user-manager';
import {
  AdminReactQueryDevtools,
  AuthProvider,
  LoginPage,
  PrivilegeRoute,
  PrivilegesProvider,
  ProtectedRoute,
  ProfilePage,
  ResetPasswordPage,
  ResetPasswordTokenRedirect,
  SecureLoginPage,
} from '@/mechanisms/auth-manager';
import { AppShell, NotificationsProvider } from '@/mechanisms/navigation-manager';
import { WebSocketProvider } from '@/mechanisms/websocket-manager';

export default function App() {
  return (
    <AuthProvider>
      <AdminReactQueryDevtools />
      <ResetPasswordTokenRedirect />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/secure-login" element={<SecureLoginPage />} />

        <Route
          element={
            <ProtectedRoute>
              <PrivilegesProvider>
                <WebSocketProvider>
                  <InstanceFeaturesProvider>
                    <NotificationsProvider>
                      <AppShell />
                    </NotificationsProvider>
                  </InstanceFeaturesProvider>
                </WebSocketProvider>
              </PrivilegesProvider>
            </ProtectedRoute>
          }
        >
          <Route path="/liveblog" element={<BlogListPage />} />
          <Route path="/liveblog/active" element={<BlogListPage />} />
          <Route path="/liveblog/archived" element={<BlogListPage />} />
          <Route path="/liveblog/deleted" element={<BlogListPage />} />
          <Route path="/liveblog/edit/:id" element={<EditorPage />} />
          <Route path="/liveblog/settings/:id" element={<SettingsPage />} />
          <Route path="/liveblog/analytics/:id" element={<BlogAnalyticsPage />} />

          <Route
            path="/settings/general"
            element={
              <PrivilegeRoute require={{ global_preferences: 1 }}>
                <GeneralSettingsPage />
              </PrivilegeRoute>
            }
          />
          <Route
            path="/settings/instance-settings"
            element={
              <PrivilegeRoute require={{ global_preferences: 1 }}>
                <InstanceSettingsPage />
              </PrivilegeRoute>
            }
          />
          <Route
            path="/settings/integrations"
            element={
              <PrivilegeRoute require={{ global_preferences: 1 }}>
                <IntegrationsPage />
              </PrivilegeRoute>
            }
          />
          <Route path="/settings" element={<Navigate to="/settings/general" replace />} />

          <Route
            path="/themes"
            element={
              <PrivilegeRoute require={{ global_preferences: 1 }}>
                <ThemesManagerPage />
              </PrivilegeRoute>
            }
          />
          <Route
            path="/freetypes"
            element={
              <PrivilegeRoute require={{ global_preferences: 1 }}>
                <FreetypesManagerPage />
              </PrivilegeRoute>
            }
          />
          <Route
            path="/advertising"
            element={
              <PrivilegeRoute require={{ global_preferences: 1 }}>
                <AdvertisingManagerPage />
              </PrivilegeRoute>
            }
          />
          <Route path="/marketplace" element={<MarketplaceManagerPage />} />
          <Route path="/syndication" element={<SyndicationManagerPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/users"
            element={
              <PrivilegeRoute require={{ users: 1 }}>
                <UsersManagerPage />
              </PrivilegeRoute>
            }
          />

          <Route path="/" element={<Navigate to="/liveblog" replace />} />
          <Route path="*" element={<Navigate to="/liveblog" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
