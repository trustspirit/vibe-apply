// src/types.ts
var UserRole = /* @__PURE__ */ ((UserRole2) => {
  UserRole2["ADMIN"] = "admin";
  UserRole2["SESSION_LEADER"] = "session_leader";
  UserRole2["STAKE_PRESIDENT"] = "stake_president";
  UserRole2["BISHOP"] = "bishop";
  UserRole2["APPLICANT"] = "applicant";
  return UserRole2;
})(UserRole || {});
var LeaderStatus = /* @__PURE__ */ ((LeaderStatus2) => {
  LeaderStatus2["PENDING"] = "pending";
  LeaderStatus2["APPROVED"] = "approved";
  return LeaderStatus2;
})(LeaderStatus || {});
var ApplicationStatus = /* @__PURE__ */ ((ApplicationStatus2) => {
  ApplicationStatus2["DRAFT"] = "draft";
  ApplicationStatus2["AWAITING"] = "awaiting";
  ApplicationStatus2["APPROVED"] = "approved";
  ApplicationStatus2["REJECTED"] = "rejected";
  return ApplicationStatus2;
})(ApplicationStatus || {});
var RecommendationStatus = /* @__PURE__ */ ((RecommendationStatus2) => {
  RecommendationStatus2["DRAFT"] = "draft";
  RecommendationStatus2["SUBMITTED"] = "submitted";
  RecommendationStatus2["APPROVED"] = "approved";
  RecommendationStatus2["REJECTED"] = "rejected";
  return RecommendationStatus2;
})(RecommendationStatus || {});
var Gender = /* @__PURE__ */ ((Gender2) => {
  Gender2["MALE"] = "male";
  Gender2["FEMALE"] = "female";
  return Gender2;
})(Gender || {});

// src/utils/role.utils.ts
var LEADER_ROLES = [
  "session_leader" /* SESSION_LEADER */,
  "bishop" /* BISHOP */,
  "stake_president" /* STAKE_PRESIDENT */
];
function isLeaderRole(role) {
  if (!role) return false;
  return LEADER_ROLES.includes(role);
}
function isApprovedLeader(user) {
  if (!user || !user.role) return false;
  return isLeaderRole(user.role) && user.leaderStatus === "approved" /* APPROVED */;
}
function isAdmin(role) {
  return role === "admin" /* ADMIN */;
}
function canReviewApplications(user) {
  if (!user || !user.role) return false;
  return isAdmin(user.role) || isApprovedLeader(user);
}
function normalizeUserRole(role) {
  if (!role) return "applicant" /* APPLICANT */;
  const validRoles = Object.values(UserRole);
  if (validRoles.includes(role)) {
    return role;
  }
  return "applicant" /* APPLICANT */;
}

// src/utils/string.utils.ts
function normalizeString(value) {
  if (!value) return "";
  return value.trim().toLowerCase();
}
function normalizeEmail(email) {
  return normalizeString(email);
}
function normalizeWardStakeName(name) {
  return normalizeString(name);
}
export {
  ApplicationStatus,
  Gender,
  LEADER_ROLES,
  LeaderStatus,
  RecommendationStatus,
  UserRole,
  canReviewApplications,
  isAdmin,
  isApprovedLeader,
  isLeaderRole,
  normalizeEmail,
  normalizeString,
  normalizeUserRole,
  normalizeWardStakeName
};
