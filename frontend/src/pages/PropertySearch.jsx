import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { TitleStatusBadge, TransferStatusBadge } from '../components/StatusBadge';
import { Search, History, ArrowRightLeft, CheckCircle2, AlertCircle, Shield, FileText, Send, User } from 'lucide-react';

export default function PropertySearch({ selectedParcelId, setSelectedParcelId, currentRole }) {
  const [searchQuery, setSearchQuery] = useState(selectedParcelId || 'TN-CHN-001');
  const [property, setProperty] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Transfer request state
  const [transferForm, setTransferForm] = useState({
    currentOwnerId: '',
    buyerId: 'BUYER-001',
    buyerName: 'Priya Menon'
  });
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState(null);
  const [transferSuccess, setTransferSuccess] = useState(null);

  const fetchPropertyData = async (parcelId) => {
    if (!parcelId || !parcelId.trim()) return;
    setLoading(true);
    setError(null);
    setTransferError(null);
    setTransferSuccess(null);

    try {
      const [propRes, histRes] = await Promise.all([
        api.getProperty(parcelId.trim()),
        api.getPropertyHistory(parcelId.trim()).catch(() => ({ data: [] }))
      ]);

      setProperty(propRes.data);
      setHistory(histRes.data || []);
      setTransferForm((prev) => ({
        ...prev,
        currentOwnerId: propRes.data?.ownerId || ''
      }));
    } catch (err) {
      console.error(err);
      setProperty(null);
      setHistory([]);
      setError(err.message || 'Property not found on ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedParcelId) {
      setSearchQuery(selectedParcelId);
      fetchPropertyData(selectedParcelId);
    } else {
      fetchPropertyData('TN-CHN-001');
    }
  }, [selectedParcelId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (setSelectedParcelId) {
      setSelectedParcelId(searchQuery);
    }
    fetchPropertyData(searchQuery);
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    setTransferError(null);
    setTransferSuccess(null);

    if (!transferForm.buyerId.trim() || !transferForm.buyerName.trim()) {
      setTransferError('Buyer ID and Buyer Name are required');
      return;
    }

    setTransferLoading(true);
    try {
      const payload = {
        currentOwnerId: transferForm.currentOwnerId.trim(),
        buyerId: transferForm.buyerId.trim(),
        buyerName: transferForm.buyerName.trim(),
        requestedByRole: currentRole
      };

      const res = await api.requestTitleTransfer(property.parcelId, payload);
      setTransferSuccess({
        message: 'Title transfer request submitted successfully to ledger',
        transactionId: res.transactionId
      });

      // Refresh property & history
      await fetchPropertyData(property.parcelId);
    } catch (err) {
      console.error(err);
      setTransferError(err.message || 'Transfer request failed');
    } finally {
      setTransferLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Property Search &amp; History Audit</h1>
        <p className="page-description">
          Query current property title state and inspect the complete, immutable transaction history.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={18}
              color="#64748b"
              style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem', width: '100%' }}
              placeholder="Search by Parcel ID (e.g. TN-CHN-001, TN-CHN-002)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Querying...' : 'Search Ledger'}
          </button>
        </form>

        <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <span style={{ color: '#64748b' }}>Quick query:</span>
          {['TN-CHN-001', 'TN-CHN-002', 'TN-CHN-003'].map((id) => (
            <button
              key={id}
              type="button"
              className="btn btn-secondary"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
              onClick={() => {
                setSearchQuery(id);
                fetchPropertyData(id);
              }}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <div>
            <strong>Query Failed:</strong> {error}
          </div>
        </div>
      )}

      {property && (
        <>
          {/* Main Title Details */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Parcel Identifier
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'monospace', color: '#0f172a' }}>
                  {property.parcelId}
                </h2>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <TitleStatusBadge status={property.titleStatus} />
                <TransferStatusBadge status={property.transferStatus} />
              </div>
            </div>

            <div className="form-grid" style={{ rowGap: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Survey / Cadastral Number:</span>
                <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#1e293b' }}>{property.surveyNumber}</div>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Property Category:</span>
                <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#1e293b' }}>{property.propertyType}</div>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Current Registered Owner:</span>
                <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#1e293b' }}>
                  {property.ownerName} <span style={{ fontSize: '0.85rem', color: '#64748b' }}>({property.ownerId})</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Off-Chain Document Hash:</span>
                <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#0369a1', background: '#f0f9ff', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', wordBreak: 'break-all' }}>
                  {property.documentHash}
                </div>
              </div>

              {property.transferStatus === 'PENDING' && (
                <div className="full-width" style={{ background: '#fef3c7', padding: '0.75rem 1rem', borderRadius: '0.375rem', border: '1px solid #fde68a' }}>
                  <div style={{ fontWeight: 600, color: '#92400e', marginBottom: '0.25rem' }}>
                    Title Transfer Pending Officer Approval
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#78350f' }}>
                    Proposed Buyer: <strong>{property.pendingBuyerName}</strong> ({property.pendingBuyerId})
                  </div>
                </div>
              )}

              {property.transferStatus === 'REJECTED' && property.rejectionReason && (
                <div className="full-width" style={{ background: '#fee2e2', padding: '0.75rem 1rem', borderRadius: '0.375rem', border: '1px solid #fca5a5' }}>
                  <div style={{ fontWeight: 600, color: '#991b1b', marginBottom: '0.25rem' }}>
                    Last Transfer Request Rejected
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#7f1d1d' }}>
                    Reason: <strong>{property.rejectionReason}</strong>
                  </div>
                </div>
              )}

              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Genesis Ledger Timestamp:</span>
                <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                  {property.createdAt ? new Date(property.createdAt).toLocaleString() : '-'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Last Committed Update:</span>
                <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                  {property.updatedAt ? new Date(property.updatedAt).toLocaleString() : '-'}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Title Transfer Request (Land Owner action) */}
          <div className="card">
            <h3 className="card-title">
              <ArrowRightLeft size={20} color="#2563eb" />
              Submit Title Transfer Request
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Authorized role: <code>LAND_OWNER</code>. The current owner requests a formal change of title to a buyer.
            </p>

            {transferSuccess && (
              <div className="alert alert-success">
                <CheckCircle2 size={20} />
                <div>
                  <strong>{transferSuccess.message}</strong>
                  <span className="tx-display">{transferSuccess.transactionId}</span>
                </div>
              </div>
            )}

            {transferError && (
              <div className="alert alert-error">
                <AlertCircle size={20} />
                <div>
                  <strong>Transfer Request Error:</strong> {transferError}
                </div>
              </div>
            )}

            <form onSubmit={handleTransferSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Current Owner ID</label>
                  <input
                    type="text"
                    className="form-input"
                    value={transferForm.currentOwnerId}
                    onChange={(e) => setTransferForm({ ...transferForm, currentOwnerId: e.target.value })}
                    placeholder="Must match current owner ID"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Proposed Buyer ID</label>
                  <input
                    type="text"
                    className="form-input"
                    value={transferForm.buyerId}
                    onChange={(e) => setTransferForm({ ...transferForm, buyerId: e.target.value })}
                    placeholder="e.g. BUYER-001"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Proposed Buyer Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={transferForm.buyerName}
                    onChange={(e) => setTransferForm({ ...transferForm, buyerName: e.target.value })}
                    placeholder="e.g. Priya Menon"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Active Role</label>
                  <input
                    type="text"
                    className="form-input"
                    value={currentRole}
                    disabled
                    style={{ background: '#f1f5f9' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={transferLoading || property.transferStatus === 'PENDING'}
                >
                  <Send size={16} />
                  {transferLoading
                    ? 'Submitting Transfer Request...'
                    : property.transferStatus === 'PENDING'
                    ? 'Transfer Already Pending'
                    : 'Submit Transfer Request'}
                </button>
              </div>
            </form>
          </div>

          {/* Section: Immutable Property History */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title" style={{ margin: 0 }}>
                <History size={20} color="#2563eb" />
                Immutable Property History Timeline
              </h3>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                {history.length} blockchain state revisions
              </span>
            </div>

            {history.length === 0 ? (
              <p style={{ marginTop: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                No historical revisions recorded.
              </p>
            ) : (
              <div className="timeline">
                {history.map((record, idx) => (
                  <div className="timeline-item" key={record.transactionId || idx}>
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="timeline-title">
                          Revision #{idx + 1} &bull; Tx: {record.transactionId}
                        </span>
                        <span className="timeline-time">
                          {record.timestamp ? new Date(record.timestamp).toLocaleString() : '-'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: '0.35rem' }}>
                        <div>
                          <strong>Owner:</strong> {record.value?.ownerName} ({record.value?.ownerId})
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem', alignItems: 'center' }}>
                          <TitleStatusBadge status={record.value?.titleStatus} />
                          <TransferStatusBadge status={record.value?.transferStatus} />
                          {record.value?.pendingBuyerName && (
                            <span style={{ fontSize: '0.75rem', color: '#b45309' }}>
                              Pending Buyer: {record.value.pendingBuyerName}
                            </span>
                          )}
                          {record.value?.rejectionReason && (
                            <span style={{ fontSize: '0.75rem', color: '#b91c1c' }}>
                              Reason: {record.value.rejectionReason}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
