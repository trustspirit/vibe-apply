import { type ChangeEvent, useEffect, useMemo } from 'react';
import type { UserRole, LeaderStatus } from '@vibe-apply/shared';
import { useApp } from '@/context/AppContext';
import { ComboBox, StatusChip, ToggleButton } from '@/components/ui';
import { USER_ROLES, LEADER_STATUS } from '@/utils/constants';
import './AdminRoles.scss';

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
    <section className='roles'>
      <header className='roles__header'>
        <h1 className='roles__title'>Manage Roles</h1>
        <p className='roles__subtitle'>
          Manage user roles and permissions. Approve bishop and stake president requests when ready.
        </p>
      </header>

      <div className='roles__table-wrapper'>
        <table className='roles__table'>
          <thead>
            <tr>
              <th scope='col'>Name</th>
              <th scope='col'>Email</th>
              <th scope='col'>Role</th>
              <th scope='col'>Change Role</th>
              <th scope='col'>Leader Approval</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <StatusChip
                    status={user.role}
                    tone={
                      user.role === USER_ROLES.ADMIN
                        ? 'admin'
                        : user.role === USER_ROLES.SESSION_LEADER
                          ? 'admin'
                          : user.role === USER_ROLES.STAKE_PRESIDENT || user.role === USER_ROLES.BISHOP
                            ? 'leader'
                            : 'applicant'
                    }
                    label={
                      user.role === USER_ROLES.ADMIN
                        ? 'Admin'
                        : user.role === USER_ROLES.SESSION_LEADER
                          ? user.leaderStatus === LEADER_STATUS.APPROVED
                            ? 'Session Leader'
                            : 'Session Leader (Pending)'
                          : user.role === USER_ROLES.STAKE_PRESIDENT
                            ? user.leaderStatus === LEADER_STATUS.APPROVED
                              ? 'Stake President'
                              : 'Stake President (Pending)'
                            : user.role === USER_ROLES.BISHOP
                              ? user.leaderStatus === LEADER_STATUS.APPROVED
                                ? 'Bishop'
                                : 'Bishop (Pending)'
                              : 'Applicant'
                    }
                  />
                </td>
                <td>
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
                    wrapperClassName='roles__combo'
                    ariaLabel={`Select role for ${user.name}`}
                    disabled={user.id === currentUser?.id}
                  />
                  {user.id === currentUser?.id && (
                    <span className='roles__self-hint'>
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
                      className='roles__toggle'
                    />
                  ) : (
                    <span className='roles__status-hint'>N/A</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AdminRoles;
