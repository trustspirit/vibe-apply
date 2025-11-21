import { type ChangeEvent, useEffect, useMemo } from 'react';
import type { UserRole, LeaderStatus } from '@vibe-apply/shared';
import { useApp } from '@/context/AppContext';
import { ComboBox, StatusChip, ToggleButton } from '@/components/ui';
import { USER_ROLES, LEADER_STATUS } from '@/utils/constants';
import styles from './AdminRoles.module.scss';

const ROLE_OPTIONS = [
  { value: USER_ROLES.ADMIN, label: 'Admin' },
  { value: USER_ROLES.SESSION_LEADER, label: 'Session Leader' },
  { value: USER_ROLES.STAKE_PRESIDENT, label: 'Stake President' },
  { value: USER_ROLES.BISHOP, label: 'Bishop' },
  { value: USER_ROLES.APPLICANT, label: 'Applicant' },
];

const AdminRoles = () => {
  const { users, currentUser, updateUserRole, updateLeaderStatus, refetchUsers } = useApp();

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
        <h1>Manage Roles</h1>
        <p>
          Manage user roles and permissions. Approve bishop and stake president requests when ready.
        </p>
      </header>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope='col'>Name</th>
              <th scope='col'>Email</th>
              <th scope='col'>Role</th>
              <th scope='col'>Leader Approval</th>
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
                      Cannot change your role
                    </span>
                  )}
                </td>
                <td>
                  {user.role === USER_ROLES.SESSION_LEADER || user.role === USER_ROLES.STAKE_PRESIDENT || user.role === USER_ROLES.BISHOP ? (
                    <ToggleButton
                      checked={user.leaderStatus === LEADER_STATUS.APPROVED}
                      onChange={(next: boolean) => handleLeaderToggle(user.id, next)}
                      labelOn='Approved'
                      labelOff='Pending'
                      confirmOnMessage='Approve this leader account?'
                      className={styles.toggle}
                    />
                  ) : (
                    <span className={styles.statusHint}>N/A</span>
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
              <label className={styles.cardLabel}>Role</label>
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
                  Cannot change your role
                </span>
              )}
            </div>
            <div className={styles.cardSection}>
              <label className={styles.cardLabel}>Leader Approval</label>
              {user.role === USER_ROLES.SESSION_LEADER || user.role === USER_ROLES.STAKE_PRESIDENT || user.role === USER_ROLES.BISHOP ? (
                <ToggleButton
                  checked={user.leaderStatus === LEADER_STATUS.APPROVED}
                  onChange={(next: boolean) => handleLeaderToggle(user.id, next)}
                  labelOn='Approved'
                  labelOff='Pending'
                  confirmOnMessage='Approve this leader account?'
                  className={styles.toggle}
                />
              ) : (
                <span className={styles.statusHint}>N/A</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AdminRoles;
