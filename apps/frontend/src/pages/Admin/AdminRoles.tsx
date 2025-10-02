import { type ChangeEvent, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ComboBox, StatusChip, ToggleButton } from '../../components/ui';
import { USER_ROLES, LEADER_STATUS } from '../../utils/constants';
import type { UserRole, LeaderStatus } from '@vibe-apply/shared';
import './AdminRoles.scss';

const ROLE_OPTIONS = [
  { value: USER_ROLES.ADMIN, label: 'Admin' },
  { value: USER_ROLES.LEADER, label: 'Leader' },
  { value: USER_ROLES.APPLICANT, label: 'Applicant' },
];

const AdminRoles = () => {
  const { users, currentUser, updateUserRole, updateLeaderStatus } = useApp();

  const sortedUsers = useMemo(
    () =>
      [...users].sort((a, b) => {
        if (a.role === b.role) {
          return a.name.localeCompare(b.name);
        }
        const order: Record<string, number> = {
          [USER_ROLES.ADMIN]: 0,
          [USER_ROLES.LEADER]: 1,
          [USER_ROLES.APPLICANT]: 2,
        };
        return (order[a.role] ?? 3) - (order[b.role] ?? 3);
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
          Manage admin, leader, and applicant access. Approve leader requests
          when you are ready.
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
                        : user.role === USER_ROLES.LEADER
                          ? 'leader'
                          : 'applicant'
                    }
                    label={
                      user.role === USER_ROLES.ADMIN
                        ? 'Admin'
                        : user.role === USER_ROLES.LEADER
                          ? user.leaderStatus === LEADER_STATUS.APPROVED
                            ? 'Leader'
                            : 'Leader (Pending)'
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
                      user.role === USER_ROLES.ADMIN
                        ? 'admin'
                        : user.role === USER_ROLES.LEADER
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
                  {user.role === USER_ROLES.LEADER ? (
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
