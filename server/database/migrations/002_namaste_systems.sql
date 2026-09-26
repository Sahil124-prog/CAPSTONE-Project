ALTER TABLE terminology_releases
  DROP CONSTRAINT terminology_releases_system_check;

ALTER TABLE terminology_releases
  ADD CONSTRAINT terminology_releases_system_check
  CHECK (system IN ('NAMASTE', 'ICD11_TM2', 'NAMASTE_AYURVEDA', 'NAMASTE_SIDDHA', 'NAMASTE_UNANI'));

  