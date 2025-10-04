import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Mail, Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';

const EmailReportDialog = ({ trigger, reportFile, reportFileName }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailData, setEmailData] = useState({
    to: user?.companyEmail || '', // Assuming user might have a company email stored
    subject: `WorkTrack Time Report - ${reportFileName || 'Untitled'}`,
    body: `Dear HR,

Please find attached my time report generated from WorkTrack.

Best regards,
${user?.firstName} ${user?.lastName}`,
  });

  const handleInputChange = (field, value) => {
    setEmailData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    // In a real application, you would send the email via a backend API.
    // For this demo, we'll simulate the action and log the data.
    console.log('Sending email with data:', emailData);
    console.log('Attached report file:', reportFile, reportFileName);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setLoading(false);
    setOpen(false);
    alert('Email simulated: Report sent successfully!');
    // In a real app, you might show a toast notification
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Mail className="w-4 h-4" />
            Email to HR
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Report
          </DialogTitle>
          <DialogDescription>
            Send your generated time report directly to HR.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSendEmail} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              type="email"
              value={emailData.to}
              onChange={(e) => handleInputChange('to', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              type="text"
              value={emailData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Body</Label>
            <Textarea
              id="body"
              value={emailData.body}
              onChange={(e) => handleInputChange('body', e.target.value)}
              rows={8}
            />
          </div>
          {reportFileName && (
            <div className="text-sm text-muted-foreground">
              Attached: <strong>{reportFileName}</strong>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !reportFile}>
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
              ) : (
                <><Send className="mr-2 h-4 w-4" /> Send Email</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmailReportDialog;

