import axiosInstance from "@/api/axiosInstance";

export async function askChatbotService(message) {
  const { data } = await axiosInstance.post("/chatbot/ask", { message });
  return data;
}
