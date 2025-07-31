// Data Collection Modal - Main modal for collecting pillar data
// Dynamically renders form based on questions with conditional logic

import { useEffect } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { useDataCollection } from '@/hooks/useDataCollection';
import { FieldRenderer } from './fields/FieldRenderer';
import { DataCollectionModalProps } from '@/types/dataCollection';
import { cn } from '@/lib/utils';

export const DataCollectionModal = ({
  isOpen,
  onClose,
  pillar,
  selectedDate,
  onSuccess
}: DataCollectionModalProps) => {
  const {
    visibleQuestions,
    formData,
    errors,
    isLoading,
    hasExistingData,
    submissionState,
    setValue,
    submitForm,
    loadExistingData
  } = useDataCollection(pillar, selectedDate);

  // Reload data when modal opens (optional since React Query handles caching)
  useEffect(() => {
    if (isOpen) {
      loadExistingData();
    }
  }, [isOpen, loadExistingData]);

  // Handle successful submission
  useEffect(() => {
    if (submissionState === 'success' && onSuccess) {
      onSuccess();
    }
  }, [submissionState, onSuccess]);

  // Get pillar display name
  const getPillarDisplayName = (pillarName: string) => {
    return pillarName.charAt(0).toUpperCase() + pillarName.slice(1);
  };

  // Format date for display
  const formattedDate = format(new Date(selectedDate), 'EEEE, MMMM d, yyyy');

  // Get error for specific field
  const getFieldError = (questionId: string) => {
    return errors.find(error => error.field === questionId)?.message;
  };

  // Get general errors (not field-specific)
  const generalErrors = errors.filter(error => error.field === 'general');

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    await submitForm();
  };

  // Handle close with unsaved changes warning
  const handleClose = () => {
    // Future: Could add unsaved changes warning
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Daily Data Collection - {getPillarDisplayName(pillar)}
          </DialogTitle>
          <DialogDescription>
            Collecting data for {formattedDate}
            {hasExistingData && (
              <span className="flex items-center gap-1 text-green-600 mt-1">
                <CheckCircle className="w-4 h-4" />
                You have already submitted data for this date
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading questions...</span>
          </div>
        )}

        {/* No Questions State */}
        {!isLoading && visibleQuestions.length === 0 && generalErrors.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No questions are configured for the {pillar} pillar.
            </AlertDescription>
          </Alert>
        )}

        {/* Database Connection Error State */}
        {!isLoading && generalErrors.length > 0 && visibleQuestions.length === 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {generalErrors[0].message}
              <br />
              <span className="text-sm mt-2 block">
                Please check your database connection or contact support.
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Form Content */}
        {!isLoading && visibleQuestions.length > 0 && (
          <form id={`data-collection-form-${pillar}`} onSubmit={handleSubmit} className="space-y-6">
            {/* General Errors */}
            {generalErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {generalErrors[0].message}
                </AlertDescription>
              </Alert>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              {visibleQuestions.map((question) => (
                <FieldRenderer
                  key={question.id}
                  question={question}
                  value={formData[question.id]}
                  onChange={(value) => setValue(question.id, value)}
                  error={getFieldError(question.id)}
                  pillar={pillar}
                />
              ))}
            </div>

            {/* Submission Success Message */}
            {submissionState === 'success' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Data saved successfully!
                </AlertDescription>
              </Alert>
            )}
          </form>
        )}

        {/* Footer */}
        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {submissionState === 'submitting' && (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Saving...</span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={submissionState === 'submitting'}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              form={`data-collection-form-${pillar}`}
              disabled={
                isLoading || 
                visibleQuestions.length === 0 || 
                submissionState === 'submitting'
              }
              className={cn(
                submissionState === 'success' && 'bg-green-600 hover:bg-green-700'
              )}
            >
              {submissionState === 'submitting' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : submissionState === 'success' ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {hasExistingData ? 'Update Data' : 'Save Data'}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};