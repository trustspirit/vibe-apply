import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type {
  UserRole,
  LeaderStatus,
  StakeWardChangeRequest,
  User,
} from '@vibe-apply/shared';
import { useApp } from '@/context/AppContext';
import {
  Button,
  TextField,
  StakeWardSelector,
  Tabs,
  Alert,
  StatusChip,
} from '@/components/ui';
import { authApi, usersApi } from '@/services/api';
import { USER_ROLES, LEADER_STATUS } from '@/utils/constants';
import styles from './AccountSettings.module.scss';

interface AccountForm {
  stake: string;
  ward: string;
  phone: string;
}

const AccountSettings = () => {
  const { currentUser, setUser } = useApp();

  const [activeTab, setActiveTab] = useState('settings');
  const [form, setForm] = useState<AccountForm>({
    stake: currentUser?.stake || '',
    ward: currentUser?.ward || '',
    phone: currentUser?.phone || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingStake, setPendingStake] = useState<string | undefined>(
    currentUser?.pendingStake
  );
  const [pendingWard, setPendingWard] = useState<string | undefined>(
    currentUser?.pendingWard
  );

  const [changeRequests, setChangeRequests] = useState<
    StakeWardChangeRequest[]
  >([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const isAdmin = currentUser?.role === (USER_ROLES.ADMIN as UserRole);
  const isSessionLeader =
    currentUser?.role === (USER_ROLES.SESSION_LEADER as UserRole);
  const isStakePresident =
    currentUser?.role === (USER_ROLES.STAKE_PRESIDENT as UserRole);
  const isBishop = currentUser?.role === (USER_ROLES.BISHOP as UserRole);
  const canChangeStakeWardDirectly = isAdmin || isSessionLeader;
  const canApprove = isAdmin || isSessionLeader || isStakePresident || isBishop;

  useEffect(() => {
    if (activeTab === 'approvals' && canApprove) {
      loadChangeRequests();
    }
    if (activeTab === 'delete' && isAdmin) {
      loadUsers();
    }
  }, [activeTab, canApprove, isAdmin]);

  const loadChangeRequests = async () => {
    setLoadingRequests(true);
    try {
      const requests = await authApi.getStakeWardChangeRequests();
      setChangeRequests(requests);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingRequests(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const allUsers = await usersApi.getAll();
      setUsers(allUsers.filter((u) => u.role !== USER_ROLES.ADMIN));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleApprove = async (requestId: string, approved: boolean) => {
    try {
      await authApi.approveStakeWardChange({ requestId, approved });
      await loadChangeRequests();
      setSuccess(
        approved ? 'Change request approved' : 'Change request rejected'
      );
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!deleteConfirm || deleteConfirm !== userId) {
      setDeleteConfirm(userId);
      return;
    }

    try {
      await usersApi.deleteUser(userId);
      await loadUsers();
      setDeleteConfirm(null);
      setSuccess('User deleted successfully');
    } catch (err) {
      setError((err as Error).message);
      setDeleteConfirm(null);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleStakeChange = (stake: string) => {
    setForm((prev) => ({ ...prev, stake }));
    setError('');
    setSuccess('');
  };

  const handleWardChange = (ward: string) => {
    setForm((prev) => ({ ...prev, ward }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const updates: Partial<AccountForm> = {};
      const stakeChanged = form.stake !== currentUser?.stake;
      const wardChanged = form.ward !== currentUser?.ward;

      if (form.phone !== currentUser?.phone) updates.phone = form.phone;

      if (stakeChanged || wardChanged) {
        if (canChangeStakeWardDirectly) {
          updates.stake = form.stake;
          updates.ward = form.ward;
        } else {
          await authApi.requestStakeWardChange({
            stake: form.stake,
            ward: form.ward,
          });
          const updatedUser = await authApi.getCurrentUser();
          setUser(updatedUser);
          setPendingStake(updatedUser.pendingStake);
          setPendingWard(updatedUser.pendingWard);
          setSuccess('Stake/Ward change request submitted. Awaiting approval.');
          setIsSubmitting(false);
          return;
        }
      }

      if (Object.keys(updates).length === 0) {
        setError('No changes to save');
        setIsSubmitting(false);
        return;
      }

      const updatedUser = await authApi.updateProfile(updates);
      setUser(updatedUser);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleLabel = () => {
    if (currentUser?.role === (USER_ROLES.ADMIN as UserRole))
      return 'Administrator';
    if (currentUser?.role === (USER_ROLES.SESSION_LEADER as UserRole))
      return 'Session Leader';
    if (currentUser?.role === (USER_ROLES.STAKE_PRESIDENT as UserRole)) {
      return currentUser?.leaderStatus ===
        (LEADER_STATUS.APPROVED as LeaderStatus)
        ? 'Stake President (Approved)'
        : 'Stake President (Pending Approval)';
    }
    if (currentUser?.role === (USER_ROLES.BISHOP as UserRole)) {
      return currentUser?.leaderStatus ===
        (LEADER_STATUS.APPROVED as LeaderStatus)
        ? 'Bishop (Approved)'
        : 'Bishop (Pending Approval)';
    }
    return 'Applicant';
  };

  if (!currentUser) {
    return null;
  }

  const tabs = [
    { id: 'settings', label: 'Settings' },
    ...(canApprove ? [{ id: 'approvals', label: 'Approvals' }] : []),
    ...(isAdmin ? [{ id: 'delete', label: 'Delete Users' }] : []),
  ];

  return (
    <div className={styles.accountSettings}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Account Settings</h1>
          <p className={styles.subtitle}>
            Manage your profile information and preferences
          </p>
        </div>

        {tabs.length > 1 && (
          <Tabs
            items={tabs}
            activeId={activeTab}
            onChange={(id) => setActiveTab(id)}
            className={styles.tabs}
          />
        )}

        {activeTab === 'settings' && (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Personal Information</h2>
              <p className={styles.sectionDescription}>
                Your basic account information. Contact an administrator to
                change your name or email.
              </p>

              <div className={styles.fields}>
                <TextField
                  label='Full Name'
                  name='name'
                  value={currentUser.name}
                  disabled
                  helperText='Contact admin to update'
                />

                <TextField
                  label='Email Address'
                  name='email'
                  type='email'
                  value={currentUser.email}
                  disabled
                  helperText='Contact admin to update'
                />

                <TextField
                  label='Phone Number'
                  name='phone'
                  type='tel'
                  value={form.phone}
                  onChange={handleChange}
                  placeholder='e.g., (555) 123-4567'
                />
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Church Information</h2>
              <p className={styles.sectionDescription}>
                {canChangeStakeWardDirectly
                  ? 'Your current stake and ward assignment. Changes will be reflected immediately.'
                  : 'Your current stake and ward assignment. Changes require approval from your stake president or bishop.'}
              </p>

              {(pendingStake || pendingWard) && (
                <Alert variant='info' className={styles.pendingAlert}>
                  You have a pending stake/ward change request: {pendingStake} /{' '}
                  {pendingWard}. Your current assignment will remain until
                  approved.
                </Alert>
              )}

              <div className={styles.fields}>
                <StakeWardSelector
                  stake={form.stake}
                  ward={form.ward}
                  onStakeChange={handleStakeChange}
                  onWardChange={handleWardChange}
                />
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Account Role</h2>
              <p className={styles.sectionDescription}>
                Your current role and permissions in the system.
              </p>

              <div className={styles.roleDisplay}>
                <div className={styles.roleItem}>
                  <span className={styles.roleLabel}>Current Role</span>
                  <span className={styles.roleValue}>{getRoleLabel()}</span>
                </div>
                {(currentUser.role === (USER_ROLES.BISHOP as UserRole) ||
                  currentUser.role ===
                    (USER_ROLES.STAKE_PRESIDENT as UserRole)) &&
                  currentUser.leaderStatus ===
                    (LEADER_STATUS.PENDING as LeaderStatus) && (
                    <p className={styles.roleNote}>
                      Your leader access is pending approval by an
                      administrator.
                    </p>
                  )}
              </div>
            </div>

            {error && (
              <div className={`${styles.message} ${styles.messageError}`}>
                {error}
              </div>
            )}
            {success && (
              <div className={`${styles.message} ${styles.messageSuccess}`}>
                {success}
              </div>
            )}

            <div className={styles.actions}>
              <Button type='submit' variant='primary' disabled={isSubmitting}>
                {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}

        {activeTab === 'approvals' && canApprove && (
          <div className={styles.form}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                Stake/Ward Change Approvals
              </h2>
              <p className={styles.sectionDescription}>
                Review and approve pending stake/ward change requests.
              </p>

              {loadingRequests ? (
                <p className={styles.loading}>Loading requests...</p>
              ) : changeRequests.length === 0 ? (
                <p className={styles.empty}>No pending change requests</p>
              ) : (
                <div className={styles.requestList}>
                  {changeRequests.map((request) => (
                    <div key={request.id} className={styles.requestItem}>
                      <div className={styles.requestHeader}>
                        <div>
                          <div className={styles.requestName}>
                            {request.userName}
                          </div>
                          <div className={styles.requestEmail}>
                            {request.userEmail}
                          </div>
                          <StatusChip
                            status={request.userRole}
                            tone={
                              request.userRole === USER_ROLES.ADMIN
                                ? 'admin'
                                : request.userRole ===
                                    USER_ROLES.STAKE_PRESIDENT
                                  ? 'stakePresident'
                                  : request.userRole === USER_ROLES.BISHOP
                                    ? 'bishop'
                                    : request.userRole ===
                                        USER_ROLES.SESSION_LEADER
                                      ? 'sessionLeader'
                                      : 'applicant'
                            }
                            label={request.userRole}
                          />
                        </div>
                      </div>
                      <div className={styles.requestChange}>
                        <div className={styles.changeFrom}>
                          <span className={styles.changeLabel}>From:</span>
                          <span>
                            {request.currentStake} / {request.currentWard}
                          </span>
                        </div>
                        <div className={styles.changeArrow}>→</div>
                        <div className={styles.changeTo}>
                          <span className={styles.changeLabel}>To:</span>
                          <span>
                            {request.requestedStake} / {request.requestedWard}
                          </span>
                        </div>
                      </div>
                      <div className={styles.requestActions}>
                        <Button
                          variant='success'
                          onClick={() => handleApprove(request.id, true)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant='danger'
                          onClick={() => handleApprove(request.id, false)}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'delete' && isAdmin && (
          <div className={styles.form}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Delete Users</h2>
              <p className={styles.sectionDescription}>
                Permanently delete user accounts. This action cannot be undone.
              </p>

              {loadingUsers ? (
                <p className={styles.loading}>Loading users...</p>
              ) : users.length === 0 ? (
                <p className={styles.empty}>No users to delete</p>
              ) : (
                <div className={styles.userList}>
                  {users.map((user) => (
                    <div key={user.id} className={styles.userItem}>
                      <div className={styles.userInfo}>
                        <div className={styles.userName}>{user.name}</div>
                        <div className={styles.userEmail}>{user.email}</div>
                        <StatusChip
                          status={user.role || ''}
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
                          label={user.role || 'No role'}
                        />
                      </div>
                      <Button
                        variant='danger'
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        {deleteConfirm === user.id
                          ? 'Confirm Delete'
                          : 'Delete'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSettings;
