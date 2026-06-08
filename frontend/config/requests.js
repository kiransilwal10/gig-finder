import { DEBUG, SERVER_URL } from "./conf";

export const verifyUser = async (ctx) => {
  //Set Initial Variables
  let isAuthenticated = false;
  let user = null;
  let redirect = null;
  try {
    const response = await fetch(`${SERVER_URL}/verify`, {
      credentials: "include",
      method: "POST",
      headers: ctx.req.headers,
    });

    if (response.ok) {
      //Response is OK -- User Verified
      const re = await response.json();
      isAuthenticated = true;
      user = re?.user;

      //IF the user is currently at homepage or login page, redirect to dashboard
      if (ctx.resolvedUrl === "/" || ctx.resolvedUrl === "/login") {
        redirect = "/dashboard";
      }
    } else {
      //Response is not OK -- User Unverified
      isAuthenticated = false;
      user = null;

      //Do not redirect if the user is in homepage or login page if Unauthenticated as it leads to infinite redirect loops
      if (ctx.resolvedUrl === "/" || ctx.resolvedUrl === "/login") {
        redirect = null;
      } else {
        redirect = "/login";
      }
    }
  } catch (err) {
    if (DEBUG) console.err("Authentication error:", err);
    throw err;
  }

  return {
    authenticated: isAuthenticated,
    user: user,
    redirect: redirect,
  };
};

const jsonHeaders = { "Content-Type": "application/json" };

const handle = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data;
  return data;
};

export const fetchGigs = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.location) params.set("location", filters.location);
  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
  const qs = params.toString();
  const res = await fetch(`${SERVER_URL}/gigs${qs ? `?${qs}` : ""}`, {
    credentials: "include",
  });
  return (await handle(res)).gigs;
};

export const fetchGig = async (id) => {
  const res = await fetch(`${SERVER_URL}/gigs/${id}`, {
    credentials: "include",
  });
  return (await handle(res)).gig;
};

export const createGig = async (payload) => {
  const res = await fetch(`${SERVER_URL}/gigs`, {
    method: "POST",
    credentials: "include",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });
  return (await handle(res)).gig;
};

export const startOnboarding = async () => {
  const res = await fetch(`${SERVER_URL}/connect/onboard`, {
    method: "POST",
    credentials: "include",
  });
  return (await handle(res)).url;
};

export const fetchConnectStatus = async () => {
  const res = await fetch(`${SERVER_URL}/connect/status`, {
    credentials: "include",
  });
  return handle(res);
};

export const fetchDashboardLink = async () => {
  const res = await fetch(`${SERVER_URL}/connect/dashboard-link`, {
    method: "POST",
    credentials: "include",
  });
  return (await handle(res)).url;
};

export const startCheckout = async (gigId) => {
  const res = await fetch(`${SERVER_URL}/checkout/${gigId}`, {
    method: "POST",
    credentials: "include",
  });
  return (await handle(res)).url;
};

export const fetchMyOrders = async () => {
  const res = await fetch(`${SERVER_URL}/orders/mine`, {
    credentials: "include",
  });
  return (await handle(res)).orders;
};

export const fetchMySales = async () => {
  const res = await fetch(`${SERVER_URL}/orders/sales`, {
    credentials: "include",
  });
  return (await handle(res)).orders;
};

export const fetchEarnings = async () => {
  const res = await fetch(`${SERVER_URL}/orders/earnings`, {
    credentials: "include",
  });
  return (await handle(res)).earnings;
};
