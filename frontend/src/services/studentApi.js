import api from "./api";

export const getStudentProfile = async () => {
  const response = await api.get("/student/profile");
  return response.data;
};

export const updateStudentProfile = async (profileData) => {
  const response = await api.put(
    "/student/profile",
    profileData
  );

  return response.data;
};

export const getCareerIntelligence = async () => {
  const response = await api.get(
    "/student/career-intelligence"
  );

  return response.data;
};

export const getStudentRecommendations = async () => {
  const response = await api.get(
    "/student/recommendations"
  );

  return response.data;
};

export const getSkillGapIntelligence = async () => {
  const response = await api.get(
    "/student/skill-gap"
  );

  return response.data;
};