import api from "./api";

export const getJobs = async () => {
  const response = await api.get("/jobs");
  return response.data;
};

export const getJob = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}`);
  return response.data;
};

export const getMyJobs = async () => {
  const response = await api.get("/jobs/industry/mine");
  return response.data;
};

export const createJob = async (jobData) => {
  const response = await api.post("/jobs", jobData);
  return response.data;
};

export const updateJob = async (jobId, jobData) => {
  const response = await api.put(`/jobs/${jobId}`, jobData);
  return response.data;
};

export const deleteJob = async (jobId) => {
  const response = await api.delete(`/jobs/${jobId}`);
  return response.data;
};

export const getJobMatch = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}/match`);
  return response.data;
};

export const applyForJob = async (jobId, coverMessage = "") => {
  const response = await api.post(`/job-applications/${jobId}`, {
    coverMessage,
  });
  return response.data;
};

export const getMyJobApplications = async () => {
  const response = await api.get("/job-applications/my");
  return response.data;
};

export const getJobApplications = async (jobId) => {
  const response = await api.get(`/job-applications/job/${jobId}`);
  return response.data;
};

export const updateJobApplicationStatus = async (
  applicationId,
  status
) => {
  const response = await api.put(
    `/job-applications/${applicationId}/status`,
    { status }
  );

  return response.data;
};


export const updatePlacementDetails = async (
  applicationId,
  placement
) => {
  const response = await api.put(
    `/job-applications/${applicationId}/placement`,
    placement
  );

  return response.data;
};