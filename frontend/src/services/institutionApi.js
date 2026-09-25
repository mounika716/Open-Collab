import api from "./api";

export const getInstitutionProfile = async () => {
  const response = await api.get("/institution/profile");
  return response.data;
};

export const updateInstitutionProfile = async (profileData) => {
  const response = await api.put(
    "/institution/profile",
    profileData
  );

  return response.data;
};
export const getInstitutionDashboard = async () => {
  const response = await api.get(
    "/institution/dashboard"
  );

  return response.data;
};

export const getInstitutionAnalytics = async () => {
  const response = await api.get(
    "/institution/analytics"
  );

  return response.data;
};