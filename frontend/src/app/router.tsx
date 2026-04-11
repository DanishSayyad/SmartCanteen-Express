import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '@/app/auth';
import { Panel, Spinner } from '@/components/ui';
import { AdminDashboard } from '@/features/admin/admin-dashboard';
import { LandingRedirect, LoginPage, NotFoundPage, RegisterPage } from '@/features/auth/auth-pages';
import { CustomerDashboard } from '@/features/customer/customer-dashboard';
import { ManagerDashboard } from '@/features/manager/manager-dashboard';

const ProtectedWorkspace = () => {
  const { isAuthenticated, isBootstrapping, user } = useAuth();

  if (isBootstrapping) {
    return (
      <div className="page-gradient flex min-h-screen items-center justify-center px-4 py-10">
        <Panel className="w-full max-w-lg text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Session restore</p>
          <h1 className="mt-4 font-display text-4xl text-ink">Loading your workspace</h1>
          <div className="mt-6 flex justify-center">
            <Spinner label="Reconnecting to your authenticated backend context" />
          </div>
        </Panel>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'SUPER_ADMIN':
      return <AdminDashboard />;
    case 'CANTEEN_MANAGER':
      return <ManagerDashboard />;
    case 'CUSTOMER':
      return <CustomerDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingRedirect />
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/register',
    element: <RegisterPage />
  },
  {
    path: '/app',
    element: <ProtectedWorkspace />
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
]);
