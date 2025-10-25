-- Add voice_id column to licenses table for ElevenLabs voice selection

-- 1. Add voice_id column (defaults to Bella for Japanese)
ALTER TABLE licenses
ADD COLUMN IF NOT EXISTS voice_id VARCHAR(20) DEFAULT 'Bella';

-- 2. Add check constraint for valid voice IDs
ALTER TABLE licenses
ADD CONSTRAINT voice_id_check CHECK (
  voice_id IN ('Rachel', 'Domi', 'Bella', 'Antoni', 'Elli', 'Josh', 'Arnold', 'Adam', 'Sam')
);

-- 3. Add index for performance
CREATE INDEX IF NOT EXISTS idx_licenses_voice_id ON licenses(voice_id);

-- 4. Add comment
COMMENT ON COLUMN licenses.voice_id IS 'ElevenLabs voice ID for TTS (Rachel/Domi/Bella/Antoni/Elli/Josh/Arnold/Adam/Sam)';
