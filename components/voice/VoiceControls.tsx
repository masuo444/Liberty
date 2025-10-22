'use client';

import { MicrophoneIcon, SpeakerWaveIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import type { VoiceStatus } from '@/lib/types';

type VoiceControlsProps = {
  status: VoiceStatus;
  onToggleMic: () => void;
  onToggleSpeaker: () => void;
  disabled?: boolean;
};

export function VoiceControls({ status, onToggleMic, onToggleSpeaker, disabled }: VoiceControlsProps) {
  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant={status.microphoneEnabled ? 'primary' : 'secondary'}
        onClick={onToggleMic}
        disabled={disabled}
        aria-pressed={status.microphoneEnabled}
        className="gap-2"
      >
        <MicrophoneIcon className="h-5 w-5" />
        {status.microphoneEnabled ? 'マイク ON' : 'マイク OFF'}
      </Button>
      <Button
        type="button"
        variant={status.speakerEnabled ? 'primary' : 'secondary'}
        onClick={onToggleSpeaker}
        disabled={disabled}
        aria-pressed={status.speakerEnabled}
        className="gap-2"
      >
        <SpeakerWaveIcon className="h-5 w-5" />
        {status.speakerEnabled ? '音声再生 ON' : '音声再生 OFF'}
      </Button>
    </div>
  );
}
