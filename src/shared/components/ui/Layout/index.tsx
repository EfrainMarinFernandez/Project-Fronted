import { ReactNode } from 'react';
import { Header } from '../../../../ui/components/header';
import { Sidebar } from '../Sidebar/index';
import { Toaster } from '@/components/ui/toaster';
import { useAppSelector } from '../../../../app/hooks';
import { getSidebarLinksByRoles } from '../../../helpers/roleHelper';
import './styles.scss';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const roles = useAppSelector((state) => state.auth.signIn.user?.roles);
  const sidebarLinks = getSidebarLinksByRoles(roles ?? []);

  return (
    <div className="flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar className="hidden capitalize md:block" links={sidebarLinks} />

        <div className="container-Layout">{children}</div>
        <Toaster />
      </div>
    </div>
  );
};
