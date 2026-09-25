import api from "./api";

export const getStudentPortfolio = async () => {
  const response = await api.get("/student/portfolio");
  return response.data;
};