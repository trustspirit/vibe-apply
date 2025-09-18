import { useMemo } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { StatusChip } from '../../components/ui';
import './AdminRoles.scss';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'User' },
];

const AdminRoles = () => {
  const { users, currentUser, updateUserRole } = useApp();

  const sortedUsers = useMemo(
    () =>
      [...users].sort((a, b) => {
        if (a.role === b.role) {
          return a.name.localeCompare(b.name);
        }
        return a.role === 'admin' ? -1 : 1;
      }),
    [users],
  );

  const handleRoleChange = (userId, role) => {
    if (userId === currentUser?.id) {
      return;
    }
    updateUserRole(userId, role);
  };

  return (
    <section className="roles">
      <header className="roles__header">
        <h1 className="roles__title">Manage Roles</h1>
        <p className="roles__subtitle">
          Promote or demote users between admin and user roles. Your own role cannot be changed.
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
                    tone={user.role === 'admin' ? 'approved' : 'awaiting'}
                    label={user.role === 'admin' ? 'Admin' : 'User'}
                  />
                </td>
                <td>
                  <select
                    className={`combo combo--${user.role}`}
                    value={user.role}
                    onChange={(event) => handleRoleChange(user.id, event.target.value)}
                    disabled={user.id === currentUser?.id}
                    aria-label={`Select role for ${user.name}`}
                  >
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {user.id === currentUser?.id && <span className="roles__self-hint">Cannot change your role</span>}
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
