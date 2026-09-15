import React, { useState } from 'react';
import api from '../services/api';
import { FilePlus2, CheckCircle, AlertTriangle, ArrowRight, Sparkles, Hash } from 'lucide-react';

export default function RegisterProperty({ setActivePage, setSelectedParcelId, currentRole }) {
  const [formData, setFormData] = useState({
    parcelId: '',
    surveyNumber: '',
    ownerId: '',
    ownerName: '',
    propertyType: 'Residential',
    documentHash: '',
    officerId: 'OFFICER-001'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [successResult, setSuccessResult] = useState(null);

  const validate = () => {
    const errs = {};
    if (!formData.parcelId.trim()) {
      errs.parcelId = 'Parcel ID is required (e.g. TN-CHN-001)';
    }
    if (!formData.surveyNumber.trim()) {
      errs.surveyNumber = 'Survey number is required (e.g. 114/2A)';
    }
    if (!formData.ownerId.trim()) {
      errs.ownerId = 'Owner ID is required (e.g. OWNER-001)';
    }
    if (!formData.ownerName.trim()) {
      errs.ownerName = 'Owner name is required (e.g. Ravi Kumar)';
    }
    if (!formData.documentHash.trim()) {
      errs.documentHash = 'Document hash is required (SHA-256 deed hash)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFillDemo = () => {
    setFormData({
      parcelId: 'TN-CHN-001',
      surveyNumber: '114/2A',
      ownerId: 'OWNER-001',
      ownerName: 'Ravi Kumar',
      propertyType: 'Residential',
      documentHash: '4b2e7c9a11d3',
      officerId: 'OFFICER-001'
    });
    setErrors({});
    setServerError(null);
    setSuccessResult(null);
  };

  const handleFillDemo2 = () => {
    const rand = Math.floor(100 + Math.random() * 900);
    setFormData({
      parcelId: `TN-CHN-${rand}`,
      surveyNumber: `${rand}/1B`,
      ownerId: `OWNER-${rand}`,
      ownerName: 'Sunita Sharma',
      propertyType: 'Commercial',
      documentHash: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.substring(0, 16),
      officerId: 'OFFICER-001'
    });
    setErrors({});
    setServerError(null);
    setSuccessResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);
    setSuccessResult(null);

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        parcelId: formData.parcelId.trim(),
        surveyNumber: formData.surveyNumber.trim(),
        ownerId: formData.ownerId.trim(),
        ownerName: formData.ownerName.trim(),
        propertyType: formData.propertyType,
        documentHash: formData.documentHash.trim(),
        requestedByRole: currentRole,
        officerId: formData.officerId.trim() || 'OFFICER-001'
      };

      const res = await api.createProperty(payload);
      setSuccessResult(res);
      if (setSelectedParcelId) {
        setSelectedParcelId(res.data?.parcelId || formData.parcelId);
      }
    } catch (err) {
      console.error(err);
      setServerError({
        message: err.message || 'Failed to register property',
        errorCode: err.errorCode || 'BLOCKCHAIN_ERROR'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Register Land Property</h1>
          <p className="page-description">
            Create an immutable land title on Hyperledger Fabric ledger &bull; Authorized role: <code>REGISTRATION_OFFICER</code>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={handleFillDemo}>
            <Sparkles size={16} color="#2563eb" />
            Fill TN-CHN-001 (Demo)
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleFillDemo2}>
            Random Sample
          </button>
        </div>
      </div>

      {currentRole !== 'REGISTRATION_OFFICER' && (
        <div className="alert alert-info">
          <AlertTriangle size={20} color="#b45309" />
          <div>
            <strong>Notice on Role-Based Access Control:</strong> Your active role is set to <code>{currentRole}</code>.
            Only a <code>REGISTRATION_OFFICER</code> is permitted to commit new property titles.
            Submitting as <code>{currentRole}</code> will demonstrate the chaincode's access control enforcement.
          </div>
        </div>
      )}

      {successResult && (
        <div className="alert alert-success" style={{ flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '1.05rem' }}>
            <CheckCircle size={22} color="#15803d" />
            <span>Property Registered Successfully on Ledger</span>
          </div>
          <div>
            <strong>Transaction ID:</strong>
            <span className="tx-display">{successResult.transactionId}</span>
          </div>
          <div style={{ fontSize: '0.85rem' }}>
            Parcel <strong>{successResult.data?.parcelId}</strong> is now committed with Title Status: <strong>{successResult.data?.titleStatus}</strong>.
          </div>
          <button
            className="btn btn-primary"
            style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}
            onClick={() => setActivePage('search')}
          >
            Inspect Property &amp; History
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {serverError && (
        <div className="alert alert-error">
          <AlertTriangle size={20} />
          <div>
            <strong>Transaction Error ({serverError.errorCode}):</strong> {serverError.message}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="card-title">
          <FilePlus2 size={20} color="#2563eb" />
          Cadastral and Title Information
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Parcel ID <span className="required">*</span>
              </label>
              <input
                type="text"
                name="parcelId"
                placeholder="e.g. TN-CHN-001"
                className={`form-input ${errors.parcelId ? 'invalid' : ''}`}
                value={formData.parcelId}
                onChange={handleChange}
              />
              {errors.parcelId && <span className="field-error">{errors.parcelId}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Survey Number <span className="required">*</span>
              </label>
              <input
                type="text"
                name="surveyNumber"
                placeholder="e.g. 114/2A"
                className={`form-input ${errors.surveyNumber ? 'invalid' : ''}`}
                value={formData.surveyNumber}
                onChange={handleChange}
              />
              {errors.surveyNumber && <span className="field-error">{errors.surveyNumber}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Current Owner ID <span className="required">*</span>
              </label>
              <input
                type="text"
                name="ownerId"
                placeholder="e.g. OWNER-001"
                className={`form-input ${errors.ownerId ? 'invalid' : ''}`}
                value={formData.ownerId}
                onChange={handleChange}
              />
              {errors.ownerId && <span className="field-error">{errors.ownerId}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Current Owner Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="ownerName"
                placeholder="e.g. Ravi Kumar"
                className={`form-input ${errors.ownerName ? 'invalid' : ''}`}
                value={formData.ownerName}
                onChange={handleChange}
              />
              {errors.ownerName && <span className="field-error">{errors.ownerName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Property Type</label>
              <select
                name="propertyType"
                className="form-select"
                value={formData.propertyType}
                onChange={handleChange}
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Agricultural">Agricultural</option>
                <option value="Institutional">Institutional</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Document Hash (Off-Chain Deed Proof) <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="documentHash"
                  placeholder="e.g. 4b2e7c9a11d3"
                  className={`form-input ${errors.documentHash ? 'invalid' : ''}`}
                  value={formData.documentHash}
                  onChange={handleChange}
                  style={{ width: '100%' }}
                />
              </div>
              {errors.documentHash && <span className="field-error">{errors.documentHash}</span>}
            </div>

            <div className="form-group full-width">
              <label className="form-label">Authorizing Officer ID</label>
              <input
                type="text"
                name="officerId"
                placeholder="OFFICER-001"
                className="form-input"
                value={formData.officerId}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="reset"
              className="btn btn-secondary"
              onClick={() => {
                setFormData({
                  parcelId: '',
                  surveyNumber: '',
                  ownerId: '',
                  ownerName: '',
                  propertyType: 'Residential',
                  documentHash: '',
                  officerId: 'OFFICER-001'
                });
                setErrors({});
                setServerError(null);
                setSuccessResult(null);
              }}
            >
              Clear
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Hash size={16} />
              {loading ? 'Submitting to Hyperledger Fabric...' : 'Register on Blockchain'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
