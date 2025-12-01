import { type ChangeEvent, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { UserRole, LeaderStatus } from '@vibe-apply/shared';
import { useApp } from '@/context/AppContext';
import { ComboBox, ToggleButton } from '@/components/ui';
import { USER_ROLES, LEADER_STATUS } from '@/utils/constants';
import styles from './AdminRoles.module.scss';

const AdminRoles = () => {
  const { t } = useTranslation();
  const { users, currentUser, updateUserRole, updateLeaderStatus, refetchUsers } = useApp();

  const ROLE_OPTIONS = useMemo(
    () => [
      { value: USER_ROLES.ADMIN, label: t('roles.admin') },
      { value: USER_ROLES.SESSION_LEADER, label: t('roles.sessionLeader') },
      { value: USER_ROLES.STAKE_PRESIDENT, label: t('roles.stakePresident') },
      { value: USER_ROLES.BISHOP, label: t('roles.bishop') },
      { value: USER_ROLES.APPLICANT, label: t('roles.applicant') },
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
          [USER_ROLES.ADMIN]: 0,
          [USER_ROLES.SESSION_LEADER]: 1,
          [USER_ROLES.STAKE_PRESIDENT]: 2,
          [USER_ROLES.BISHOP]: 3,
          [USER_ROLES.APPLICANT]: 4,
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
    updateLeaderStatus(userId, (isApproved ? LEADER_STATUS.APPROVED : LEADER_STATUS.PENDING) as LeaderStatus);
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
                    tone={
                      user.role === USER_ROLES.ADMIN
                        ? 'admin'
                        : user.role === USER_ROLES.STAKE_PRESIDENT
                          ? 'stakePresident'
                          : user.role === USER_ROLES.BISHOP
                            ? 'bishop'
                            : user.role === USER_ROLES.SESSION_LEADER
                              ? 'sessionLeader'
                              : 'applicant'
                    }
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
                  {user.role === USER_ROLES.SESSION_LEADER || user.role === USER_ROLES.STAKE_PRESIDENT || user.role === USER_ROLES.BISHOP ? (
                    <ToggleButton
                      checked={user.leaderStatus === LEADER_STATUS.APPROVED}
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
                tone={
                  user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.SESSION_LEADER
                    ? 'admin'
                    : user.role === USER_ROLES.STAKE_PRESIDENT || user.role === USER_ROLES.BISHOP
                      ? 'leader'
                      : 'applicant'
                }
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
              {user.role === USER_ROLES.SESSION_LEADER || user.role === USER_ROLES.STAKE_PRESIDENT || user.role === USER_ROLES.BISHOP ? (
                <ToggleButton
                  checked={user.leaderStatus === LEADER_STATUS.APPROVED}
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
