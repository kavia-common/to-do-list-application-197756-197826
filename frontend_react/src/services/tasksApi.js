const DEFAULT_API_BASE_URL = "http://localhost:3001";

/**
 * Return base URL from env var, with fallback to local backend.
 * CRA exposes env vars only if prefixed with REACT_APP_.
 */
function getApiBaseUrl() {
  const fromEnv = process.env.REACT_APP_API_BASE_URL;
  return (fromEnv && fromEnv.trim()) ? fromEnv.trim() : DEFAULT_API_BASE_URL;
}

async function parseJsonSafely(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  const text = await response.text();
  return text ? { message: text } : null;
}

async function request(path, options = {}) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await parseJsonSafely(res);

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && data.message) ||
      `Request failed with status ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

// PUBLIC_INTERFACE
export async function fetchTasks() {
  /** Fetch all tasks from backend. */
  return request("/tasks", { method: "GET" });
}

// PUBLIC_INTERFACE
export async function createTask(payload) {
  /** Create a task. payload: { title, description?, due_date? } */
  return request("/tasks", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

// PUBLIC_INTERFACE
export async function updateTask(id, payload) {
  /** Update a task by id. payload: { title, description?, due_date?, is_completed? } */
  return request(`/tasks/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

// PUBLIC_INTERFACE
export async function deleteTask(id) {
  /** Delete a task by id. */
  return request(`/tasks/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
}

// PUBLIC_INTERFACE
export async function toggleTaskComplete(id) {
  /** Toggle task completion. */
  return request(`/tasks/${encodeURIComponent(id)}/complete`, {
    method: "PATCH"
  });
}
