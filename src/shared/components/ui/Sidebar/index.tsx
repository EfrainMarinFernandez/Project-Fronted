import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PanelRightOpen, Menu } from 'lucide-react';
import './styles.scss';
interface SidebarProps {
  links: {
    name: string;
    path: string;
    icon?: React.ReactNode;
    module: string;
  }[];
  className?: string;
}

export const Sidebar = ({ links, className }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('');

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  const location = useLocation();

  useEffect(() => {
    const currentLink = links.find((link) => link.path === location.pathname);
    if (currentLink) {
      setCurrentPage(currentLink.name);
    }
  }, [location.pathname, links]);

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 p-2 bg-white shadow-md dark:bg-gray-950 lg:hidden"
        onClick={toggleMenu}
      >
        <Menu className="text-black dark:text-white" />
      </button>
      <div
        className={`fixed top-0 left-0 z-40 h-full bg-white dark:bg-gray-950 transition-all duration-300 
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex lg:w-auto 
          ${isCollapsed ? 'w-16' : 'w-64'} ${className}`}
      >
        <button
          onClick={toggleSidebar}
          className={`isCollapsed
            ${isCollapsed ? 'rotate-180' : ''}`}
        >
          <PanelRightOpen />
        </button>
        <ul className="sidebar-list">
          {links.map((link) => (
            <Link
              key={link.name}
              className="flex items-center gap-2 text-lg font-medium text-black dark:text-white"
              to={link.path}
              onClick={() => {
                setCurrentPage(link.name);
                closeMenu();
              }}
            >
              <li
                className={`sidebar-item 
                  ${currentPage === link.name ? 'bg-gray-200 text-blue-500' : ''}`}
              >
                {link.icon && (
                  <span
                    className={`transition-all duration-200 ${isCollapsed ? 'text-lg' : ''}`}
                  >
                    {link.icon}
                  </span>
                )}
                {!isCollapsed && (
                  <span className="whitespace-nowrap">{link.name}</span>
                )}
              </li>
            </Link>
          ))}
        </ul>
      </div>
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black opacity-50 lg:hidden"
          onClick={closeMenu}
        />
      )}
    </>
  );
};
