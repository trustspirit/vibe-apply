import { type ChangeEvent, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { UserRole, LeaderStatus } from '@vibe-apply/shared';
import { useApp } from '@/context/AppContext';
import { ComboBox, ToggleButton } from '@/components/ui';
import { UserRole as UserRoleEnum, LeaderStatus as LeaderStatusEnum, getRoleTone } from '@/utils/constants';
import styles from './AdminRoles.module.scss';

const AdminRoles = () => {
  const { t } = useTranslation();
  const { users, currentUser, updateUserRole, updateLeaderStatus, refetchUsers } = useApp();

  const ROLE_OPTIONS = useMemo(
    () => [
      { value: UserRoleEnum.ADMIN, label: t('roles.admin') },
      { value: UserRoleEnum.SESSION_LEADER, label: t('roles.sessionLeader') },
      { value: UserRoleEnum.STAKE_PRESIDENT, label: t('roles.stakePresident') },
      { value: UserRoleEnum.BISHOP, label: t('roles.bishop') },
      { value: UserRoleEnum.APPLICANT, label: t('roles.applicant') },
    ],
    [t]
  );

  useEffect(() => {
    refetchUsers();
  }, [refetchUsers]);

  const sortedUsers = useMemo(
    () =>
      [...users].sort((a, b) => {
        if (a.role === b.role) {
          return a.name.localeCompare(b.name);
        }
        const order: Record<string, number> = {
          [UserRoleEnum.ADMIN]: 0,
          [UserRoleEnum.SESSION_LEADER]: 1,
          [UserRoleEnum.STAKE_PRESIDENT]: 2,
          [UserRoleEnum.BISHOP]: 3,
          [UserRoleEnum.APPLICANT]: 4,
        };
        return (order[a.role] ?? 5) - (order[b.role] ?? 5);
      }),
    [users]
  );

  const handleRoleChange = (userId: string, role: string) => {
    if (userId === currentUser?.id) {
      return;
    }
    updateUserRole(userId, role as UserRole);
  };

  const handleLeaderToggle = (userId: string, isApproved: boolean) => {
    updateLeaderStatus(userId, (isApproved ? LeaderStatusEnum.APPROVED : LeaderStatusEnum.PENDING) as LeaderStatus);
  };

  return (
    <section className={styles.roles}>
      <header className={styles.header}>
        <h1>{t('admin.roles.title')}</h1>
        <p>{t('admin.roles.subtitle')}</p>
      </header>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope='col'>{t('admin.roles.columns.name')}</th>
              <th scope='col'>{t('admin.roles.columns.email')}</th>
              <th scope='col'>{t('admin.roles.columns.role')}</th>
              <th scope='col'>{t('admin.roles.columns.leaderApproval')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <ComboBox
                    name={`role-${user.id}`}
                    value={user.role}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                      handleRoleChange(user.id, event.target.value)
                    }
                    options={ROLE_OPTIONS}
                    tone={getRoleTone(user.role)}
                    wrapperClassName={styles.combo}
                    ariaLabel={`Select role for ${user.name}`}
                    disabled={user.id === currentUser?.id}
                  />
                  {user.id === currentUser?.id && (
                    <span className={styles.selfHint}>
                      {t('admin.roles.cannotChangeRole')}
                    </span>
                  )}
                </td>
                <td>
                  {user.role === UserRoleEnum.SESSION_LEADER || user.role === UserRoleEnum.STAKE_PRESIDENT || user.role === UserRoleEnum.BISHOP ? (
                    <ToggleButton
                      checked={user.leaderStatus === LeaderStatusEnum.APPROVED}
                      onChange={(next: boolean) => handleLeaderToggle(user.id, next)}
                      labelOn={t('admin.roles.approved')}
                      labelOff={t('admin.roles.pending')}
                      confirmOnMessage={t('admin.roles.approveLeader')}
                      className={styles.toggle}
                    />
                  ) : (
                    <span className={styles.statusHint}>{t('admin.roles.nA')}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.cardList}>
        {sortedUsers.map((user) => (
          <div key={user.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardName}>{user.name}</div>
            </div>
            <div className={styles.cardEmail}>{user.email}</div>
            <div className={styles.cardSection}>
              <label className={styles.cardLabel}>{t('admin.roles.columns.role')}</label>
              <ComboBox
                name={`role-${user.id}`}
                value={user.role}
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  handleRoleChange(user.id, event.target.value)
                }
                options={ROLE_OPTIONS}
                tone={getRoleTone(user.role)}
                wrapperClassName={styles.combo}
                ariaLabel={`Select role for ${user.name}`}
                disabled={user.id === currentUser?.id}
              />
              {user.id === currentUser?.id && (
                <span className={styles.selfHint}>
                  {t('admin.roles.cannotChangeRole')}
                </span>
              )}
            </div>
            <div className={styles.cardSection}>
              <label className={styles.cardLabel}>{t('admin.roles.columns.leaderApproval')}</label>
              {user.role === UserRoleEnum.SESSION_LEADER || user.role === UserRoleEnum.STAKE_PRESIDENT || user.role === UserRoleEnum.BISHOP ? (
                <ToggleButton
                  checked={user.leaderStatus === LeaderStatusEnum.APPROVED}
                  onChange={(next: boolean) => handleLeaderToggle(user.id, next)}
                  labelOn={t('admin.roles.approved')}
                  labelOff={t('admin.roles.pending')}
                  confirmOnMessage={t('admin.roles.approveLeader')}
                  className={styles.toggle}
                />
              ) : (
                <span className={styles.statusHint}>{t('admin.roles.nA')}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AdminRoles;
