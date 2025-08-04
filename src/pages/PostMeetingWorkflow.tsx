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
import { toast } from '@/components/ui/sonner';
import { Copy, ChevronDown, ChevronRight, Check, CheckCircle2, RefreshCw } from 'lucide-react';
import { AIGenerationButton, AIGenerationProgress, AIGenerationError } from '@/components/ai/AIGenerationButton';
import { MeetingNotesApprovalInterface } from '@/components/ai/MeetingNotesApprovalInterface';

export default function PostMeetingWorkflow() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  
  // Email generation state
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [showEmailsPreview, setShowEmailsPreview] = useState(false);
  const [showSubjectPreview, setShowSubjectPreview] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
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

  const isEmailFormValid = formData.transcript.trim() !== "";

  const generatePrompt = () => {
    const promptTemplate = `<goal>Using all the attached info, create meeting notes in the same format as the yesterdays notes (<yesterdaysnotes>).</goal> <additonalinstructions>1. Use yesterday's notes (<yesterdaysnotes>) to find out in what style, format, and structure I want your output structured. Your output should be in the same style, format, and structure as yesterday's notes (<yesterdaysnotes>). 2. Use yesterday's notes (<yesterdaysnotes>) plus my notes (<mynotes>) to find what was covered in the last meeting and add that to the proper sections. 3. Use the transcript (<transcript>) to collect and identify what was covered in today's meeting to fill in the proper sections.</additonalinstructions> <outputformat>Output in the same format, style and structure as yesterday's notes (<yesterdaysnotes>). Ensure your notes are to the same level of detail as the example notes. </outputformat>

<transcript>${formData.transcript}</transcript>

<mynotes>${formData.additional_notes}</mynotes>

<yesterdaysnotes># Manufacturing Daily Huddle Meeting Notes

## Executive Summary

The team relocated the daily huddle to the manufacturing office to improve attendance and punctuality, working through initial AV setup challenges. Production showed strong improvement with **1,634 units** yesterday, though month-to-date attainment remains at **50%** with **4,757 bikes short** of plan. Key focuses included managing the incoming surge of twenty-four containers over eight workdays, addressing persistent quality issues with bent cranks, and evaluating a DC redistribution freeze that could increase shipping costs by **$200,000** during sales periods.

---

## Safety

### Summary
- No new incidents reported
- Preparing for extreme heat with **107-degree heat index** expected Thursday
- Insurance walkthrough completed with no findings, proceeding with new carrier transition
- Continuing to emphasize hydration and heat safety protocols across all facilities

### Action Items
- **Monitor heat safety compliance** and push water breaks during high heat index days *(All supervisors, ongoing)*

### Yesterday's Action Items
- Employee-only sign for G4 door remains **pending**; Limble ticket submitted
- Weather-area signage audit continues for non-G10 buildings

---

## Quality

### Summary
- **Bent cranks persist** as primary quality concern; Frank working on resolution but communication remains limited to one reply per week
- Previous issues with wobbly single-speed freewheels and paint adhesion on rims continue under Frank's oversight

### Action Items
- **Follow up with Frank** on bent crank corrective action plan *(Lou, Jul 24)*
- **Maintain pressure on Frank** for more frequent quality updates *(Lou, ongoing)*

### Yesterday's Action Items
- Awaiting Frank's detailed response on bent crank root cause; supplier needs additional information

---

## Inventory and Stockout Risk

### Summary
Proposed DC redistribution freeze for **14-inch, 26-inch, and Adult Small models** reveals $10-per-shipment cost increase from Indiana fulfillment. Analysis shows potential **$200,000 shipping cost impact** per 20,000 orders during sales. 

**Production Gap Analysis:**
- Current shortfall: **4,757 bikes**
- Remaining planned days: **6 days**
- Required daily output: **2,793 units** (scheduled days only) or **1,862 units** (including weekends)

### Action Items
- **Follow up with Arpon** on cost assumptions and clarify DC inventory availability scenarios *(Lou & Jennica, Jul 24)*
- **Determine switch timing** considering upcoming sales events *(Lou & Arpon, Jul 25)*

### Yesterday's Action Items
- Cost study initiated showing $19-20 base shipping cost versus $10 premium for Indiana direct fulfillment

---

## Delivery and Logistics

### Summary
- **2 containers received** of 24 expected over next 8 workdays
- New zone-based unloading system showing promise with smooth first container processing
- Additional **26 containers** either in LA port or on water
- Maintaining high-volume cadence through mid-August

### Action Items
- **Maintain extended staffing coverage** for 3-4 week container surge *(Troy, ongoing)*
- **Monitor zone-based container system** effectiveness and adjust as needed *(Troy, Jul 24)*

### Yesterday's Action Items
- Staffing plan executed with 3 temps daily this week, 4 next week

---

## Production Performance

### Summary
- Strong output of **1,634 units yesterday** with another robust day expected
- New workshop initiated to push value improvements
- **Fork production started** on 16-inch models with fixtures for 20-inch and 14-inch in development
- **Powder coat line fire-up** scheduled for tomorrow

### Action Items
- **Integrate fork and powder coat production** into daily tracking metrics *(Production team, Jul 25)*
- **Coordinate Martin cleaning setup** for powder coat area *(Lou, Jul 24)*

### Yesterday's Action Items
- Changeover reduction and new-hire integration continuing per plan

---

## People and Staffing

### Summary
- Turnover challenges persist with **21% daily attendance call-ins** continuing for weeks
- Middle-of-summer timing makes high absenteeism particularly concerning for production targets

### Action Items
- **Develop retention strategy** to address 21% call-in rate *(HR, Jul 25)*
- **Implement daily attendance monitoring** with 4-hour backfill target *(HR, ongoing)*

### Yesterday's Action Items
- Continuing monitoring of attendance patterns and retention strategies</yesterdaysnotes>`;
    return promptTemplate;
  };

  // Email toggle functions
  const handleTogglePromptPreview = () => {
    setShowPromptPreview(!showPromptPreview);
    setShowEmailsPreview(false);
    setShowSubjectPreview(false);
  };

  const handleToggleEmailsPreview = () => {
    setShowEmailsPreview(!showEmailsPreview);
    setShowPromptPreview(false);
    setShowSubjectPreview(false);
  };

  const handleToggleSubjectPreview = () => {
    setShowSubjectPreview(!showSubjectPreview);
    setShowPromptPreview(false);
    setShowEmailsPreview(false);
  };

  const handleValidationError = () => {
    toast.error("Please add transcript content to enable email generation", {
      duration: 3000,
    });
  };

  // Email copy functions
  const handleCopyPrompt = async () => {
    if (!isEmailFormValid) {
      handleValidationError();
      return;
    }

    try {
      await navigator.clipboard.writeText(generatePrompt());
      setPromptCopied(true);
      toast.success("Full prompt copied to clipboard!", {
        duration: 4000,
      });
      setTimeout(() => setPromptCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy prompt. Please try again.");
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
                      Generate AI Email Communication
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Create structured meeting notes using the transcript and notes above. Use the workflow below to generate and distribute professional communications.
                    </p>
                  </div>

                  {/* Instructions */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-3 text-center">Complete Workflow</h3>
                    <div className="text-blue-800 text-sm space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-blue-600 min-w-[20px]">1.</span>
                        <span>Click <strong>"Copy Full Prompt"</strong> and paste into <strong>ChatGPT o3</strong> for optimal results</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-blue-600 min-w-[20px]">2.</span>
                        <span>Let AI generate your structured meeting notes</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-blue-600 min-w-[20px]">3.</span>
                        <span>Click <strong>"Copy Emails"</strong> to get recipient list for your email client</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-blue-600 min-w-[20px]">4.</span>
                        <span>Click <strong>"Copy Subject"</strong> to get the standardized email subject line</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-blue-600 min-w-[20px]">5.</span>
                        <span>Email the AI-generated meeting notes to your team!</span>
                      </div>
                    </div>
                  </div>

                  {/* Copy Buttons */}
                  <div className="flex justify-center gap-4 pt-4 flex-wrap">
                    <Button
                      onClick={handleCopyPrompt}
                      size="lg"
                      className={`min-w-[150px] transition-all ${promptCopied 
                        ? 'bg-green-600 hover:bg-green-600 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {promptCopied ? (
                        <Check className="w-4 h-4 mr-2" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      {promptCopied ? 'Copied!' : 'Copy Full Prompt'}
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
                      onClick={handleTogglePromptPreview}
                      className="flex items-center gap-2"
                    >
                      {showPromptPreview ? (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Hide Prompt Preview
                        </>
                      ) : (
                        <>
                          <ChevronRight className="w-4 h-4" />
                          Show Prompt Preview
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
                  {showPromptPreview && (
                    <div className="space-y-2 border rounded-lg p-4 bg-gray-50">
                      <h4 className="font-medium text-sm">Generated Prompt Preview:</h4>
                      <div className="text-xs bg-white p-3 rounded border max-h-40 overflow-y-auto">
                        <div dangerouslySetInnerHTML={{ __html: generatePrompt().replace(/\n/g, '<br>') }} />
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