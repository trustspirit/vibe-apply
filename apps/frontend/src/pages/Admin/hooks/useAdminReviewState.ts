import { useEffect, useMemo, useRef, useState } from 'react';
import { ApplicationStatus } from '@vibe-apply/shared';
import { resetTimeToMidnight } from '@/utils/validationConstants';
import type { UseAdminReviewStateOptions } from '../types';

export const useAdminReviewState = ({
  locationState,
  tabs,
}: UseAdminReviewStateOptions) => {
  const locationStateRef = useRef<typeof locationState>(null);

  const [activeTab, setActiveTab] = useState(() => {
    const requestedTab = locationState?.initialTab;
    return requestedTab && tabs.some((tab) => tab.id === requestedTab)
      ? requestedTab
      : ApplicationStatus.AWAITING;
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusSelection, setStatusSelection] = useState<string | null>(null);
  const [showTodayOnly, setShowTodayOnly] = useState(
    () => locationState?.focus === 'today'
  );

  const todayTimestamp = useMemo(() => {
    return resetTimeToMidnight(new Date()).getTime();
  }, []);

  useEffect(() => {
    if (locationStateRef.current === locationState) {
      return;
    }
    locationStateRef.current = locationState;
    const requestedTab = locationState?.initialTab;
    if (requestedTab && tabs.some((tab) => tab.id === requestedTab)) {
      setActiveTab(requestedTab);
    }
    setShowTodayOnly(locationState?.focus === 'today');
  }, [locationState, tabs]);

  return {
    activeTab,
    setActiveTab,
    selectedId,
    setSelectedId,
    statusSelection,
    setStatusSelection,
    showTodayOnly,
    setShowTodayOnly,
    todayTimestamp,
  };
};

