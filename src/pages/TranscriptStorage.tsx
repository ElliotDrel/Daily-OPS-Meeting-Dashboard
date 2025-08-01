// Daily Transcript Storage page - main page component
// Following PillarLayout patterns with transcript-specific functionality

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { TranscriptForm } from '@/components/transcript/TranscriptForm';
import { TranscriptCalendar } from '@/components/transcript/TranscriptCalendar';
import { TranscriptDateSelector } from '@/components/transcript/TranscriptDateSelector';
import { useTranscriptData } from '@/hooks/useTranscriptData';
import { useTranscriptForm } from '@/hooks/useTranscriptForm';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

export default function TranscriptStorage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  
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
    handleInputChange,
    handleSave,
    resetForm,
    isSaving
  } = useTranscriptForm(transcript, dateString);

  // Navigation protection
  useUnsavedChanges(isFormDirty);

  const handleDateChange = React.useCallback((date: Date) => {
    setSelectedDate(date);
    resetForm();
  }, [resetForm]);

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
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Daily Transcript Storage</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Date Controls */}
              <TranscriptDateSelector
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
              />
            </div>
          </div>

          {/* Three column layout matching PillarLayout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Left Column - Calendar (25%) */}
            <TranscriptCalendar
              selectedDate={selectedDate}
              onDateSelect={handleDateChange}
            />

            {/* Right Columns - Form (75%) */}
            <div className="lg:col-span-9 h-screen overflow-y-auto">
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Transcript for {format(selectedDate, 'MMMM d, yyyy')}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Store daily meeting transcripts and additional notes. All changes are automatically saved.
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
                  onInputChange={handleInputChange}
                  onSave={handleSave}
                  canSave={validation.isFormValid && !isSaving}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}