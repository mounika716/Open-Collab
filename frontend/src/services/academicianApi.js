import api from "./api";

export const getAcademicianDashboard = async () => {
  const response = await api.get(
    "/academician/dashboard"
  );

  return response.data;
};

export const getAcademicianProfile = async () => {
  const response = await api.get("/academician/profile");
  return response.data;
};

export const updateAcademicianProfile = async (profileData) => {
  const response = await api.put(
    "/academician/profile",
    profileData
  );

  return response.data;
};
