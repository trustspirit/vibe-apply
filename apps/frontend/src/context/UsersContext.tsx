/**
 * UsersContext - Handles user management data and operations
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { usersApi } from '@/services/api';
import { useAuth } from './AuthContext';
import type { User } from '@vibe-apply/shared';
import { normalizeUserRole, isLeaderRole, UserRole, LeaderStatus } from '@vibe-apply/shared';

type UserWithoutPassword = Omit<User, 'password'>;

interface UsersContextValue {
  users: UserWithoutPassword[];
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  updateLeaderStatus: (userId: string, status: LeaderStatus) => Promise<void>;
  refetchUsers: () => Promise<void>;
}

const UsersContext = createContext<UsersContextValue | null>(null);

const normalizeUserRecord = (
  user: UserWithoutPassword | null
): UserWithoutPassword | null => {
  if (!user) {
    return user;
  }

  if (user.role === null) {
    return {
      ...user,
      role: null,
      leaderStatus: null,
    };
  }

  const normalizedRole: UserRole = normalizeUserRole(user.role);
  const leaderStatus: LeaderStatus | null = isLeaderRole(normalizedRole)
    ? user.leaderStatus === LeaderStatus.APPROVED
      ? LeaderStatus.APPROVED
      : LeaderStatus.PENDING
    : null;

  return {
    ...user,
    role: normalizedRole,
    leaderStatus,
  };
};

interface UsersProviderProps {
  children: ReactNode;
}

export const UsersProvider = ({ children }: UsersProviderProps) => {
  const { currentUser, setUser } = useAuth();
  const [users, setUsers] = useState<UserWithoutPassword[]>([]);

  const updateUserRole = useCallback(
    async (userId: string, role: UserRole) => {
      await usersApi.updateRole(userId, role);
      let updatedUser: UserWithoutPassword | null = null;
      setUsers((prev) =>
        prev.map((user) => {
          if (user.id !== userId) {
            return user;
          }
          const normalizedRole = role as UserRole;
          const leaderStatus: LeaderStatus | null = isLeaderRole(normalizedRole)
            ? (user.leaderStatus ?? LeaderStatus.PENDING)
            : null;
          updatedUser = {
            ...user,
            role: normalizedRole,
            leaderStatus,
          };
          return updatedUser;
        })
      );

      // Update current user if they are the one being updated
      if (userId === currentUser?.id && updatedUser) {
        setUser(updatedUser);
      }
    },
    [currentUser?.id, setUser]
  );

  const updateLeaderStatus = useCallback(
    async (userId: string, status: LeaderStatus) => {
      await usersApi.updateLeaderStatus(userId, status);
      let updatedUser: UserWithoutPassword | null = null;
      setUsers((prev) =>
        prev.map((user) => {
          if (user.id === userId) {
            updatedUser = {
              ...user,
              leaderStatus: status,
            };
            return updatedUser;
          }
          return user;
        })
      );

      // Update current user if they are the one being updated
      if (userId === currentUser?.id && updatedUser) {
        setUser(updatedUser);
      }
    },
    [currentUser?.id, setUser]
  );

  const refetchUsers = useCallback(async () => {
    if (currentUser?.role !== UserRole.ADMIN) {
      return;
    }

    try {
      const fetchedUsers = await usersApi.getAll();
      setUsers(fetchedUsers.map((u) => normalizeUserRecord(u)!));
    } catch (error) {
      void error;
    }
  }, [currentUser?.role]);

  const value = useMemo(
    () => ({
      users,
      updateUserRole,
      updateLeaderStatus,
      refetchUsers,
    }),
    [users, updateUserRole, updateLeaderStatus, refetchUsers]
  );

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
};

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
};
