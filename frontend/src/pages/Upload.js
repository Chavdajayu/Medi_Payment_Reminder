import React, { useState } from 'react';
import axios from 'axios'; // Keep for compatibility if needed, but mostly unused
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload as UploadIcon, FileText, Table, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { storage } from '../lib/storage';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Upload() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [importing, setImporting] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
      if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.pdf') || selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
      } else {
        toast.error('Please upload a PDF or Excel file');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);

    // Check file type
    if (file.name.endsWith('.pdf')) {
      toast.error('PDF parsing is not supported in offline mode. Please use Excel.');
      setUploading(false);
      return;
    }

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Array of arrays

      // Basic parsing logic (assuming headers in first row)
      if (jsonData.length === 0) {
        throw new Error('Empty file');
      }

      const headers = jsonData[0].map(h => (h || '').toString().toLowerCase());
      const rows = jsonData.slice(1);
      
      const invoices = [];
      
      rows.forEach((row) => {
        if (row.length === 0) return;
        
        // Map columns (simple heuristic)
        const getCol = (keywords) => {
          const index = headers.findIndex(h => keywords.some(k => h.includes(k)));
          return index !== -1 ? row[index] : null;
        };

        const invoice = {
          invoice_number: getCol(['invoice', 'bill', 'number']),
          retailer_name: getCol(['retailer', 'party', 'customer', 'name']),
          retailer_phone: getCol(['phone', 'mobile', 'contact']),
          amount: getCol(['amount', 'total', 'grand']),
          invoice_date: getCol(['date', 'invoice date']),
          due_date: getCol(['due', 'expiry']),
          payment_status: 'unpaid' // Default
        };
        
        // Basic validation and formatting
        if (invoice.invoice_number && invoice.retailer_name) {
          // Format dates (Excel dates are numbers)
          if (typeof invoice.invoice_date === 'number') {
            invoice.invoice_date = new Date(Math.round((invoice.invoice_date - 25569)*86400*1000)).toISOString().split('T')[0];
          }
          if (typeof invoice.due_date === 'number') {
            invoice.due_date = new Date(Math.round((invoice.due_date - 25569)*86400*1000)).toISOString().split('T')[0];
          }
          
          // Ensure string for phone
          if (invoice.retailer_phone) {
             invoice.retailer_phone = invoice.retailer_phone.toString();
          }

          invoices.push(invoice);
        }
      });

      if (invoices.length === 0) {
        toast.warning('No valid invoices found in the file.');
      } else {
        setParsedData({ invoices });
        toast.success(`Parsed ${invoices.length} invoices successfully!`);
      }

    } catch (error) {
      console.error(error);
      toast.error('Failed to parse file. Please check format.');
    } finally {
      setUploading(false);
    }
  };

  const handleImport = async () => {
    if (!parsedData || !parsedData.invoices) return;

    setImporting(true);
    try {
      // Save to storage
      parsedData.invoices.forEach(inv => {
        storage.saveInvoice(inv);
      });
      
      toast.success('Data imported successfully!');
      navigate('/retailers');
    } catch (error) {
      console.error(error);
      toast.error('Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleEditInvoice = (index, field, value) => {
    const updated = { ...parsedData };
    updated.invoices[index][field] = value;
    setParsedData(updated);
  };

  return (
    <div data-testid="upload-page">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Upload Data</h1>
        <p className="text-sm text-slate-600 mt-2">Upload PDF or Excel file to import invoice data</p>
      </div>

      {!parsedData ? (
        <Card className="p-8" data-testid="upload-card">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-6">
              <UploadIcon className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Upload Invoice File</h3>
              <p className="text-sm text-slate-600">Supported formats: PDF, Excel (.xlsx, .xls)</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="file" data-testid="file-input-label">Select File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.xlsx,.xls"
                  onChange={handleFileChange}
                  data-testid="file-input"
                  className="mt-2"
                />
              </div>

              {file && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FileText className="w-4 h-4" />
                  <span>{file.name}</span>
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full"
                data-testid="upload-button"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  <>
                    <UploadIcon className="w-4 h-4 mr-2" />
                    Upload & Parse
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="p-6" data-testid="preview-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Preview Data</h3>
                <p className="text-sm text-slate-600">Review and edit before importing</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setParsedData(null)} data-testid="cancel-button">
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={importing} data-testid="import-button">
                  {importing ? 'Importing...' : 'Import Data'}
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-slate-900 mb-3">Retailers ({parsedData.retailers.length})</h4>
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                {parsedData.retailers.map((retailer, i) => (
                  <div key={i} className="flex items-center gap-4 text-sm">
                    <span className="font-medium text-slate-700">{retailer.retailer_name}</span>
                    <span className="text-slate-500">{retailer.retailer_phone}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 mb-3">Invoices ({parsedData.invoices.length})</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="invoices-table">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left p-3 font-medium text-slate-500">Invoice #</th>
                      <th className="text-left p-3 font-medium text-slate-500">Phone</th>
                      <th className="text-left p-3 font-medium text-slate-500">Amount</th>
                      <th className="text-left p-3 font-medium text-slate-500">Invoice Date</th>
                      <th className="text-left p-3 font-medium text-slate-500">Due Date</th>
                      <th className="text-left p-3 font-medium text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.invoices.map((invoice, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3">{invoice.invoice_number}</td>
                        <td className="p-3">{invoice.retailer_phone}</td>
                        <td className="p-3">₹{invoice.amount.toLocaleString()}</td>
                        <td className="p-3">{invoice.invoice_date}</td>
                        <td className="p-3">{invoice.due_date}</td>
                        <td className="p-3">
                          <select
                            value={invoice.payment_status}
                            onChange={(e) => handleEditInvoice(i, 'payment_status', e.target.value)}
                            className="border border-slate-200 rounded px-2 py-1 text-sm"
                            data-testid={`invoice-status-${i}`}
                          >
                            <option value="unpaid">Unpaid</option>
                            <option value="paid">Paid</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
