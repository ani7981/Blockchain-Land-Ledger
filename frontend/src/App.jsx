import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import RegisterProperty from './pages/RegisterProperty';
import PropertySearch from './pages/PropertySearch';
import TransferReview from './pages/TransferReview';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedParcelId, setSelectedParcelId] = useState('TN-CHN-001');
  const [currentRole, setCurrentRole] = useState('REGISTRATION_OFFICER');

  return (
    <div className="app-container">
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
      />

      <main className="main-content">
        {activePage === 'dashboard' && (
          <Dashboard
            setActivePage={setActivePage}
            setSelectedParcelId={setSelectedParcelId}
          />
        )}

        {activePage === 'register' && (
          <RegisterProperty
            setActivePage={setActivePage}
            setSelectedParcelId={setSelectedParcelId}
            currentRole={currentRole}
          />
        )}

        {activePage === 'search' && (
          <PropertySearch
            selectedParcelId={selectedParcelId}
            setSelectedParcelId={setSelectedParcelId}
            currentRole={currentRole}
          />
        )}

        {activePage === 'transfer-review' && (
          <TransferReview
            setActivePage={setActivePage}
            setSelectedParcelId={setSelectedParcelId}
            currentRole={currentRole}
          />
        )}
      </main>

      <footer className="footer">
        <div>
          <strong>A Privacy-Preserving Consortium Blockchain Framework for Digital Land Registry and Title Verification</strong>
        </div>
        <div style={{ marginTop: '0.4rem' }}>
          Hyperledger Fabric &bull; Channel: <code>landchannel</code> &bull; Chaincode: <code>landregistry</code> &bull; REST Gateway API
        </div>
      </footer>
    </div>
  );
}
