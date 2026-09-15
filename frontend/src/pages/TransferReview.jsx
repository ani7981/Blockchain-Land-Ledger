import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { TitleStatusBadge, TransferStatusBadge } from '../components/StatusBadge';
import { ArrowRightLeft, CheckCircle, XCircle, AlertTriangle, Search, RefreshCw, UserCheck } from 'lucide-react';

export default function TransferReview({ setActivePage, setSelectedParcelId, currentRole }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [officerId, setOfficerId] = useState('OFFICER-001');

  // Modal / prompt for reject reason
  const [rejectingParcelId, setRejectingParcelId] = useState(null);
  const [rejectReason, setRejectReason] = useState('Survey verification is incomplete');

  const loadProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAllProperties();
      setProperties(res.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch properties for review');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const handleApprove = async (parcelId) => {
    setActionSuccess(null);
    setActionError(null);
    try {
      const res = await api.approveTitleTransfer(parcelId, {
        officerId,
        requestedByRole: currentRole
      });
      setActionSuccess({
        type: 'APPROVE',
        message: `Title transfer approved successfully for parcel ${parcelId}! New owner: ${res.data?.ownerName}`,
        transactionId: res.transactionId
      });
      await loadProperties();
    } catch (err) {
      console.error(err);
      setActionError({
        message: err.message || 'Approval failed',
        errorCode: err.errorCode || 'BLOCKCHAIN_ERROR'
      });
    }
  };

  const handleReject = async (parcelId) => {
    setActionSuccess(null);
    setActionError(null);
    try {
      const res = await api.rejectTitleTransfer(parcelId, {
        officerId,
        reason: rejectReason,
        requestedByRole: currentRole
      });
      setActionSuccess({
        type: 'REJECT',
        message: `Title transfer rejected for parcel ${parcelId}. Reason: ${res.data?.rejectionReason}`,
        transactionId: res.transactionId
      });
      setRejectingParcelId(null);
      await loadProperties();
    } catch (err) {
      console.error(err);
      setActionError({
        message: err.message || 'Rejection failed',
        errorCode: err.errorCode || 'BLOCKCHAIN_ERROR'
      });
    }
  };

  const pendingList = properties.filter((p) => p.transferStatus === 'PENDING');
  const otherList = properties.filter((p) => p.transferStatus !== 'PENDING');

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Title Transfer Review &amp; Approval</h1>
          <p className="page-description">
            Registration Officer verification portal &bull; Authorized role: <code>REGISTRATION_OFFICER</code>
          </p>
        </div>
        <button className="btn btn-secondary" onClick={loadProperties} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh Requests
        </button>
      </div>

      {currentRole !== 'REGISTRATION_OFFICER' && (
        <div className="alert alert-info">
          <AlertTriangle size={20} color="#b45309" />
          <div>
            <strong>Role Check:</strong> You are currently acting as <code>{currentRole}</code>.
            Attempting to approve or reject a transfer will trigger the chaincode access-control rule:
            <em> "Only a Registration Officer can approve/reject a title transfer"</em>.
          </div>
        </div>
      )}

      {actionSuccess && (
        <div className="alert alert-success" style={{ flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <CheckCircle size={20} color="#15803d" />
            <span>{actionSuccess.message}</span>
          </div>
          <div>
            <strong>Transaction ID:</strong>
            <span className="tx-display">{actionSuccess.transactionId}</span>
          </div>
        </div>
      )}

      {actionError && (
        <div className="alert alert-error">
          <AlertTriangle size={20} />
          <div>
            <strong>Action Rejected ({actionError.errorCode}):</strong> {actionError.message}
          </div>
        </div>
      )}

      {/* Pending Requests Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 className="card-title" style={{ margin: 0 }}>
            <ArrowRightLeft size={20} color="#d97706" />
            Pending Transfer Requests Requiring Review
          </h2>
          <span className="badge badge-pending">{pendingList.length} Pending</span>
        </div>

        {pendingList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
            <p style={{ fontSize: '1rem', fontWeight: 500 }}>No transfer requests currently pending.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
              To submit a request, navigate to <strong>Property Search &amp; History</strong> as a <code>LAND_OWNER</code>.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Parcel ID</th>
                  <th>Current Owner</th>
                  <th>Proposed Buyer</th>
                  <th>Document Hash</th>
                  <th>Review Decision</th>
                </tr>
              </thead>
              <tbody>
                {pendingList.map((prop) => (
                  <tr key={prop.parcelId}>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{prop.parcelId}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{prop.ownerName}</div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{prop.ownerId}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: '#15803d' }}>{prop.pendingBuyerName}</div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{prop.pendingBuyerId}</span>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.8rem' }}>{prop.documentHash}</code>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-success"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => handleApprove(prop.parcelId)}
                        >
                          <CheckCircle size={14} />
                          Approve
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => setRejectingParcelId(prop.parcelId)}
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rejection Modal / Prompt */}
      {rejectingParcelId && (
        <div className="card" style={{ borderColor: '#ef4444', backgroundColor: '#fef2f2' }}>
          <h3 style={{ color: '#991b1b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <XCircle size={18} />
            Provide Justification for Rejecting Parcel {rejectingParcelId}
          </h3>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ color: '#7f1d1d' }}>Rejection Reason</label>
            <input
              type="text"
              className="form-input"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Required sale-deed verification is incomplete"
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setRejectingParcelId(null)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={() => handleReject(rejectingParcelId)}>
              Confirm Rejection on Ledger
            </button>
          </div>
        </div>
      )}

      {/* Historical / Processed Properties */}
      <div className="card">
        <h3 className="card-title">
          <UserCheck size={20} color="#2563eb" />
          Other Properties in Registry
        </h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Parcel ID</th>
                <th>Owner</th>
                <th>Title Status</th>
                <th>Transfer Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {otherList.map((p) => (
                <tr key={p.parcelId}>
                  <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{p.parcelId}</td>
                  <td>{p.ownerName}</td>
                  <td>
                    <TitleStatusBadge status={p.titleStatus} />
                  </td>
                  <td>
                    <TransferStatusBadge status={p.transferStatus} />
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      onClick={() => {
                        if (setSelectedParcelId) setSelectedParcelId(p.parcelId);
                        setActivePage('search');
                      }}
                    >
                      <Search size={12} />
                      Inspect History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
