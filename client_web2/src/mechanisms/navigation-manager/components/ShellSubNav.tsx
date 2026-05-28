import { useLocation } from 'react-router-dom';
import { LbSubNav, LbSubNavLink } from '@/components/layout/LbSubNav';
import { getSubNavForPath } from '../nav-config';

export function ShellSubNav() {
  const { pathname } = useLocation();
  const items = getSubNavForPath(pathname);

  if (!items) return null;

  return (
    <LbSubNav>
      {items.map((item) => (
        <LbSubNavLink key={item.path} to={item.path} end={item.end}>
          {item.label}
        </LbSubNavLink>
      ))}
    </LbSubNav>
  );
}
