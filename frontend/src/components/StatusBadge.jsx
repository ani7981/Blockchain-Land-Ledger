import React from 'react';

export function TitleStatusBadge({ status }) {
  if (status === 'ACTIVE') {
    return <span className="badge badge-active">Active Title</span>;
  }
  if (status === 'DISPUTED') {
    return <span className="badge badge-disputed">Disputed Title</span>;
  }
  return <span className="badge badge-none">{status || 'UNKNOWN'}</span>;
}

export function TransferStatusBadge({ status }) {
  switch (status) {
    case 'NONE':
      return <span className="badge badge-none">No Pending Transfer</span>;
    case 'PENDING':
      return <span className="badge badge-pending">Pending Officer Review</span>;
    case 'APPROVED':
      return <span className="badge badge-approved">Transfer Approved</span>;
    case 'REJECTED':
      return <span className="badge badge-rejected">Transfer Rejected</span>;
    default:
      return <span className="badge badge-none">{status || 'NONE'}</span>;
  }
}
