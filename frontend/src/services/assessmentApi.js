import api from "./api";

export const startAssessment = async (skill) => {
  const response = await api.post("/assessment/start", {
    skill,
  });

  return response.data;
};

export const getAssessment = async (assessmentId) => {
  const response = await api.get(
    `/assessment/${assessmentId}`
  );

  return response.data;
};

export const submitCode = async (
  assessmentId,
  code
) => {
  const response = await api.post(
    `/assessment/${assessmentId}/submit`,
    {
      code,
    }
  );

  return response.data;
};

export const recordViolation = async (
  assessmentId,
  type,
  details = ""
) => {
  const response = await api.post(
    `/assessment/${assessmentId}/violation`,
    {
      type,
      details,
    }
  );

  return response.data;
};

export const completeAssessment = async (
  assessmentId
) => {
  const response = await api.post(
    `/assessment/${assessmentId}/complete`
  );

  return response.data;
};

export const getAssessmentHistory = async () => {
  const response = await api.get(
    "/assessment/history"
  );

  return response.data;
};