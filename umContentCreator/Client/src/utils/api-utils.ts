export async function postJson<TRequest, TResponse>(
  url: string,
  data: TRequest
): Promise<TResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error: ${response.status} - ${error}`);
  }

  return await response.json();
}

export async function postStatus<TRequest>(
  url: string,
  data: TRequest
): Promise<void> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error: ${response.status} - ${error}`);
  }
}

export async function getJson<TResponse>(url: string): Promise<TResponse> {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error: ${response.status} - ${error}`);
  }

  return await response.json();
}
