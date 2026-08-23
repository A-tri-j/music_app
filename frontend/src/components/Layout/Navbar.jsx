import { NavLink } from 'react-router-dom'
import { Home, Search, Library, BarChart3, User } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/library', icon: Library, label: 'Library' },
  { to: '/stats', icon: BarChart3, label: 'Stats' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function Navbar() {
  return (
    <div className="fixed bottom-3 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto bg-[var(--nav-bg)]/95 backdrop-blur-2xl border border-[var(--card-border)] rounded-2xl flex items-center justify-between p-1.5 w-full max-w-md shadow-2xl transition-all duration-300">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center text-[11px] font-medium py-1.5 px-3 rounded-xl transition-all duration-200 cursor-pointer ${isActive
                ? 'bg-[var(--nav-card)] border border-[var(--card-border)] text-[var(--text-secondary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]/50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} strokeWidth={isActive ? 2.4 : 1.8} />
                <span className="mt-0.5 tracking-tight">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}


