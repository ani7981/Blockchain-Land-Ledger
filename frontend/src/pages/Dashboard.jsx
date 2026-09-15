import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { TitleStatusBadge, TransferStatusBadge } from '../components/StatusBadge';
import { Building2, CheckCircle2, Clock, CheckCheck, XCircle, Search, RefreshCw } from 'lucide-react';

export default function Dashboard({ setActivePage, setSelectedParcelId }) {
  const [summary, setSummary] = useState({
    totalProperties: 0,
    activeTitles: 0,
    pendingTransfers: 0,
    approvedTransfers: 0,
    rejectedTransfers: 0
  });
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, propRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getAllProperties()
      ]);
      setSummary(sumRes.data);
      setProperties(propRes.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInspect = (parcelId) => {
    if (setSelectedParcelId) {
      setSelectedParcelId(parcelId);
    }
    setActivePage('search');
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Digital Land Registry Dashboard</h1>
          <p className="page-description">
            Permissioned Consortium Blockchain Network &bull; Channel: <code>landchannel</code> &bull; Chaincode: <code>landregistry</code>
          </p>
        </div>
        <button className="btn btn-secondary" onClick={loadData} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh Ledger
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <Building2 size={24} />
          </div>
          <div className="metric-data">
            <h4>Total Properties</h4>
            <div className="value">{summary.totalProperties}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="metric-data">
            <h4>Active Titles</h4>
            <div className="value">{summary.activeTitles}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <Clock size={24} />
          </div>
          <div className="metric-data">
            <h4>Pending Reviews</h4>
            <div className="value">{summary.pendingTransfers}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
            <CheckCheck size={24} />
          </div>
          <div className="metric-data">
            <h4>Approved Transfers</h4>
            <div className="value">{summary.approvedTransfers}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
            <XCircle size={24} />
          </div>
          <div className="metric-data">
            <h4>Rejected Transfers</h4>
            <div className="value">{summary.rejectedTransfers}</div>
          </div>
        </div>
      </div>

      {/* Blockchain Consortium Status Callout */}
      <div className="card" style={{ backgroundColor: '#f1f5f9', borderLeft: '4px solid #2563eb' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>
          Consortium Architecture &amp; Privacy Protocol
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>
          Original land deeds and sensitive owner certificates are kept off-chain. Only cryptographic document hashes (<code>documentHash</code>)
          and state transition proofs are committed to the Hyperledger Fabric ledger, establishing verifiable title integrity without exposing sensitive documents.
        </p>
      </div>

      {/* Registered Properties Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="card-title" style={{ margin: 0 }}>
            <Building2 size={20} color="#2563eb" />
            Registered Land Parcels on Ledger
          </h2>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            {properties.length} recorded assets
          </span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Parcel ID</th>
                <th>Survey Number</th>
                <th>Type</th>
                <th>Current Owner</th>
                <th>Title Status</th>
                <th>Transfer Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {properties.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    {loading ? 'Fetching blockchain records...' : 'No properties registered yet.'}
                  </td>
                </tr>
              ) : (
                properties.map((prop) => (
                  <tr key={prop.parcelId}>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{prop.parcelId}</td>
                    <td>{prop.surveyNumber || '-'}</td>
                    <td>{prop.propertyType || 'Residential'}</td>
                    <td>
                      <div>{prop.ownerName}</div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{prop.ownerId}</span>
                    </td>
                    <td>
                      <TitleStatusBadge status={prop.titleStatus} />
                    </td>
                    <td>
                      <TransferStatusBadge status={prop.transferStatus} />
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                        onClick={() => handleInspect(prop.parcelId)}
                      >
                        <Search size={14} />
                        View / Audit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
