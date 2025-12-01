import { ChangeEvent, useMemo, useEffect } from 'react';
import { ComboBox } from './';
import {
  getStakeOptions,
  getWardOptions,
  findStakeValueByText,
  findWardValueByText,
} from '@/utils/stakeWardData';

interface StakeWardSelectorProps {
  stake: string;
  ward: string;
  onStakeChange: (stake: string) => void;
  onWardChange: (ward: string) => void;
  stakeError?: string;
  wardError?: string;
  stakeRequired?: boolean;
  wardRequired?: boolean;
  stakeDisabled?: boolean;
  wardDisabled?: boolean;
  stakeLabel?: string;
  wardLabel?: string;
}

const StakeWardSelector = ({
  stake,
  ward,
  onStakeChange,
  onWardChange,
  stakeError,
  wardError,
  stakeRequired = true,
  wardRequired = true,
  stakeDisabled = false,
  wardDisabled = false,
  stakeLabel = 'Stake',
  wardLabel = 'Ward',
}: StakeWardSelectorProps) => {
  const stakeOptions = useMemo(() => getStakeOptions(), []);

  const normalizedStake = useMemo(() => {
    if (!stake) {
      return '';
    }
    if (stakeOptions.some((s) => s.value === stake)) {
      return stake;
    }
    const foundStake = findStakeValueByText(stake);
    return foundStake || stake;
  }, [stake, stakeOptions]);

  const wardOptions = useMemo(() => {
    if (!normalizedStake) {
      return [];
    }
    return getWardOptions(normalizedStake);
  }, [normalizedStake]);

  useEffect(() => {
    if (normalizedStake && normalizedStake !== stake) {
      onStakeChange(normalizedStake);
    }
  }, [normalizedStake, stake, onStakeChange]);

  useEffect(() => {
    if (!normalizedStake && ward) {
      onWardChange('');
    }
  }, [normalizedStake, ward, onWardChange]);

  const handleStakeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newStake = event.target.value;
    onStakeChange(newStake);
    onWardChange('');
  };

  const handleWardChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onWardChange(event.target.value);
  };

  const normalizedWard = useMemo(() => {
    if (!ward || !normalizedStake) {
      return ward || '';
    }
    if (wardOptions.some((w) => w.value === ward)) {
      return ward;
    }
    const foundWard = findWardValueByText(normalizedStake, ward);
    return foundWard || ward;
  }, [ward, normalizedStake, wardOptions]);

  useEffect(() => {
    if (normalizedWard && normalizedWard !== ward && normalizedStake) {
      onWardChange(normalizedWard);
    }
  }, [normalizedWard, ward, normalizedStake, onWardChange]);

  const resolvedWard = normalizedWard;
  const resolvedStake = normalizedStake || stake;

  return (
    <>
      <ComboBox
        name='stake'
        label={stakeLabel}
        value={resolvedStake}
        onChange={handleStakeChange}
        options={stakeOptions}
        required={stakeRequired}
        error={stakeError}
        disabled={stakeDisabled}
        variant='default'
      />
      <ComboBox
        name='ward'
        label={wardLabel}
        value={resolvedWard}
        onChange={handleWardChange}
        options={wardOptions}
        required={wardRequired}
        error={wardError}
        disabled={wardDisabled || !normalizedStake}
        variant='default'
        helperText={!normalizedStake ? 'Please select a stake first' : undefined}
      />
    </>
  );
};

export default StakeWardSelector;
