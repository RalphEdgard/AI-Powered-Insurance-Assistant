import type {
  ConversationQueryRequest,
  ConversationQueryResponse,
  EvaluationResultsResponse,
  PlanSummary,
} from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

async function parseApiError(response: Response): Promise<string> {
  try {
    const body = await response.json();

    if (typeof body.detail === "string") {
      return body.detail;
    }

    return `CareConnect API request failed with status ${response.status}`;
  } catch {
    return `CareConnect API request failed with status ${response.status}`;
  }
}

export async function getPlans(): Promise<PlanSummary[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/plans`);

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json();
}

export async function submitConversationQuery(
  request: ConversationQueryRequest
): Promise<ConversationQueryResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/conversations/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json();
}

export async function getEvaluationResults(): Promise<EvaluationResultsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/evaluations/results`);

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json();
}