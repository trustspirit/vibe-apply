import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
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
import { getStakeLabel, getWardLabel } from '@/utils/stakeWardData';
import { formatPhoneNumber } from '@/utils/phoneFormatter';
import styles from './AccountSettings.module.scss';

interface AccountForm {
  stake: string;
  ward: string;
  phone: string;
}

const AccountSettings = () => {
  const { t } = useTranslation();
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
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = currentUser?.role === (USER_ROLES.ADMIN as UserRole);
  const isSessionLeader =
    currentUser?.role === (USER_ROLES.SESSION_LEADER as UserRole);
  const isStakePresident =
    currentUser?.role === (USER_ROLES.STAKE_PRESIDENT as UserRole);
  const isBishop = currentUser?.role === (USER_ROLES.BISHOP as UserRole);
  const canChangeStakeWardDirectly = isAdmin || isSessionLeader;
  const canApprove = isAdmin || isSessionLeader || isStakePresident || isBishop;

  useEffect(() => {
    setError('');
    setSuccess('');
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

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.stake && user.stake.toLowerCase().includes(query)) ||
      (user.ward && user.ward.toLowerCase().includes(query))
    );
  });

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map((u) => u.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedUsers.size === 0) return;

    const userNames = filteredUsers
      .filter((u) => selectedUsers.has(u.id))
      .map((u) => u.name)
      .join(', ');

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedUsers.size} user(s): ${userNames}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await Promise.all(
        Array.from(selectedUsers).map((userId) => usersApi.deleteUser(userId))
      );
      await loadUsers();
      setSelectedUsers(new Set());
      setSuccess(t('accountSettings.deleteUsers.deleted'));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleApprove = async (requestId: string, approved: boolean) => {
    try {
      await authApi.approveStakeWardChange({ requestId, approved });
      await loadChangeRequests();
      setSuccess(
        approved
          ? t('accountSettings.approvals.approved')
          : t('accountSettings.approvals.rejected')
      );
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const formattedValue = name === 'phone' ? formatPhoneNumber(value) : value;
    setForm((prev) => ({ ...prev, [name]: formattedValue }));
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
          setSuccess(t('accountSettings.messages.stakeWardChangeRequested'));
          setIsSubmitting(false);
          return;
        }
      }

      if (Object.keys(updates).length === 0) {
        setError(t('accountSettings.messages.noChanges'));
        setIsSubmitting(false);
        return;
      }

      const updatedUser = await authApi.updateProfile(updates);
      setUser(updatedUser);
      setSuccess(t('accountSettings.messages.profileUpdated'));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleLabel = () => {
    if (currentUser?.role === (USER_ROLES.ADMIN as UserRole))
      return t('roles.administrator');
    if (currentUser?.role === (USER_ROLES.SESSION_LEADER as UserRole))
      return t('roles.sessionLeader');
    if (currentUser?.role === (USER_ROLES.STAKE_PRESIDENT as UserRole)) {
      return currentUser?.leaderStatus ===
        (LEADER_STATUS.APPROVED as LeaderStatus)
        ? t('roles.stakePresidentApproved')
        : t('roles.stakePresidentPending');
    }
    if (currentUser?.role === (USER_ROLES.BISHOP as UserRole)) {
      return currentUser?.leaderStatus ===
        (LEADER_STATUS.APPROVED as LeaderStatus)
        ? t('roles.bishopApproved')
        : t('roles.bishopPending');
    }
    return t('roles.applicant');
  };

  const getRoleLabelForUser = (role: string | undefined): string => {
    if (!role) return t('roles.applicant');
    if (role === USER_ROLES.ADMIN) return t('roles.admin');
    if (role === USER_ROLES.SESSION_LEADER) return t('roles.sessionLeader');
    if (role === USER_ROLES.STAKE_PRESIDENT) return t('roles.stakePresident');
    if (role === USER_ROLES.BISHOP) return t('roles.bishop');
    return t('roles.applicant');
  };

  if (!currentUser) {
    return null;
  }

  const tabs = [
    { id: 'settings', label: t('accountSettings.tabs.settings') },
    ...(canApprove
      ? [{ id: 'approvals', label: t('accountSettings.tabs.approvals') }]
      : []),
    ...(isAdmin
      ? [{ id: 'delete', label: t('accountSettings.tabs.deleteUsers') }]
      : []),
  ];

  return (
    <div className={styles.accountSettings}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('accountSettings.title')}</h1>
          <p className={styles.subtitle}>{t('accountSettings.subtitle')}</p>
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
              <h2 className={styles.sectionTitle}>
                {t('accountSettings.sections.personalInformation.title')}
              </h2>
              <p className={styles.sectionDescription}>
                {t('accountSettings.sections.personalInformation.description')}
              </p>

              <div className={styles.fields}>
                <TextField
                  label={t('common.fullName')}
                  name='name'
                  value={currentUser.name}
                  disabled
                  helperText={t(
                    'accountSettings.sections.personalInformation.contactAdminToUpdate'
                  )}
                />

                <TextField
                  label={t('common.emailAddress')}
                  name='email'
                  type='email'
                  value={currentUser.email}
                  disabled
                  helperText={t(
                    'accountSettings.sections.personalInformation.contactAdminToUpdate'
                  )}
                />

                <TextField
                  label={t('common.phoneNumber')}
                  name='phone'
                  type='tel'
                  value={form.phone}
                  onChange={handleChange}
                  placeholder={t('common.phoneNumber')}
                />

                <div className={styles.roleField}>
                  <label className={styles.roleFieldLabel}>
                    {t('common.role')}
                  </label>
                  <div className={styles.roleFieldContent}>
                    <StatusChip
                      status={currentUser.role}
                      tone={
                        currentUser.role === USER_ROLES.ADMIN
                          ? 'admin'
                          : currentUser.role === USER_ROLES.STAKE_PRESIDENT
                            ? 'stakePresident'
                            : currentUser.role === USER_ROLES.BISHOP
                              ? 'bishop'
                              : currentUser.role === USER_ROLES.SESSION_LEADER
                                ? 'sessionLeader'
                                : 'applicant'
                      }
                      label={getRoleLabel()}
                    />
                  </div>
                  {(currentUser.role === (USER_ROLES.BISHOP as UserRole) ||
                    currentUser.role ===
                      (USER_ROLES.STAKE_PRESIDENT as UserRole)) &&
                    currentUser.leaderStatus ===
                      (LEADER_STATUS.PENDING as LeaderStatus) && (
                      <span className={styles.roleFieldHelp}>
                        {t(
                          'accountSettings.sections.accountRole.pendingApproval'
                        )}
                      </span>
                    )}
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                {t('accountSettings.sections.churchInformation.title')}
              </h2>
              <p className={styles.sectionDescription}>
                {canChangeStakeWardDirectly
                  ? t(
                      'accountSettings.sections.churchInformation.description.immediate'
                    )
                  : t(
                      'accountSettings.sections.churchInformation.description.requiresApproval'
                    )}
              </p>

              {(pendingStake || pendingWard) && (
                <Alert variant='info' className={styles.pendingAlert}>
                  {t(
                    'accountSettings.sections.churchInformation.pendingAlert',
                    {
                      stake:
                        pendingStake
                          ? getStakeLabel(pendingStake) || pendingStake
                          : '',
                      ward:
                        pendingStake && pendingWard
                          ? getWardLabel(pendingStake, pendingWard) ||
                            pendingWard
                          : pendingWard || '',
                    }
                  )}
                </Alert>
              )}

              <div className={`${styles.fields} ${styles.fieldsFullWidth}`}>
                <StakeWardSelector
                  stake={form.stake}
                  ward={form.ward}
                  onStakeChange={handleStakeChange}
                  onWardChange={handleWardChange}
                />
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
                {isSubmitting
                  ? t('accountSettings.messages.saving')
                  : t('accountSettings.messages.saveChanges')}
              </Button>
            </div>
          </form>
        )}

        {activeTab === 'approvals' && canApprove && (
          <div className={styles.form}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                {t('accountSettings.approvals.title')}
              </h2>
              <p className={styles.sectionDescription}>
                {t('accountSettings.approvals.description')}
              </p>

              {loadingRequests ? (
                <p className={styles.loading}>
                  {t('accountSettings.approvals.loading')}
                </p>
              ) : changeRequests.length === 0 ? (
                <p className={styles.empty}>
                  {t('accountSettings.approvals.empty')}
                </p>
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
                            label={getRoleLabelForUser(request.userRole)}
                          />
                        </div>
                      </div>
                      <div className={styles.requestChange}>
                        <div className={styles.changeFrom}>
                          <span className={styles.changeLabel}>
                            {t('common.from')}:
                          </span>
                          <span>
                            {getStakeLabel(request.currentStake) ||
                              request.currentStake}{' '}
                            /{' '}
                            {getWardLabel(
                              request.currentStake,
                              request.currentWard
                            ) || request.currentWard}
                          </span>
                        </div>
                        <div className={styles.changeArrow}>→</div>
                        <div className={styles.changeTo}>
                          <span className={styles.changeLabel}>
                            {t('common.to')}:
                          </span>
                          <span>
                            {getStakeLabel(request.requestedStake) ||
                              request.requestedStake}{' '}
                            /{' '}
                            {getWardLabel(
                              request.requestedStake,
                              request.requestedWard
                            ) || request.requestedWard}
                          </span>
                        </div>
                      </div>
                      <div className={styles.requestActions}>
                        <Button
                          variant='success'
                          onClick={() => handleApprove(request.id, true)}
                        >
                          {t('common.approve')}
                        </Button>
                        <Button
                          variant='danger'
                          onClick={() => handleApprove(request.id, false)}
                        >
                          {t('common.reject')}
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
              <h2 className={styles.sectionTitle}>
                {t('accountSettings.deleteUsers.title')}
              </h2>
              <p className={styles.sectionDescription}>
                {t('accountSettings.deleteUsers.description')}
              </p>

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

              <div className={styles.deleteControls}>
                <TextField
                  label={t('common.search')}
                  name='search'
                  type='text'
                  value={searchQuery}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(e.target.value)
                  }
                  placeholder={t(
                    'accountSettings.deleteUsers.searchPlaceholder'
                  )}
                  className={styles.searchInput}
                />
                {selectedUsers.size > 0 && (
                  <div className={styles.bulkActions}>
                    <span className={styles.selectedCount}>
                      {selectedUsers.size}{' '}
                      {t('accountSettings.deleteUsers.selected')}
                    </span>
                    <Button
                      variant='danger'
                      onClick={handleDeleteSelected}
                      aria-label={t(
                        'accountSettings.deleteUsers.deleteSelected'
                      )}
                    >
                      <svg
                        width='16'
                        height='16'
                        viewBox='0 0 16 16'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                        aria-hidden='true'
                      >
                        <path
                          d='M2 4H14M12.6667 4V13.3333C12.6667 14 12 14.6667 11.3333 14.6667H4.66667C4 14.6667 3.33333 14 3.33333 13.3333V4M5.33333 4V2.66667C5.33333 2 6 1.33333 6.66667 1.33333H9.33333C10 1.33333 10.6667 2 10.6667 2.66667V4'
                          stroke='currentColor'
                          strokeWidth='1.5'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                        <path
                          d='M6.66667 7.33333V11.3333'
                          stroke='currentColor'
                          strokeWidth='1.5'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                        <path
                          d='M9.33333 7.33333V11.3333'
                          stroke='currentColor'
                          strokeWidth='1.5'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>
                    </Button>
                  </div>
                )}
              </div>

              {loadingUsers ? (
                <p className={styles.loading}>
                  {t('accountSettings.deleteUsers.loading')}
                </p>
              ) : filteredUsers.length === 0 ? (
                <p className={styles.empty}>
                  {searchQuery
                    ? t('accountSettings.deleteUsers.noResults')
                    : t('accountSettings.deleteUsers.empty')}
                </p>
              ) : (
                <>
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>
                            <input
                              type='checkbox'
                              checked={
                                selectedUsers.size === filteredUsers.length &&
                                filteredUsers.length > 0
                              }
                              onChange={handleSelectAll}
                              className={styles.checkbox}
                            />
                          </th>
                          <th>{t('common.name')}</th>
                          <th>{t('common.email')}</th>
                          <th>{t('common.stake')}</th>
                          <th>{t('common.ward')}</th>
                          <th>{t('common.role')}</th>
                          <th>{t('common.actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr key={user.id}>
                            <td>
                              <input
                                type='checkbox'
                                checked={selectedUsers.has(user.id)}
                                onChange={() => handleSelectUser(user.id)}
                                className={styles.checkbox}
                              />
                            </td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td className={styles.stakeWardCell}>
                              {user.stake
                                ? getStakeLabel(user.stake) || user.stake
                                : '-'}
                            </td>
                            <td className={styles.stakeWardCell}>
                              {user.stake && user.ward
                                ? getWardLabel(user.stake, user.ward) ||
                                  user.ward
                                : user.ward || '-'}
                            </td>
                            <td>
                              <StatusChip
                                status={user.role || ''}
                                tone={
                                  user.role === USER_ROLES.ADMIN
                                    ? 'admin'
                                    : user.role === USER_ROLES.STAKE_PRESIDENT
                                      ? 'stakePresident'
                                      : user.role === USER_ROLES.BISHOP
                                        ? 'bishop'
                                        : user.role ===
                                            USER_ROLES.SESSION_LEADER
                                          ? 'sessionLeader'
                                          : 'applicant'
                                }
                                label={getRoleLabelForUser(user.role)}
                              />
                            </td>
                            <td>
                              <Button
                                variant='danger'
                                onClick={async () => {
                                  if (
                                    window.confirm(
                                      t(
                                        'accountSettings.deleteUsers.confirmDeleteSingle',
                                        { userName: user.name }
                                      )
                                    )
                                  ) {
                                    try {
                                      await usersApi.deleteUser(user.id);
                                      await loadUsers();
                                      setSelectedUsers((prev) => {
                                        const next = new Set(prev);
                                        next.delete(user.id);
                                        return next;
                                      });
                                      setSuccess(
                                        t(
                                          'accountSettings.deleteUsers.deletedSingle',
                                          { userName: user.name }
                                        )
                                      );
                                    } catch (err) {
                                      setError((err as Error).message);
                                    }
                                  }
                                }}
                                aria-label={`${t('common.delete')} ${user.name}`}
                              >
                                <svg
                                  width='16'
                                  height='16'
                                  viewBox='0 0 24 24'
                                  fill='none'
                                  stroke='currentColor'
                                  strokeWidth='2'
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  aria-hidden='true'
                                >
                                  <path d='M3 6h18'></path>
                                  <path d='M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6'></path>
                                  <path d='M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2'></path>
                                </svg>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className={styles.cardList}>
                    {filteredUsers.map((user) => (
                      <div key={user.id} className={styles.card}>
                        <div className={styles.cardHeader}>
                          <div className={styles.cardCheckbox}>
                            <input
                              type='checkbox'
                              checked={selectedUsers.has(user.id)}
                              onChange={() => handleSelectUser(user.id)}
                              className={styles.checkbox}
                            />
                          </div>
                          <div className={styles.cardInfo}>
                            <div className={styles.cardNameRow}>
                              <div className={styles.cardName}>{user.name}</div>
                              <StatusChip
                                status={user.role || ''}
                                tone={
                                  user.role === USER_ROLES.ADMIN
                                    ? 'admin'
                                    : user.role === USER_ROLES.STAKE_PRESIDENT
                                      ? 'stakePresident'
                                      : user.role === USER_ROLES.BISHOP
                                        ? 'bishop'
                                        : user.role ===
                                            USER_ROLES.SESSION_LEADER
                                          ? 'sessionLeader'
                                          : 'applicant'
                                }
                                label={getRoleLabelForUser(user.role)}
                                className={styles.cardRole}
                              />
                            </div>
                            <div className={styles.cardEmail}>{user.email}</div>
                          </div>
                        </div>
                        <div className={styles.cardSection}>
                          <label className={styles.cardLabel}>
                            {t('common.stake')}
                          </label>
                          <div className={styles.cardValue}>
                            {user.stake
                              ? getStakeLabel(user.stake) || user.stake
                              : '-'}
                          </div>
                        </div>
                        <div className={styles.cardSection}>
                          <label className={styles.cardLabel}>
                            {t('common.ward')}
                          </label>
                          <div className={styles.cardValue}>
                            {user.stake && user.ward
                              ? getWardLabel(user.stake, user.ward) || user.ward
                              : user.ward || '-'}
                          </div>
                        </div>
                        <div className={styles.cardActions}>
                          <Button
                            variant='danger'
                            onClick={async () => {
                              if (
                                window.confirm(
                                  t(
                                    'accountSettings.deleteUsers.confirmDeleteSingle',
                                    { userName: user.name }
                                  )
                                )
                              ) {
                                try {
                                  await usersApi.deleteUser(user.id);
                                  await loadUsers();
                                  setSelectedUsers((prev) => {
                                    const next = new Set(prev);
                                    next.delete(user.id);
                                    return next;
                                  });
                                  setSuccess(
                                    t(
                                      'accountSettings.deleteUsers.deletedSingle',
                                      { userName: user.name }
                                    )
                                  );
                                } catch (err) {
                                  setError((err as Error).message);
                                }
                              }
                            }}
                            aria-label={`${t('common.delete')} ${user.name}`}
                          >
                            <svg
                              width='16'
                              height='16'
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='currentColor'
                              strokeWidth='2'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              aria-hidden='true'
                            >
                              <path d='M3 6h18'></path>
                              <path d='M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6'></path>
                              <path d='M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2'></path>
                            </svg>
                            {t('common.delete')}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSettings;
