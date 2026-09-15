import React from 'react';
import { LayoutDashboard, FilePlus2, Search, ArrowRightLeft, ShieldCheck, UserCheck } from 'lucide-react';

export default function Navbar({ activePage, setActivePage, currentRole, setCurrentRole }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'register', label: 'Register Property', icon: FilePlus2 },
    { id: 'search', label: 'Property Search & History', icon: Search },
    { id: 'transfer-review', label: 'Transfer Review', icon: ArrowRightLeft }
  ];

  return (
    <header className="navbar">
      <div className="nav-brand">
        <ShieldCheck size={26} color="#38bdf8" />
        <div>
          <span>LandLedger</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#94a3b8', display: 'block' }}>
            Hyperledger Fabric Land Registry
          </span>
        </div>
        <span className="nav-badge">Consortium</span>
      </div>

      <nav>
        <ul className="nav-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  className={`nav-link ${activePage === item.id ? 'active' : ''}`}
                  onClick={() => setActivePage(item.id)}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="nav-role-selector">
        <UserCheck size={16} color="#38bdf8" />
        <span className="role-tag">Active Role:</span>
        <select
          value={currentRole}
          onChange={(e) => setCurrentRole(e.target.value)}
          className="role-select"
          title="Switch role for testing role-based access control"
        >
          <option value="REGISTRATION_OFFICER">Registration Officer (OFFICER-001)</option>
          <option value="LAND_OWNER">Land Owner (OWNER-001)</option>
          <option value="SURVEY_OFFICER">Survey Officer</option>
          <option value="BUYER">Buyer (BUYER-001)</option>
        </select>
      </div>
    </header>
  );
}
