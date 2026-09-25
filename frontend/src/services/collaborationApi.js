import api from "./api";

export const applyForCollaboration = async (
  opportunityId,
  message = ""
) => {
  const response = await api.post(
    `/collaborations/opportunities/${opportunityId}/apply`,
    { message }
  );

  return response.data;
};

export const getMyCollaborationRequests = async () => {
  const response = await api.get("/collaborations/my");

  return response.data;
};

export const getOpportunityRequests = async (opportunityId) => {
  const response = await api.get(
    `/collaborations/opportunities/${opportunityId}/requests`
  );

  return response.data;
};

export const updateCollaborationStatus = async (
  id,
  data
) => {
  const response = await api.put(
    `/collaborations/${id}/status`,
    data
  );

  return response.data;
};