import api from "./api";

export const getMyInternships = async () => {
  const response = await api.get("/internships/industry/mine");
  return response.data;
};

export const createInternship = async (payload) => {
  const response = await api.post("/internships", payload);
  return response.data;
};

export const updateInternship = async (id, payload) => {
  const response = await api.put(`/internships/${id}`, payload);
  return response.data;
};

export const deleteInternship = async (id) => {
  const response = await api.delete(`/internships/${id}`);
  return response.data;
};
export const getIndustryProfile = async () => {
  const response = await api.get("/industry/profile");
  return response.data;
};

export const updateIndustryProfile = async (profileData) => {
  const response = await api.put(
    "/industry/profile",
    profileData
  );

  return response.data;
};
export const getIndustryDemand = async () => {
  const response = await api.get("/industry/demand");
  return response.data;
};