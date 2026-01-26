import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload as UploadIcon, FileText, Table, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '../lib/firebase';
import { writeBatch, doc, collection, getDoc } from 'firebase/firestore';

export default function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uid', user.uid); // Pass UID for backend

      // 1. Upload and Parse on Backend
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const invoices = response.data.invoices;
        
        // 2. Save to Firestore from Frontend (Authenticated)
        const batch = writeBatch(db);
        const userRef = doc(db, 'users', user.uid);
        
        // Get business name
        const userDoc = await getDoc(userRef);
        const businessName = userDoc.exists() ? userDoc.data().businessName : 'Medi Payment';

        invoices.forEach((inv) => {
          const docRef = doc(collection(userRef, 'invoices'), inv.invoiceNumber || Math.random().toString(36).substr(2, 9));
          batch.set(docRef, { ...inv, businessName, uploadedAt: new Date().toISOString() });
        });

        await batch.commit();

        toast.success(`Successfully uploaded ${invoices.length} invoices!`);
        navigate('/invoices');
      } else {
        throw new Error(response.data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Upload Invoices</h1>
        <p className="text-slate-500">Upload your invoice files (PDF or Excel) to automatically extract data.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg p-12 hover:bg-slate-50 transition-colors">
              <div className="bg-blue-50 p-4 rounded-full mb-4">
                <UploadIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Select File to Upload</h3>
              <p className="text-sm text-slate-500 text-center mb-6">
                Support for PDF and Excel files
              </p>
              <Input
                type="file"
                className="hidden"
                id="file-upload"
                accept=".pdf,.xlsx,.xls"
                onChange={handleFileChange}
              />
              <Label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Choose File
              </Label>
              {file && (
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                  {file.name.endsWith('.pdf') ? <FileText className="h-4 w-4" /> : <Table className="h-4 w-4" />}
                  {file.name}
                </div>
              )}
            </div>

            <Button 
              className="w-full" 
              onClick={handleUpload} 
              disabled={!file || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Upload and Process'
              )}
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-slate-50 border-none">
          <h3 className="font-semibold text-slate-900 mb-4">Parsing Instructions</h3>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2" />
              Ensure your Excel file has headers like "Invoice Number", "Date", "Amount", "Buyer".
            </li>
            <li className="flex gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2" />
              For PDF files, ensure the text is selectable (not scanned images).
            </li>
            <li className="flex gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2" />
              The system will automatically extract buyer name, phone number, and invoice details.
            </li>
            <li className="flex gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2" />
              Parsed invoices will appear in the "Invoices" tab.
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
