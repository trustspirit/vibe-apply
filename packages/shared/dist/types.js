export var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["SESSION_LEADER"] = "session_leader";
    UserRole["STAKE_PRESIDENT"] = "stake_president";
    UserRole["BISHOP"] = "bishop";
    UserRole["APPLICANT"] = "applicant";
})(UserRole || (UserRole = {}));
export var LeaderStatus;
(function (LeaderStatus) {
    LeaderStatus["PENDING"] = "pending";
    LeaderStatus["APPROVED"] = "approved";
})(LeaderStatus || (LeaderStatus = {}));
export var ApplicationStatus;
(function (ApplicationStatus) {
    ApplicationStatus["DRAFT"] = "draft";
    ApplicationStatus["AWAITING"] = "awaiting";
    ApplicationStatus["APPROVED"] = "approved";
    ApplicationStatus["REJECTED"] = "rejected";
})(ApplicationStatus || (ApplicationStatus = {}));
export var RecommendationStatus;
(function (RecommendationStatus) {
    RecommendationStatus["DRAFT"] = "draft";
    RecommendationStatus["SUBMITTED"] = "submitted";
    RecommendationStatus["APPROVED"] = "approved";
    RecommendationStatus["REJECTED"] = "rejected";
})(RecommendationStatus || (RecommendationStatus = {}));
export var Gender;
(function (Gender) {
    Gender["MALE"] = "male";
    Gender["FEMALE"] = "female";
})(Gender || (Gender = {}));
