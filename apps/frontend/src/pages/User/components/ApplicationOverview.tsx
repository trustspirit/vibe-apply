import { useTranslation } from 'react-i18next';
import { ApplicationStatus } from '@vibe-apply/shared';
import { Alert, Button, Card, CardContent, CardFooter, CardHeader, CardTitle, StatusChip, SummaryItem } from '@/components/ui';
import { getStakeLabel, getWardLabel } from '@/utils/stakeWardData';
import styles from '../UserApplication.module.scss';

interface ApplicationOverviewProps {
  application: {
    name: string;
    age?: number | null;
    email: string;
    phone: string;
    stake: string;
    ward: string;
    moreInfo?: string;
    servedMission?: boolean;
    status: ApplicationStatus;
  };
  isEditable: boolean;
  onEdit: () => void;
}

export const ApplicationOverview = ({
  application,
  isEditable,
  onEdit,
}: ApplicationOverviewProps) => {
  const { t } = useTranslation();

  const getStatusInfo = () => {
    const status = application.status;
    let statusLabel: string;
    let statusValue: string;
    let toneValue:
      | 'draft'
      | 'awaiting'
      | 'reviewed'
      | 'rejected'
      | 'approved';

    if (
      status === ApplicationStatus.APPROVED ||
      status === ApplicationStatus.REJECTED
    ) {
      statusLabel = t('application.status.completed');
      statusValue =
        status === ApplicationStatus.APPROVED
          ? ApplicationStatus.APPROVED
          : ApplicationStatus.REJECTED;
      toneValue = 'reviewed';
    } else if (status === ApplicationStatus.AWAITING) {
      statusLabel = t('application.status.submitted');
      statusValue = ApplicationStatus.AWAITING;
      toneValue = 'awaiting';
    } else {
      statusLabel = t('application.status.notSubmitted');
      statusValue = ApplicationStatus.DRAFT;
      toneValue = 'draft';
    }

    return { statusLabel, statusValue, toneValue };
  };

  const { statusLabel, statusValue, toneValue } = getStatusInfo();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('application.overview.title')}</CardTitle>
        {application.status === ApplicationStatus.DRAFT && (
          <Alert variant='warning'>
            {t('application.overview.draftWarning')}
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        <div className={styles.summaryGrid}>
          <SummaryItem label={t('application.overview.status')}>
            <StatusChip
              status={statusValue}
              tone={toneValue}
              label={statusLabel}
            />
          </SummaryItem>
          <SummaryItem label={t('application.overview.name')}>
            {application.name}
          </SummaryItem>
          <SummaryItem label={t('application.overview.email')}>
            {application.email}
          </SummaryItem>
          <SummaryItem label={t('application.overview.phone')}>
            {application.phone}
          </SummaryItem>
          <SummaryItem label={t('application.overview.age')}>
            {application.age ?? t('admin.roles.nA')}
          </SummaryItem>
          <SummaryItem label={t('application.overview.stake')}>
            {getStakeLabel(application.stake) || application.stake}
          </SummaryItem>
          <SummaryItem label={t('application.overview.ward')}>
            {getWardLabel(application.stake, application.ward) ||
              application.ward}
          </SummaryItem>
          {application.servedMission !== undefined && (
            <SummaryItem
              label={t('application.overview.servedMission')}
            >
              {application.servedMission
                ? t('common.yes')
                : t('common.no')}
            </SummaryItem>
          )}
          <SummaryItem
            label={t('application.overview.additionalInfo')}
          >
            {application.moreInfo ||
              t('application.overview.noAdditionalInfo')}
          </SummaryItem>
        </div>
      </CardContent>
      <CardFooter>
        {isEditable ? (
          <Button type='button' variant='primary' onClick={onEdit}>
            {t('application.actions.edit')}
          </Button>
        ) : (
          <p className={styles.lockedMessage}>
            {t('application.messages.lockedMessage')}
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

