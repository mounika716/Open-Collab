import api from "./api";

export const getOpportunities = async (params = {}) => {
  const response = await api.get(
    "/opportunities",
    { params }
  );

  return response.data;
};

export const getMyOpportunities = async () => {
  const response = await api.get(
    "/opportunities/mine"
  );

  return response.data;
};

export const createOpportunity = async (
  opportunityData
) => {
  const response = await api.post(
    "/opportunities",
    opportunityData
  );

  return response.data;
};

export const updateOpportunity = async (
  id,
  opportunityData
) => {
  const response = await api.put(
    `/opportunities/${id}`,
    opportunityData
  );

  return response.data;
};

export const deleteOpportunity = async (id) => {
  const response = await api.delete(
    `/opportunities/${id}`
  );

  return response.data;
};
