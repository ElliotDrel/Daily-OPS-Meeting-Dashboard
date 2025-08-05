// Post Meeting Workflow page - combines transcript storage and email generation
// Unified workflow for complete post-meeting process

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TranscriptForm } from '@/components/transcript/TranscriptForm';
import { TranscriptCalendar } from '@/components/transcript/TranscriptCalendar';
import { TranscriptDateSelector } from '@/components/transcript/TranscriptDateSelector';
import { UnsavedChangesModal } from '@/components/transcript/UnsavedChangesModal';
import { useTranscriptData } from '@/hooks/useTranscriptData';
import { useTranscriptForm } from '@/hooks/useTranscriptForm';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { useAIGeneration } from '@/hooks/useAIGeneration';
import { useEmailData } from '@/hooks/useEmailData';
import { generateEmail } from '@/utils/emailFormatter';
import { toast } from '@/components/ui/sonner';
import { Copy, ChevronDown, ChevronRight, Check, CheckCircle2, RefreshCw } from 'lucide-react';
import { AIGenerationButton, AIGenerationProgress, AIGenerationError } from '@/components/ai/AIGenerationButton';
import { MeetingNotesApprovalInterface } from '@/components/ai/MeetingNotesApprovalInterface';

export default function PostMeetingWorkflow() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  
  // Email generation state
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [showEmailsPreview, setShowEmailsPreview] = useState(false);
  const [showSubjectPreview, setShowSubjectPreview] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [emailsCopied, setEmailsCopied] = useState(false);
  const [subjectCopied, setSubjectCopied] = useState(false);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
  
  // Data fetching
  const {
    transcript,
    isLoading,
    error,
    refetch
  } = useTranscriptData(dateString);

  // Email data fetching
  const {
    emailData,
    isLoading: isEmailDataLoading,
    error: emailDataError,
    refetch: refetchEmailData
  } = useEmailData(dateString);

  // Form management
  const {
    formData,
    validation,
    isFormDirty,
    saveStatus,
    lastSavedAt,
    showValidationError,
    handleInputChange,
    handleSave,
    handleDelete,
    resetForm,
    isSaving,
    isDeleting,
    canDelete
  } = useTranscriptForm(transcript, dateString);

  // Navigation protection
  const {
    isModalOpen,
    handleSaveAndGo,
    handleDiscard,
    handleCancel,
    protectRouteNavigation,
    protectDateChange,
    protectGenericAction
  } = useUnsavedChanges(isFormDirty);

  // AI Generation management
  const {
    state: aiState,
    generateNotes,
    regenerateAll,
    editContent,
    deleteContent,
    approveAll,
    resetGeneration,
    canGenerate,
    hasExistingData
  } = useAIGeneration(dateString);

  // Protected navigation handlers (consolidated into handleDateChangeWithAIReset)

  const handleBackToDashboard = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    protectRouteNavigation('/');
  }, [protectRouteNavigation]);

  // AI Generation handlers
  const handleAIGeneration = React.useCallback(async () => {
    if (!formData.transcript.trim()) {
      toast.error('Please save transcript content before generating AI notes');
      return;
    }

    try {
      await generateNotes(formData.transcript, formData.additional_notes, dateString);
    } catch (error) {
      console.error('AI generation failed:', error);
      // Error handling is managed by the hook
    }
  }, [formData.transcript, formData.additional_notes, dateString, generateNotes]);

  const handleDateChangeWithAIReset = React.useCallback((date: Date) => {
    const actualChangeHandler = (newDate: Date) => {
      setSelectedDate(newDate);
      resetForm();
      resetGeneration(); // Reset AI generation state when changing dates
    };
    
    protectDateChange(date, actualChangeHandler);
  }, [resetForm, resetGeneration, protectDateChange]);

  // Handle regenerate confirmation
  const handleRegenerateConfirm = React.useCallback(async () => {
    setRegenerateDialogOpen(false);
    await regenerateAll(formData.transcript, formData.additional_notes);
  }, [regenerateAll, formData.transcript, formData.additional_notes]);

  // Email generation constants and functions
  const emailSubject = "Meeting Overview & Action Items - Daily Tier 3 OPS Meeting";
  
  const emails = `Adam Stroobandt <adam.stroobandt@guardianbikes.com>,
Amber Wilber <amber.wilber@guardianbikes.com>,
Arpan Ojha <arpan.ojha@guardianbikes.com>,
Ashley Campbell <ashley.campbell@guardianbikes.com>,
Courtney Fasnacht <courtney.fasnacht@guardianbikes.com>,
Jennica Harding <jennica.harding@guardianbikes.com>,
Kaitlin Keirsted <kaitlin.keirsted@guardianbikes.com>,
Kyle Jansen <kyle.jansen@guardianbikes.com>,
Kyle Jansen <kyle@guardianbikes.com>,
Lou Ochs <lou.ochs@guardianbikes.com>,
Mary Shipman <mary.shipman@guardianbikes.com>,
Matt Craig <matt.craig@guardianbikes.com>,
Mike Ayers <mike.ayers@guardianbikes.com>,
Natalie Mathern <natalie.mathern@guardianbikes.com>,
Ryan Beecher <ryan.beecher@guardianbikes.com>,
Ryan Jansen <ryan.jansen@guardianbikes.com>,
Sam Markel <sam.markel@guardianbikes.com>,
Troy Mobley <troy.mobley@guardianbikes.com>,
Brian Riley <brian@guardianbikes.com>`;

  const isEmailFormValid = emailData.length > 0 && !isEmailDataLoading;

  const generateFormattedEmail = () => {
    if (!emailData || emailData.length === 0) {
      return "No meeting notes or action items found for the selected dates.";
    }
    return generateEmail(emailData, dateString);
  };

  // Email toggle functions
  const handleToggleEmailPreview = () => {
    setShowEmailPreview(!showEmailPreview);
    setShowEmailsPreview(false);
    setShowSubjectPreview(false);
  };

  const handleToggleEmailsPreview = () => {
    setShowEmailsPreview(!showEmailsPreview);
    setShowEmailPreview(false);
    setShowSubjectPreview(false);
  };

  const handleToggleSubjectPreview = () => {
    setShowSubjectPreview(!showSubjectPreview);
    setShowEmailPreview(false);
    setShowEmailsPreview(false);
  };

  const handleValidationError = () => {
    toast.error("No meeting data available for the selected dates", {
      duration: 3000,
    });
  };

  // Rich copy function for Gmail compatibility
  const copyRichContent = async (htmlContent: string, plainContent: string, successMessage: string) => {
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        // Modern browsers - dual format for Gmail
        const blobHtml = new Blob([htmlContent], { type: "text/html" });
        const blobText = new Blob([plainContent], { type: "text/plain" });
        const item = new ClipboardItem({
          "text/html": blobHtml,
          "text/plain": blobText
        });
        await navigator.clipboard.write([item]);
      } else {
        // Fallback for older browsers
        const container = document.createElement("div");
        container.contentEditable = "true";
        container.style.position = "fixed";
        container.style.opacity = "0";
        container.innerHTML = htmlContent;
        document.body.appendChild(container);

        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(container);
        selection.removeAllRanges();
        selection.addRange(range);

        document.addEventListener("copy", function onCopy(e) {
          e.clipboardData.setData("text/html", htmlContent);
          e.clipboardData.setData("text/plain", plainContent);
          e.preventDefault();
          document.removeEventListener("copy", onCopy);
        });

        const success = document.execCommand("copy");
        selection.removeAllRanges();
        document.body.removeChild(container);
        
        if (!success) throw new Error("Copy command failed");
      }
      
      toast.success(successMessage, { duration: 4000 });
      return true;
    } catch (error) {
      toast.error("Failed to copy content. Please try again.");
      return false;
    }
  };

  // Convert markdown to HTML for Gmail
  const convertMarkdownToHtml = (markdownText: string): string => {
    return markdownText
      // Remove all empty lines first
      .replace(/^\s*\n/gm, '')
      // Headers
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      // Bold text (must come before italic to avoid conflicts)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Italic text
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Horizontal rules
      .replace(/^---$/gm, '<hr>')
      // Bullet points - handle the content inside bullets properly
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      // Group consecutive <li> elements into <ul>
      .replace(/(<li>.*?<\/li>)(\n)?(?=<li>)/gs, '$1')
      .replace(/(<li>.*?<\/li>)+/gs, '<ul>$&</ul>')
      // Convert remaining single newlines to nothing (since we removed empty lines)
      .replace(/\n/g, '')
      // Clean up any remaining issues
      .replace(/<\/li><li>/g, '</li><li>')
      .replace(/<\/ul><ul>/g, '');
  };

  // Email copy functions
  const handleCopyEmail = async () => {
    if (!isEmailFormValid) {
      handleValidationError();
      return;
    }

    try {
      const markdownEmail = generateFormattedEmail();
      const htmlEmail = `<div>${convertMarkdownToHtml(markdownEmail)}</div>`;
      
      const success = await copyRichContent(
        htmlEmail,
        markdownEmail,
        "Meeting email copied with formatting! Paste in Gmail to see rich formatting."
      );
      
      if (success) {
        setEmailCopied(true);
        setTimeout(() => setEmailCopied(false), 2000);
      }
    } catch (error) {
      toast.error("Failed to copy email. Please try again.");
    }
  };

  const handleCopyEmails = async () => {
    if (!isEmailFormValid) {
      handleValidationError();
      return;
    }

    try {
      await navigator.clipboard.writeText(emails);
      setEmailsCopied(true);
      toast.success("Email addresses copied to clipboard!", {
        duration: 3000,
      });
      setTimeout(() => setEmailsCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy emails. Please try again.");
    }
  };

  const handleCopySubject = async () => {
    if (!isEmailFormValid) {
      handleValidationError();
      return;
    }

    try {
      await navigator.clipboard.writeText(emailSubject);
      setSubjectCopied(true);
      toast.success("Email subject copied to clipboard!", {
        duration: 3000,
      });
      setTimeout(() => setSubjectCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy subject. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleBackToDashboard}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <h1 className="text-3xl font-bold">Post Meeting Workflow</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Date Controls */}
              <TranscriptDateSelector
                selectedDate={selectedDate}
                onDateChange={handleDateChangeWithAIReset}
              />
            </div>
          </div>

          {/* Three column layout matching PillarLayout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Left Column - Calendar (25%) */}
            <TranscriptCalendar
              selectedDate={selectedDate}
              onDateSelect={handleDateChangeWithAIReset}
            />

            {/* Right Columns - Form (75%) */}
            <div className="lg:col-span-9 h-screen overflow-y-auto">
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Transcript for {format(selectedDate, 'MMMM d, yyyy')}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Store daily meeting transcripts and additional notes, then generate AI-powered email communications. All changes are automatically saved.
                  </p>
                </div>

                <TranscriptForm
                  formData={formData}
                  validation={validation}
                  isLoading={isLoading || isSaving}
                  error={error}
                  isFormDirty={isFormDirty}
                  saveStatus={saveStatus}
                  lastSavedAt={lastSavedAt}
                  showValidationError={showValidationError}
                  onInputChange={handleInputChange}
                  onSave={handleSave}
                  onDelete={handleDelete}
                  canSave={!isSaving}
                  canDelete={canDelete}
                  isDeleting={isDeleting}
                />

                {/* AI Generation Section */}
                <div className="my-16">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-6 text-gray-500 font-medium">AI Meeting Notes Generation</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-8 mt-8">
                  {/* AI Generation Header and Button */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                      Generate AI-Powered Meeting Notes & Action Items
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Use AI to automatically generate structured meeting notes and action items from your transcript and additional notes. 
                      Review and edit the generated content before saving to your pillar pages.
                    </p>
                  </div>

                  {/* AI Generation Button */}
                  <AIGenerationButton
                    disabled={!formData.transcript.trim() || !canGenerate}
                    onGenerate={handleAIGeneration}
                    status={aiState.status}
                    error={aiState.error}
                  />

                  {/* AI Generation Progress */}
                  <AIGenerationProgress
                    status={aiState.status}
                    error={aiState.error}
                  />

                  {/* AI Generation Error */}
                  {aiState.error && (
                    <AIGenerationError
                      error={aiState.error}
                      onRetry={aiState.error.retryable ? handleAIGeneration : undefined}
                    />
                  )}

                  {/* Approval Interface */}
                  {aiState.generatedContent && aiState.existingContent && (
                    <>
                      <MeetingNotesApprovalInterface
                        generatedContent={aiState.generatedContent}
                        existingContent={aiState.existingContent}
                        onContentEdit={editContent}
                        onContentDelete={deleteContent}
                        onApproveAll={approveAll}
                        onRegenerateAll={regenerateAll}
                        isApproving={aiState.status === 'processing'} // Adjust based on actual approval state
                        isRegenerating={aiState.isRegenerating}
                      />
                      
                      {/* Action Buttons */}
                      <div className="flex justify-center gap-4">
                        <Button
                          onClick={approveAll}
                          disabled={aiState.status === 'processing' || aiState.isRegenerating}
                          size="lg"
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white min-w-[180px]"
                        >
                          {aiState.status === 'processing' ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Saving Content...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Approve All Content
                            </>
                          )}
                        </Button>

                        <Dialog open={regenerateDialogOpen} onOpenChange={setRegenerateDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="lg"
                              disabled={aiState.status === 'processing' || aiState.isRegenerating || !formData.transcript.trim()}
                              className="border-orange-300 text-orange-700 hover:bg-orange-50 min-w-[180px]"
                            >
                              {aiState.isRegenerating ? (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                  Regenerating...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                  Regenerate All
                                </>
                              )}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Regenerate All Content?</DialogTitle>
                              <DialogDescription>
                                This will replace all current generated content with fresh AI analysis. 
                                Any manual edits you've made will be lost. This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button 
                                variant="outline" 
                                onClick={() => setRegenerateDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                variant="destructive" 
                                onClick={handleRegenerateConfirm}
                              >
                                Yes, Regenerate All
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </>
                  )}
                </div>

                {/* Visual Separator */}
                <div className="my-16">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-6 text-gray-500 font-medium">Email Generation Workflow</span>
                    </div>
                  </div>
                </div>

                {/* Email Generation Section */}
                <div className={`space-y-8 mt-8 transition-opacity duration-300 ${!isEmailFormValid ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                      Meeting Email Communication
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Generate professional meeting summary emails using today's and yesterday's meeting notes and action items from your pillar data. Ready to copy and paste into your email client.
                    </p>
                  </div>

                  {/* Instructions */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-3 text-center">Email Workflow</h3>
                    <div className="text-blue-800 text-sm space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-blue-600 min-w-[20px]">1.</span>
                        <span>Click <strong>"Copy Meeting Email"</strong> to copy the formatted email content</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-blue-600 min-w-[20px]">2.</span>
                        <span>Click <strong>"Copy Emails"</strong> to get recipient list for your email client</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-blue-600 min-w-[20px]">3.</span>
                        <span>Click <strong>"Copy Subject"</strong> to get the standardized email subject line</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-blue-600 min-w-[20px]">4.</span>
                        <span>Paste everything into your email client and send to your team!</span>
                      </div>
                    </div>
                  </div>

                  {/* Copy Buttons */}
                  <div className="flex justify-center gap-4 pt-4 flex-wrap">
                    <Button
                      onClick={handleCopyEmail}
                      size="lg"
                      className={`min-w-[180px] transition-all ${emailCopied 
                        ? 'bg-green-600 hover:bg-green-600 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                      disabled={isEmailDataLoading}
                    >
                      {emailCopied ? (
                        <Check className="w-4 h-4 mr-2" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      {isEmailDataLoading ? 'Loading...' : emailCopied ? 'Copied!' : 'Copy Meeting Email'}
                    </Button>
                    <Button
                      onClick={handleCopyEmails}
                      size="lg"
                      className={`min-w-[150px] transition-all ${emailsCopied 
                        ? 'bg-green-600 hover:bg-green-600 text-white border-green-600' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                      }`}
                    >
                      {emailsCopied ? (
                        <Check className="w-4 h-4 mr-2" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      {emailsCopied ? 'Copied!' : 'Copy Emails'}
                    </Button>
                    <Button
                      onClick={handleCopySubject}
                      size="lg"
                      className={`min-w-[150px] transition-all ${subjectCopied 
                        ? 'bg-green-600 hover:bg-green-600 text-white border-green-600' 
                        : 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600'
                      }`}
                    >
                      {subjectCopied ? (
                        <Check className="w-4 h-4 mr-2" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      {subjectCopied ? 'Copied!' : 'Copy Subject'}
                    </Button>
                  </div>

                  {/* Preview Toggles */}
                  <div className="flex justify-center gap-4 pt-4 flex-wrap">
                    <Button
                      variant="outline"
                      onClick={handleToggleEmailPreview}
                      className="flex items-center gap-2"
                      disabled={isEmailDataLoading}
                    >
                      {showEmailPreview ? (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Hide Email Preview
                        </>
                      ) : (
                        <>
                          <ChevronRight className="w-4 h-4" />
                          Show Email Preview
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleToggleEmailsPreview}
                      className="flex items-center gap-2"
                    >
                      {showEmailsPreview ? (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Hide Emails Preview
                        </>
                      ) : (
                        <>
                          <ChevronRight className="w-4 h-4" />
                          Show Emails Preview
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleToggleSubjectPreview}
                      className="flex items-center gap-2"
                    >
                      {showSubjectPreview ? (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Hide Subject Preview
                        </>
                      ) : (
                        <>
                          <ChevronRight className="w-4 h-4" />
                          Show Subject Preview
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Preview Content */}
                  {showEmailPreview && (
                    <div className="space-y-2 border rounded-lg p-4 bg-gray-50">
                      <h4 className="font-medium text-sm">Meeting Email Preview:</h4>
                      <div className="text-xs bg-white p-3 rounded border max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap font-mono text-xs">{generateFormattedEmail()}</pre>
                      </div>
                    </div>
                  )}

                  {showEmailsPreview && (
                    <div className="space-y-2 border rounded-lg p-4 bg-gray-50">
                      <h4 className="font-medium text-sm">Email Recipients Preview:</h4>
                      <div className="text-xs bg-white p-3 rounded border">
                        {emails}
                      </div>
                    </div>
                  )}

                  {showSubjectPreview && (
                    <div className="space-y-2 border rounded-lg p-4 bg-gray-50">
                      <h4 className="font-medium text-sm">Email Subject Preview:</h4>
                      <div className="text-xs bg-white p-3 rounded border">
                        {emailSubject}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Protection Modal */}
        <UnsavedChangesModal
          isOpen={isModalOpen}
          onSaveAndGo={() => handleSaveAndGo(handleSave)}
          onDiscard={() => handleDiscard(resetForm)}
          onCancel={handleCancel}
          validation={validation}
        />
      </div>
    </div>
  );
}