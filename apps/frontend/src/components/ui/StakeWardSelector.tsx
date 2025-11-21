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

  const wardOptions = useMemo(() => {
    if (!stake) {
      return [];
    }
    return getWardOptions(stake);
  }, [stake]);

  useEffect(() => {
    if (stake && !stakeOptions.some((s) => s.value === stake)) {
      const foundStake = findStakeValueByText(stake);
      if (foundStake) {
        onStakeChange(foundStake);
      }
    }
  }, [stake, stakeOptions, onStakeChange]);

  useEffect(() => {
    if (stake && ward && !wardOptions.some((w) => w.value === ward)) {
      const foundWard = findWardValueByText(stake, ward);
      if (foundWard) {
        onWardChange(foundWard);
      } else {
        onWardChange('');
      }
    }
  }, [stake, ward, wardOptions, onWardChange]);

  const handleStakeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newStake = event.target.value;
    onStakeChange(newStake);

    if (newStake !== stake) {
      onWardChange('');
    }
  };

  const handleWardChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onWardChange(event.target.value);
  };

  const currentWardIsValid = useMemo(() => {
    if (!ward || !stake) {
      return false;
    }
    return wardOptions.some((w) => w.value === ward);
  }, [ward, stake, wardOptions]);

  const resolvedWard = currentWardIsValid ? ward : '';

  return (
    <>
      <ComboBox
        name='stake'
        label={stakeLabel}
        value={stake}
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
        disabled={wardDisabled || !stake}
        variant='default'
        helperText={!stake ? 'Please select a stake first' : undefined}
      />
    </>
  );
};

export default StakeWardSelector;
