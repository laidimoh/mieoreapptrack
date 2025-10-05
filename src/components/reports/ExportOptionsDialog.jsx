import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Separator } from '@/components/ui/separator.jsx';
import { FileText, Download, Eye, EyeOff } from 'lucide-react';

const ExportOptionsDialog = ({ 
  trigger,
  onExport, 
  exportType = 'pdf'
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState({
    includeStartEndTimes: true,
    includeBreakTime: true,
    includeTotalHours: true,
    includeExtraHours: true,
    includeEarnings: true,
    includeCompanyHeader: true,
    includeWorkerInfo: true,
    includeSummary: true
  });

  const handleOptionChange = (optionKey, checked) => {
    setOptions(prev => ({
      ...prev,
      [optionKey]: checked
    }));
  };

  const handleExport = () => {
    onExport(options);
    setOpen(false);
  };

  const isValid = options.includeTotalHours || options.includeStartEndTimes;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Export Options
          </DialogTitle>
          <DialogDescription>
            Choose what information to include in your {exportType.toUpperCase()} export.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Header Information
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="companyHeader"
                  checked={options.includeCompanyHeader}
                  onCheckedChange={(checked) => handleOptionChange('includeCompanyHeader', checked)}
                />
                <Label htmlFor="companyHeader" className="text-sm font-normal">
                  Company name and title
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="workerInfo"
                  checked={options.includeWorkerInfo}
                  onCheckedChange={(checked) => handleOptionChange('includeWorkerInfo', checked)}
                />
                <Label htmlFor="workerInfo" className="text-sm font-normal">
                  Worker information
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Time Data
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="startEndTimes"
                  checked={options.includeStartEndTimes}
                  onCheckedChange={(checked) => handleOptionChange('includeStartEndTimes', checked)}
                />
                <Label htmlFor="startEndTimes" className="text-sm font-normal">
                  Start & End times
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="breakTime"
                  checked={options.includeBreakTime}
                  onCheckedChange={(checked) => handleOptionChange('includeBreakTime', checked)}
                />
                <Label htmlFor="breakTime" className="text-sm font-normal">
                  Break duration
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="totalHours"
                  checked={options.includeTotalHours}
                  onCheckedChange={(checked) => handleOptionChange('includeTotalHours', checked)}
                />
                <Label htmlFor="totalHours" className="text-sm font-normal">
                  Total hours
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="extraHours"
                  checked={options.includeExtraHours}
                  onCheckedChange={(checked) => handleOptionChange('includeExtraHours', checked)}
                />
                <Label htmlFor="extraHours" className="text-sm font-normal">
                  Extra hours
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Financial Information
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="earnings"
                  checked={options.includeEarnings}
                  onCheckedChange={(checked) => handleOptionChange('includeEarnings', checked)}
                />
                <Label htmlFor="earnings" className="text-sm font-normal">
                  Earnings calculation
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="summary"
                  checked={options.includeSummary}
                  onCheckedChange={(checked) => handleOptionChange('includeSummary', checked)}
                />
                <Label htmlFor="summary" className="text-sm font-normal">
                  Summary section
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={!isValid}>
            <Download className="w-4 h-4 mr-2" />
            Export {exportType.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportOptionsDialog;
