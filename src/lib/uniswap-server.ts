import "server-only";

const uniswapApi = "https://trade-api.gateway.uniswap.org/v1";
export const uniswapRouterVersion = "2.1.1";

type ProviderErrorBody = {
  error?: string;
  detail?: string;
  message?: string;
};

export class UniswapApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function uniswapPost<T>(
  endpoint: "quote" | "check_approval" | "swap",
  body: unknown,
) {
  const apiKey = process.env.UNISWAP_API_KEY;
  if (!apiKey) {
    throw new UniswapApiError(
      503,
      "Live trading is not configured yet. Add a Uniswap API key to the server environment.",
    );
  }

  let response: Response;
  try {
    response = await fetch(`${uniswapApi}/${endpoint}`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-api-key": apiKey,
        "x-universal-router-version": uniswapRouterVersion,
        "x-permit2-disabled": "false",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new UniswapApiError(
      503,
      "Uniswap is temporarily unreachable. Please try again.",
    );
  }

  const payload = (await response.json().catch(() => ({}))) as
    | T
    | ProviderErrorBody;
  if (!response.ok) {
    if (response.status === 400) {
      const message =
        typeof payload === "object" && payload !== null && "detail" in payload
          ? payload.detail
          : undefined;
      throw new UniswapApiError(
        422,
        typeof message === "string" && message.toLowerCase().includes("quote")
          ? "No route is available for this token pair and amount. Try another amount or asset."
          : "Uniswap could not process this trade request. Check the selected network, pair, and amount.",
      );
    }
    if (response.status === 401 || response.status === 403) {
      throw new UniswapApiError(
        503,
        "The Uniswap API key is invalid or not enabled for trading.",
      );
    }
    if (response.status === 429) {
      throw new UniswapApiError(
        503,
        "Uniswap is receiving too many requests. Please wait and try again.",
      );
    }
    throw new UniswapApiError(
      503,
      "Uniswap is temporarily unable to complete this request.",
    );
  }

  return payload as T;
}

export function uniswapFailure(error: unknown) {
  const status =
    error instanceof UniswapApiError ? error.status : 503;
  const message =
    error instanceof Error
      ? error.message
      : "Uniswap is temporarily unable to complete this request.";
  return { status, message };
}
