import api from "./api";

export const getInternships = async () => {
  const response = await api.get("/internships");
  return response.data;
};

export const getInternship = async (id) => {
  const response = await api.get(`/internships/${id}`);
  return response.data;
};

export const getInternshipMatch = async (id) => {
  const response = await api.get(`/internships/${id}/match`);
  return response.data;
};

// Industry: get internships posted by the logged-in company
export const getMyInternships = async () => {
  const response = await api.get("/internships/industry/mine");
  return response.data;
};

// Industry: create internship
export const createInternship = async (internshipData) => {
  const response = await api.post(
    "/internships",
    internshipData
  );

  return response.data;
};

// Industry: update internship
export const updateInternship = async (id, internshipData) => {
  const response = await api.put(
    `/internships/${id}`,
    internshipData
  );

  return response.data;
};

// Industry: delete internship
export const deleteInternship = async (id) => {
  const response = await api.delete(
    `/internships/${id}`
  );

  return response.data;
};