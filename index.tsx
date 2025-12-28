import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

// Declare jspdf and html2canvas on the window object for TypeScript.
declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

interface InvoiceItem {
  name: string;
  type: string;
  amount: number | string;
}

interface Invoice {
  title: string;
  logo: string;
  from: {
    name: string;
    address: string;
    email: string;
    phone: string;
  };
  to: {
    company: string;
    address: string;
    email: string;
  };
  meta: {
    invoiceNumber: string;
    date: string;
    servicePeriod: string;
  };
  items: InvoiceItem[];
  currency: string;
  total: number;
  bank: {
    name: string;
    accountTitle: string;
    accountNumber: string;
    iban: string;
    swift: string;
    address: string;
  };
  footerNote: string;
}

interface InvoicePreviewProps {
  invoice: Invoice;
  formatCurrency: (amount: number | string) => string;
}


const App = () => {
  const initialInvoiceState: Invoice = {
    title: 'INVOICE',
    logo: '',
    from: {
      name: 'Your Company',
      address: '123 Street, City, Country',
      email: 'company@example.com',
      phone: '+1 234 567 890',
    },
    to: {
      company: "Client's Company",
      address: '456 Avenue, City, Country',
      email: 'client@example.com',
    },
    meta: {
      invoiceNumber: `INV-${new Date().getFullYear()}-001`,
      date: new Date().toISOString().split('T')[0],
      servicePeriod: '',
    },
    items: [{
      name: 'Website Design & Development',
      type: 'Web Development',
      amount: 5000.00
    }],
    currency: 'PKR',
    total: 5000.00,
    bank: {
      name: 'Example Bank',
      accountTitle: 'Your Company LLC',
      accountNumber: '1234567890',
      iban: 'EX1234567890',
      swift: 'EXAMPBK',
      address: 'Bank Address, City, Country',
    },
    footerNote: 'Thank you for your business!',
  };

  const [invoice, setInvoice] = useState<Invoice>(initialInvoiceState);
  const invoicePreviewRef = useRef<HTMLDivElement>(null);
  
  const currencySymbols = {
    PKR: '₨',
    MYR: 'RM',
  };

  useEffect(() => {
    const newTotal = invoice.items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    setInvoice(prev => ({ ...prev, total: newTotal }));
  }, [invoice.items]);

  const handleInputChange = (section, field, value) => {
    setInvoice(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleMetaChange = (field, value) => {
    setInvoice(prev => ({
      ...prev,
      meta: { ...prev.meta, [field]: value },
    }));
  };
  
  const handleItemChange = (index, field, value) => {
    const newItems = [...invoice.items];
    newItems[index][field] = value;
    setInvoice(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, { name: '', type: '', amount: 0 }],
    }));
  };

  const removeItem = (index) => {
    const newItems = invoice.items.filter((_, i) => i !== index);
    setInvoice(prev => ({ ...prev, items: newItems }));
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInvoice(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    const input = invoicePreviewRef.current;
    if (!input) {
      console.error("Preview element not found for PDF generation.");
      return;
    }

    window.scrollTo(0, 0);

    window.html2canvas(input, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'in',
            format: 'a4'
        });

        const margin = 0.5; // 0.5 inch margin
        const pdfWidth = pdf.internal.pageSize.getWidth() - (margin * 2);
        const pdfHeight = pdf.internal.pageSize.getHeight() - (margin * 2);
        
        const canvasAspectRatio = canvas.width / canvas.height;

        let imgWidth = pdfWidth;
        let imgHeight = imgWidth / canvasAspectRatio;

        if (imgHeight > pdfHeight) {
            imgHeight = pdfHeight;
            imgWidth = imgHeight * canvasAspectRatio;
        }
        
        const xOffset = margin + (pdfWidth - imgWidth) / 2;
        const yOffset = margin;

        pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
        pdf.save(`invoice-${invoice.meta.invoiceNumber}.pdf`);
    }).catch(err => {
        console.error("Failed to generate PDF:", err);
    });
  };

  const handleReset = () => {
    setInvoice(initialInvoiceState);
  };
  
  const formatCurrency = (amount: number | string) => {
     return `${currencySymbols[invoice.currency]} ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return (
    <div className="app-container">
      <InvoiceForm 
        invoice={invoice} 
        onInputChange={handleInputChange} 
        onMetaChange={handleMetaChange}
        onItemChange={handleItemChange} 
        onAddItem={addItem} 
        onRemoveItem={removeItem}
        onLogoUpload={handleLogoUpload}
        onDownload={handleDownload}
        onReset={handleReset}
        setInvoice={setInvoice}
      />
      <InvoicePreview 
        ref={invoicePreviewRef} 
        invoice={invoice} 
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

const InvoiceForm = ({ invoice, onInputChange, onMetaChange, onItemChange, onAddItem, onRemoveItem, onLogoUpload, onDownload, onReset, setInvoice }) => {
  return (
    <div className="invoice-form">
      <h1>Invoice Builder</h1>
      
      <div className="form-grid">
         <div className="form-group full-width">
            <label>Invoice Title</label>
            <input type="text" value={invoice.title} onChange={(e) => setInvoice(prev => ({...prev, title: e.target.value}))} />
         </div>
      </div>
      
      <h2>Company / Sender</h2>
      <div className="form-grid">
        <div className="form-group">
          <label>Logo</label>
          <div className="logo-upload-wrapper">
             <button className="logo-upload-btn">Upload Logo</button>
             <input type="file" accept="image/*" onChange={onLogoUpload} />
          </div>
        </div>
        <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={invoice.from.name} onChange={(e) => onInputChange('from', 'name', e.target.value)} />
        </div>
        <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={invoice.from.email} onChange={(e) => onInputChange('from', 'email', e.target.value)} />
        </div>
        <div className="form-group">
            <label>Contact Number</label>
            <input type="text" value={invoice.from.phone} onChange={(e) => onInputChange('from', 'phone', e.target.value)} />
        </div>
        <div className="form-group full-width">
            <label>Address</label>
            <textarea value={invoice.from.address} onChange={(e) => onInputChange('from', 'address', e.target.value)} />
        </div>
      </div>
      
      <h2>Client / Billed To</h2>
      <div className="form-grid">
        <div className="form-group">
          <label>Company Name</label>
          <input type="text" value={invoice.to.company} onChange={(e) => onInputChange('to', 'company', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" value={invoice.to.email} onChange={(e) => onInputChange('to', 'email', e.target.value)} />
        </div>
        <div className="form-group full-width">
          <label>Address</label>
          <textarea value={invoice.to.address} onChange={(e) => onInputChange('to', 'address', e.target.value)} />
        </div>
      </div>
      
      <h2>Invoice Details</h2>
       <div className="form-grid">
        <div className="form-group">
          <label>Invoice Number</label>
          <input type="text" value={invoice.meta.invoiceNumber} onChange={(e) => onMetaChange('invoiceNumber', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Invoice Date</label>
          <input type="date" value={invoice.meta.date} onChange={(e) => onMetaChange('date', e.target.value)} />
        </div>
        <div className="form-group full-width">
          <label>Service Period</label>
          <input type="text" value={invoice.meta.servicePeriod} onChange={(e) => onMetaChange('servicePeriod', e.target.value)} />
        </div>
      </div>

      <h2>Items</h2>
      <table className="items-table">
        <thead>
          <tr>
            <th>Project / Service Name</th>
            <th>Service Type</th>
            <th>Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={index} className="item-row">
              <td><input type="text" value={item.name} onChange={(e) => onItemChange(index, 'name', e.target.value)} /></td>
              <td><input type="text" value={item.type} onChange={(e) => onItemChange(index, 'type', e.target.value)} /></td>
              <td><input type="number" value={item.amount} onChange={(e) => onItemChange(index, 'amount', e.target.value)} /></td>
              <td><button className="remove-item-btn" onClick={() => onRemoveItem(index)}>×</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="add-item-btn" onClick={onAddItem}>+ Add Item</button>
      
      <h2>Bank Details</h2>
      <div className="form-grid">
         <div className="form-group"><label>Bank Name<span className="mandatory-star">*</span></label><input type="text" value={invoice.bank.name} onChange={(e) => onInputChange('bank', 'name', e.target.value)} /></div>
         <div className="form-group"><label>Account Title<span className="mandatory-star">*</span></label><input type="text" value={invoice.bank.accountTitle} onChange={(e) => onInputChange('bank', 'accountTitle', e.target.value)} /></div>
         <div className="form-group"><label>Account Number</label><input type="text" value={invoice.bank.accountNumber} onChange={(e) => onInputChange('bank', 'accountNumber', e.target.value)} /></div>
         <div className="form-group"><label>IBAN<span className="mandatory-star">*</span></label><input type="text" value={invoice.bank.iban} onChange={(e) => onInputChange('bank', 'iban', e.target.value)} /></div>
         <div className="form-group"><label>SWIFT/BIC Code</label><input type="text" value={invoice.bank.swift} onChange={(e) => onInputChange('bank', 'swift', e.target.value)} /></div>
         <div className="form-group full-width"><label>Bank Address</label><textarea value={invoice.bank.address} onChange={(e) => onInputChange('bank', 'address', e.target.value)} /></div>
      </div>
      
      <h2>Settings</h2>
        <div className="form-grid">
            <div className="form-group">
                <label>Currency</label>
                <select value={invoice.currency} onChange={(e) => setInvoice(prev => ({...prev, currency: e.target.value}))}>
                    <option value="PKR">PKR (Pakistani Rupee)</option>
                    <option value="MYR">MYR (Malaysian Ringgit)</option>
                </select>
            </div>
             <div className="form-group full-width">
              <label>Footer Note</label>
              <textarea value={invoice.footerNote} onChange={(e) => setInvoice(prev => ({...prev, footerNote: e.target.value}))} />
          </div>
        </div>

      <div className="action-buttons">
          <button className="action-btn secondary" onClick={onReset}>Reset Invoice</button>
          <button className="action-btn" onClick={onDownload}>Download PDF</button>
      </div>
    </div>
  );
};


const InvoicePreview = React.forwardRef<HTMLDivElement, InvoicePreviewProps>(({ invoice, formatCurrency }, ref) => {
  return (
    <div className="invoice-preview-container">
      <div id="invoice-preview" ref={ref}>
        <header className="preview-header">
          <div>{invoice.logo && <img src={invoice.logo} alt="Company Logo" className="logo" />}</div>
          <h1>{invoice.title}</h1>
        </header>
        
        <section className="preview-parties">
          <div>
            <h3>FROM</h3>
            <p><strong>{invoice.from.name}</strong></p>
            <p>{invoice.from.address}</p>
            <p>{invoice.from.email}</p>
            <p>{invoice.from.phone}</p>
          </div>
          <div>
            <h3>TO</h3>
            <p><strong>{invoice.to.company}</strong></p>
            <p>{invoice.to.address}</p>
            <p>{invoice.to.email}</p>
          </div>
        </section>

        <section className="preview-meta">
           <div><p><strong>Invoice #:</strong> {invoice.meta.invoiceNumber}</p></div>
           <div><p><strong>Date:</strong> {invoice.meta.date}</p></div>
           {invoice.meta.servicePeriod && <div><p><strong>Service Period:</strong> {invoice.meta.servicePeriod}</p></div>}
        </section>

        <section className="preview-items">
          <table className="preview-items-table">
            <thead>
              <tr>
                <th>Project / Service</th>
                <th>Type</th>
                <th className="amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.type}</td>
                  <td className="amount">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        
        <section className="preview-total">
           <div className="total-line">
               <p>{invoice.currency === 'PKR' ? `Total Amount (${invoice.currency}):` : 'Total:'}</p>
               <span>{formatCurrency(invoice.total)}</span>
           </div>
        </section>

        <section className="preview-bank-details">
          <h3>Bank Details</h3>
          <p><strong>Bank:</strong> {invoice.bank.name}</p>
          <p><strong>Account Title:</strong> {invoice.bank.accountTitle}</p>
          <p><strong>IBAN:</strong> {invoice.bank.iban}</p>
          {invoice.bank.accountNumber && <p><strong>Account Number:</strong> {invoice.bank.accountNumber}</p>}
          {invoice.bank.swift && <p><strong>SWIFT/BIC:</strong> {invoice.bank.swift}</p>}
          {invoice.bank.address && <p><strong>Address:</strong> {invoice.bank.address}</p>}
        </section>

        <footer className="preview-footer">
          <p>{invoice.footerNote}</p>
        </footer>
      </div>
    </div>
  );
});

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);