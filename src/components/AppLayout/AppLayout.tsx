import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { House, CalendarDays, ShoppingCart, User } from 'lucide-react';
import logo from '../../assets/kitchenwise-logo.png';
import { clearSession, getUser } from '../../services/authService';
import styles from './AppLayout.module.css';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Home', icon: House },
  { to: '/plan', label: 'Plan', icon: CalendarDays },
  { to: '/grocery', label: 'Grocery', icon: ShoppingCart },
  { to: '/profile', label: 'Profile', icon: User },
];

export function AppLayout() {
  const navigate = useNavigate();
  const user = getUser();
  const initial = user?.name?.charAt(0).toUpperCase() ?? '?';

  const handleLogout = async () => {
    clearSession();
    await navigate('/');
  };

  return (
    <div className={styles.shell}>
      <aside className={styles.nav}>
        <div className={styles.navBrand}>
          <img src={logo} alt="" className={styles.logo} />
          <span className={styles.brandName}>KitchenWise</span>
        </div>

        <nav aria-label="Main">
          <ul className={styles.navList}>
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                  }
                >
                  <Icon size={20} aria-hidden="true" />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className={styles.content}>
        <header className={styles.topbar}>
          <div className={styles.topbarBrand}>
            <img src={logo} alt="" className={styles.logo} />
            <span className={styles.brandName}>KitchenWise</span>
          </div>
          <div className={styles.userArea}>
            <span className={styles.avatar} aria-hidden="true">{initial}</span>
            <button type="button" className={styles.logoutButton} onClick={handleLogout}>
              Log out
            </button>
          </div>
        </header>

        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}