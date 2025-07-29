// Data Collection Button - Context-aware button for opening data collection modal
// Shows different states: Collect Data, Edit Data, No Questions, Loading

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Clipboard, Edit3, Loader2, AlertCircle } from 'lucide-react';
import { useDataCollection } from '@/hooks/useDataCollection';
import { DataCollectionModal } from './DataCollectionModal';
import { cn } from '@/lib/utils';
import { DataCollectionButtonProps } from '@/types/dataCollection';

export const DataCollectionButton = ({ 
  pillar, 
  selectedDate, 
  className 
}: DataCollectionButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { buttonState, isLoading } = useDataCollection(pillar, selectedDate);

  // Button configuration based on state
  const getButtonConfig = () => {
    switch (buttonState) {
      case 'loading':
        return {
          text: 'Loading...',
          icon: Loader2,
          variant: 'outline' as const,
          disabled: true,
          iconClass: 'animate-spin'
        };
      
      case 'no-questions':
        return {
          text: 'No Questions',
          icon: AlertCircle,
          variant: 'outline' as const,
          disabled: true,
          iconClass: 'text-muted-foreground'
        };
      
      case 'edit':
        return {
          text: 'Edit Data',
          icon: Edit3,
          variant: 'default' as const,
          disabled: false,
          iconClass: 'text-primary-foreground'
        };
      
      case 'collect':
      default:
        return {
          text: 'Collect Data',
          icon: Clipboard,
          variant: 'default' as const,
          disabled: false,
          iconClass: 'text-primary-foreground'
        };
    }
  };

  const config = getButtonConfig();
  const IconComponent = config.icon;

  const handleClick = () => {
    if (!config.disabled) {
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    // The button state will update automatically through the hook
  };

  return (
    <>
      <Button
        variant={config.variant}
        size="sm"
        onClick={handleClick}
        disabled={config.disabled}
        className={cn(
          'flex items-center gap-2 min-w-[120px]',
          config.disabled && 'cursor-not-allowed opacity-50',
          className
        )}
        title={
          buttonState === 'no-questions' 
            ? 'No questions configured for this pillar'
            : buttonState === 'edit'
            ? 'Edit existing data for this date'
            : 'Collect new data for this date'
        }
      >
        <IconComponent 
          className={cn('w-4 h-4', config.iconClass)} 
        />
        {config.text}
      </Button>

      {/* Data Collection Modal */}
      <DataCollectionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        pillar={pillar}
        selectedDate={selectedDate}
        onSuccess={handleModalSuccess}
      />
    </>
  );
};