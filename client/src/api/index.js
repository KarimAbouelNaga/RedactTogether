import axios from "axios";

export async function getUserData() {
  const response = await axios.get("/api/users/isLoggedIn", {
    withCredentials: true,
  });
  return response.data.user;
}

export async function getDocById(docId) {
  const { data } = await axios.get(`/api/docs/${docId}`);
  return data;
}

export async function saveDoc(docId, value) {
  const { data } = await axios.patch(`/api/docs/${docId}`, {
    content: value,
  });
  return data;
}

export async function saveComment({ docId, userId, comment, token }) {
  const { data } = await axios.post(
    "/api/comments",
    {
      docId,
      commenterId: userId,
      comment,
      token,
    },
    { withCredentials: true }
  );
  return data;
}

export async function getComments(docId) {
  const { data } = await axios.get(`/api/comments/${docId}`, {
    withCredentials: true,
  });
  return data?.data?.allComments;
}

export async function getSuggestionsAccepted(userId, docId) {
  const { data } = await axios.get(
    `/api/suggestions-accepted/${userId}/${docId}`,
    {
      withCredentials: true,
    }
  );
  return data?.data?.suggestions;
}

export async function deletSuggestionAcceptedWaitingComment(token) {
  const { data } = await axios.delete(
    `/api/suggestion-accepted-waiting-comment/${token}`,
    {
      withCredentials: true,
    }
  );

  return data;
}

export async function findDocsByName(name) {
  const { data } = await axios("/api/docs/search", {
    method: "POST",
    data: { name },
    withCredentials: true,
  });
  return data;
}
export async function deleteComment(id) {
  return await axios.delete(`/api/comments/${id}`, {
    withCredentials: true,
  });
}
