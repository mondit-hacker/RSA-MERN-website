import { useRef } from 'react';
import './FeeSlip.css';

/**
 * FeeSlip — printable fee receipt for Rise & Shine Academy
 * Props: student (object), fee (FeeRecord object), onClose
 */
export default function FeeSlip({ student, fee, onClose }) {
  const slipRef = useRef(null);

  function handlePrint() {
    const content = slipRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=800,height=900');
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fee Receipt — ${student?.admissionNo || ''}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Arial', sans-serif; background: #fff; color: #000; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
          .slip-outer { width: 750px; margin: 20px auto; border: 2px solid #0B1F3A; border-radius: 8px; overflow: hidden; }
          .slip-header { background: #0B1F3A; color: #fff; padding: 20px 24px; display: flex; align-items: center; gap: 18px; }
          .slip-logo { width: 64px; height: 64px; background: #fff; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
          .slip-logo img { width: 58px; height: 58px; object-fit: contain; }
          .slip-school-name { font-size: 1.4rem; font-weight: 800; letter-spacing: .02em; }
          .slip-school-tag  { font-size: .8rem; color: #C9A84C; font-weight: 600; margin-top: 2px; }
          .slip-school-addr { font-size: .72rem; color: rgba(255,255,255,.55); margin-top: 4px; }
          .slip-gold-bar { height: 4px; background: linear-gradient(90deg, #C9A84C 0%, #E8C96A 50%, #C9A84C 100%); }
          .slip-title { background: #F8FAFC; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E2E8F0; }
          .slip-title h2 { font-size: 1rem; font-weight: 800; color: #0B1F3A; text-transform: uppercase; letter-spacing: .1em; }
          .slip-receipt-no { font-size: .8rem; color: #64748B; font-weight: 600; }
          .slip-body { padding: 20px 24px; }
          .slip-section { margin-bottom: 16px; }
          .slip-section-title { font-size: .7rem; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: .12em; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #E2E8F0; }
          .slip-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .slip-field { }
          .slip-field-label { font-size: .68rem; color: #64748B; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 2px; }
          .slip-field-value { font-size: .9rem; color: #0B1F3A; font-weight: 600; }
          .slip-amount-box { background: #0B1F3A; border-radius: 8px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; margin: 16px 0; }
          .slip-amount-label { color: #C9A84C; font-size: .8rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; }
          .slip-amount-value { color: #fff; font-size: 1.8rem; font-weight: 900; }
          .slip-fee-table { width: 100%; border-collapse: collapse; font-size: .87rem; }
          .slip-fee-table th { background: #F1F5F9; padding: 8px 12px; text-align: left; font-size: .72rem; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: .08em; border: 1px solid #E2E8F0; }
          .slip-fee-table td { padding: 9px 12px; border: 1px solid #E2E8F0; color: #1E293B; }
          .slip-fee-table tr:last-child td { background: #F8FAFC; font-weight: 700; }
          .slip-status-paid { display: inline-block; background: #DCFCE7; color: #15803D; padding: 3px 12px; border-radius: 999px; font-size: .78rem; font-weight: 700; }
          .slip-status-pending { display: inline-block; background: #FEF9C3; color: #92400E; padding: 3px 12px; border-radius: 999px; font-size: .78rem; font-weight: 700; }
          .slip-footer { background: #F8FAFC; padding: 14px 24px; border-top: 1px solid #E2E8F0; display: flex; justify-content: space-between; align-items: flex-end; }
          .slip-signature { text-align: center; }
          .slip-sig-line { width: 160px; height: 1px; background: #0B1F3A; margin: 40px auto 4px; }
          .slip-sig-label { font-size: .72rem; color: #64748B; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; }
          .slip-watermark { font-size: .7rem; color: #94A3B8; text-align: right; }
          .slip-note { font-size: .72rem; color: #64748B; background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 6px; padding: 8px 12px; margin-top: 12px; }
        </style>
      </head>
      <body>${content}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  }

  const receiptNo = fee?.receiptNo || `RSA-${Date.now().toString().slice(-8)}`;
  const printDate = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' });
  const statusClass = fee?.status === 'paid' ? 'slip-status-paid' : 'slip-status-pending';

  return (
    <div className="fee-slip-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fee-slip-modal">
        <div className="fee-slip-modal-header">
          <h3><i className="fa-solid fa-receipt" /> Fee Receipt</h3>
          <div style={{ display:'flex', gap:'8px' }}>
            <button className="fee-slip-btn-print" onClick={handlePrint}>
              <i className="fa-solid fa-print" /> Print / Save PDF
            </button>
            <button className="fee-slip-btn-close" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Printable Slip */}
        <div ref={slipRef}>
          <div className="slip-outer">
            {/* Header */}
            <div className="slip-header">
              <div className="slip-logo">
                <img src={`${window.location.origin}/assets/logo.png`} alt="RSA Logo" />
              </div>
              <div>
                <div className="slip-school-name">Rise &amp; Shine Academy</div>
                <div className="slip-school-tag">Excellence in Education</div>
                <div className="slip-school-addr">
                  Station Road, Harish Chandra Pur, Malda, WB — 732125 &nbsp;|&nbsp;
                  Near NH-12, Kashim Pur, Malda, WB
                </div>
              </div>
            </div>
            <div className="slip-gold-bar" />

            {/* Receipt Title */}
            <div className="slip-title">
              <h2>Fee Payment Receipt</h2>
              <div>
                <div className="slip-receipt-no">Receipt No: <strong>{receiptNo}</strong></div>
                <div className="slip-receipt-no" style={{ marginTop:'3px' }}>Date: <strong>{printDate}</strong></div>
              </div>
            </div>

            <div className="slip-body">
              {/* Student Info */}
              <div className="slip-section">
                <div className="slip-section-title">Student Information</div>
                <div className="slip-grid">
                  <div className="slip-field"><div className="slip-field-label">Student Name</div><div className="slip-field-value">{student?.user?.firstName} {student?.user?.lastName}</div></div>
                  <div className="slip-field"><div className="slip-field-label">Admission No</div><div className="slip-field-value">{student?.admissionNo || '—'}</div></div>
                  <div className="slip-field"><div className="slip-field-label">Programme</div><div className="slip-field-value">{student?.programme || '—'}</div></div>
                  <div className="slip-field"><div className="slip-field-label">Grade / Section</div><div className="slip-field-value">{student?.grade}{student?.section || ''}</div></div>
                  <div className="slip-field"><div className="slip-field-label">Academic Year</div><div className="slip-field-value">{fee?.academicYear || '—'}</div></div>
                  <div className="slip-field"><div className="slip-field-label">Campus</div><div className="slip-field-value">{student?.campus === 'hcpur' ? 'Harish Chandra Pur' : 'Kashim Pur'}</div></div>
                  <div className="slip-field"><div className="slip-field-label">Parent Email</div><div className="slip-field-value">{student?.father?.email || student?.mother?.email || student?.user?.email || '—'}</div></div>
                  <div className="slip-field"><div className="slip-field-label">Parent Phone</div><div className="slip-field-value">{student?.father?.phone || student?.mother?.phone || '—'}</div></div>
                </div>
              </div>

              {/* Fee Details */}
              <div className="slip-section">
                <div className="slip-section-title">Fee Details</div>
                <table className="slip-fee-table">
                  <thead>
                    <tr><th>Description</th><th>Month</th><th>Amount (₹)</th><th>Discount (₹)</th><th>Paid (₹)</th><th>Balance (₹)</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{student?.programme || 'Tuition'} Fee</td>
                      <td>{fee?.month || '—'}</td>
                      <td>₹{fee?.amount || 0}</td>
                      <td>₹{fee?.discount || 0}</td>
                      <td>₹{fee?.paid || 0}</td>
                      <td>₹{fee?.balance || 0}</td>
                    </tr>
                    <tr>
                      <td><strong>Total</strong></td>
                      <td></td>
                      <td><strong>₹{fee?.amount || 0}</strong></td>
                      <td><strong>₹{fee?.discount || 0}</strong></td>
                      <td><strong>₹{fee?.paid || 0}</strong></td>
                      <td><strong>₹{fee?.balance || 0}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Amount Box */}
              <div className="slip-amount-box">
                <div><div className="slip-amount-label">Amount Paid</div><div style={{color:'rgba(255,255,255,.6)',fontSize:'.75rem',marginTop:'3px'}}>Payment Mode: {fee?.paymentMode || 'Cash'}</div></div>
                <div><div className="slip-amount-value">₹{(fee?.paid || 0).toLocaleString('en-IN')}</div><span className={statusClass} style={{marginTop:'4px',display:'block',textAlign:'right'}}>{fee?.status}</span></div>
              </div>

              <div className="slip-note">
                * This is a computer-generated receipt and is valid without a physical signature. Please retain this receipt for your records. For any queries, contact the school office.
              </div>
            </div>

            {/* Footer */}
            <div className="slip-footer">
              <div>
                <div className="slip-signature">
                  <div className="slip-sig-line" />
                  <div className="slip-sig-label">Authorised Signatory</div>
                </div>
              </div>
              <div className="slip-signature" style={{textAlign:'center'}}>
                <div className="slip-sig-line" />
                <div className="slip-sig-label">Parent / Guardian Signature</div>
              </div>
              <div className="slip-watermark">
                <div style={{fontSize:'.85rem',fontWeight:700,color:'#0B1F3A'}}>Rise &amp; Shine Academy</div>
                <div>Printed: {printDate}</div>
                <div>Receipt: {receiptNo}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
