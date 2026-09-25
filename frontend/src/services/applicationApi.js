import api from "./api";

export const applyForInternship = async (
  internshipId,
  coverMessage
) => {
  const response = await api.post(
    `/applications/${internshipId}`,
    {
      coverMessage,
    }
  );

  return response.data;
};

export const getMyApplications = async () => {
  const response = await api.get("/applications/my");
  return response.data;
};

export const getMyApplication = async (id) => {
  const response = await api.get(`/applications/my/${id}`);
  return response.data;
};

export const getInternshipApplications = async (internshipId) => {
  const response = await api.get(
    `/applications/internship/${internshipId}`
  );

  return response.data;
};

export const updateApplicationStatus = async (
  applicationId,
  status
) => {
  const response = await api.put(
    `/applications/${applicationId}/status`,
    { status }
  );

  return response.data;
};
export const evaluateInternship = async (
  applicationId,
  evaluation
) => {
  const response = await api.put(
    `/applications/${applicationId}/evaluation`,
    evaluation
  );

  return response.data;
};

export const issueInternshipCertificate = async (
  applicationId,
  certificate
) => {
  const response = await api.put(
    `/applications/${applicationId}/certificate`,
    certificate
  );

  return response.data;
};