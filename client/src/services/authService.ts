export async function registerUser(data: any) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Registration failed");
  }
  
  return response.json();
}

function getAuthHeaders(): Record<string, string> {
  const savedUser = localStorage.getItem("kidspace_user");
  if (savedUser) {
    const user = JSON.parse(savedUser);
    if (user.token) {
      return { "Authorization": `Bearer ${user.token}` };
    }
  }
  return {};
}

export async function loginUser(data: any) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Login failed");
  }
  
  return response.json();
}

export async function updateSettings(kidId: number, data: any) {
  const authHeaders = getAuthHeaders();
  const response = await fetch(`/api/settings/${kidId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update settings");
  }

  return response.json();
}
