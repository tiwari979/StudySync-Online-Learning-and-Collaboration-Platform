import axiosInstance from "@/api/axiosInstance";

export async function getAllTestsService() {
  const { data } = await axiosInstance.get("/tests/all");
  return data;
}

export async function getTestByIdService(id) {
  const { data } = await axiosInstance.get(`/tests/${id}`);
  return data;
}

export async function submitTestService(testData) {
  const { data } = await axiosInstance.post("/tests/submit", testData);
  return data;
}

export async function getStudentTestHistoryService() {
  const { data } = await axiosInstance.get("/tests/history/me");
  return data;
}

export async function createTestService(testData) {
  const { data } = await axiosInstance.post("/tests/create", testData);
  return data;
}

export async function updateTestService(id, testData) {
  const { data } = await axiosInstance.put(`/tests/instructor/${id}`, testData);
  return data;
}

export async function getInstructorTestByIdService(id) {
  const { data } = await axiosInstance.get(`/tests/instructor/${id}`);
  return data;
}

export async function getInstructorTestsService() {
  const { data } = await axiosInstance.get("/tests/instructor/my-tests");
  return data;
}

export async function deleteTestService(id) {
  const { data } = await axiosInstance.delete(`/tests/${id}`);
  return data;
}
