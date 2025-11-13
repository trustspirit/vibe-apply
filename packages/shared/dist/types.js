"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gender = exports.RecommendationStatus = exports.ApplicationStatus = exports.LeaderStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["SESSION_LEADER"] = "session_leader";
    UserRole["STAKE_PRESIDENT"] = "stake_president";
    UserRole["BISHOP"] = "bishop";
    UserRole["APPLICANT"] = "applicant";
})(UserRole || (exports.UserRole = UserRole = {}));
var LeaderStatus;
(function (LeaderStatus) {
    LeaderStatus["PENDING"] = "pending";
    LeaderStatus["APPROVED"] = "approved";
})(LeaderStatus || (exports.LeaderStatus = LeaderStatus = {}));
var ApplicationStatus;
(function (ApplicationStatus) {
    ApplicationStatus["DRAFT"] = "draft";
    ApplicationStatus["AWAITING"] = "awaiting";
    ApplicationStatus["APPROVED"] = "approved";
    ApplicationStatus["REJECTED"] = "rejected";
})(ApplicationStatus || (exports.ApplicationStatus = ApplicationStatus = {}));
var RecommendationStatus;
(function (RecommendationStatus) {
    RecommendationStatus["DRAFT"] = "draft";
    RecommendationStatus["SUBMITTED"] = "submitted";
    RecommendationStatus["APPROVED"] = "approved";
    RecommendationStatus["REJECTED"] = "rejected";
})(RecommendationStatus || (exports.RecommendationStatus = RecommendationStatus = {}));
var Gender;
(function (Gender) {
    Gender["MALE"] = "male";
    Gender["FEMALE"] = "female";
})(Gender || (exports.Gender = Gender = {}));
