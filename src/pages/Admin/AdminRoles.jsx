import { useMemo } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { ComboBox, StatusChip } from '../../components/ui';
import './AdminRoles.scss';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'leader', label: 'Leader' },
  { value: 'applicant', label: 'Applicant' },
];

const LEADER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
];

const AdminRoles = () => {
  const { users, currentUser, updateUserRole, updateLeaderStatus } = useApp();

  const sortedUsers = useMemo(
    () =>
      [...users].sort((a, b) => {
        if (a.role === b.role) {
          return a.name.localeCompare(b.name);
        }
        const order = {
          admin: 0,
          leader: 1,
          applicant: 2,
        };
        return (order[a.role] ?? 3) - (order[b.role] ?? 3);
      }),
    [users],
  );

  const handleRoleChange = (userId, role) => {
    if (userId === currentUser?.id) {
      return;
    }
    updateUserRole(userId, role);
  };

  const handleLeaderStatusChange = (userId, status) => {
    updateLeaderStatus(userId, status);
  };

  return (
    <section className="roles">
      <header className="roles__header">
        <h1 className="roles__title">Manage Roles</h1>
        <p className="roles__subtitle">
          Manage admin, leader, and applicant access. Approve leader requests when you are ready.
        </p>
      </header>

      <div className="roles__table-wrapper">
        <table className="roles__table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Role</th>
              <th scope="col">Change Role</th>
              <th scope="col">Leader Approval</th>
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
                  tone={user.role === 'admin' ? 'admin' : user.role === 'leader' ? 'leader' : 'applicant'}
                  label={
                    user.role === 'admin'
                      ? 'Admin'
                      : user.role === 'leader'
                        ? user.leaderStatus === 'approved'
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
                  onChange={(event) => handleRoleChange(user.id, event.target.value)}
                  options={ROLE_OPTIONS}
                  tone={user.role === 'admin' ? 'admin' : user.role === 'leader' ? 'leader' : 'applicant'}
                  wrapperClassName="roles__combo"
                  ariaLabel={`Select role for ${user.name}`}
                  disabled={user.id === currentUser?.id}
                />
                  {user.id === currentUser?.id && <span className="roles__self-hint">Cannot change your role</span>}
                </td>
                <td>
                  {user.role === 'leader' ? (
                    <ComboBox
                      name={`leader-status-${user.id}`}
                      value={user.leaderStatus ?? 'pending'}
                      onChange={(event) => handleLeaderStatusChange(user.id, event.target.value)}
                      options={LEADER_STATUS_OPTIONS}
                      tone={user.leaderStatus === 'approved' ? 'approved' : 'awaiting'}
                      wrapperClassName="roles__combo"
                      ariaLabel={`Select leader status for ${user.name}`}
                    />
                  ) : (
                    <span className="roles__status-hint">N/A</span>
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
