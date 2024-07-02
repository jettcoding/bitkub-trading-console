import axios from "axios";
import hmacSHA256 from "crypto-js/hmac-sha256";

const sendUrl = "http://64.176.84.86/sendApi";
const baseUrl = "https://api.bitkub.com";

export const getWallet = async (sercetkey, apikey) => {
  const { data, ts, sig } = await hashData(sercetkey, apikey, "/api/v3/market/balances", "POST", {});
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-BTK-APIKEY": apikey,
    "X-BTK-TIMESTAMP": ts,
    "X-BTK-SIGN": sig,
  };
  const response = await axios.post(sendUrl, {
    method: "POST",
    url: baseUrl + "/api/v3/market/balances",
    headers: headers,
    data: data,
  });

  let filldata = [];
  if (response.data.error === 0) {
    for (const property in response.data.result) {
      if (
        response.data.result[property].available > 0 ||
        response.data.result[property].reserved > 0
      ) {
        filldata.push([
          property,
          response.data.result[property].available,
          response.data.result[property].reserved,
        ]);
      }
    }
    return filldata;
  } else {
    return false;
  }
};

export const getList = async () => {
  const response = await axios.post(sendUrl, {
    method: "GET",
    url: baseUrl + "/api/market/symbols",
  });
  return response.data.result;
};

export const getPrice = async (symbol) => {
  const response = await axios.post(sendUrl, {
    method: "GET",
    url: baseUrl + "/api/market/ticker?sym=" + symbol,
  });
  return response.data[symbol];
};

export const buy = async (symbol, sercetkey, apikey, type, amount, rate = 0) => {
  const formattedSymbol = formatSymbol(symbol);
  const { data, ts, sig } = await hashData(sercetkey, apikey, "/api/v3/market/place-bid", "POST", {
    sym: formattedSymbol,
    amt: amount,
    rat: type === "limit" ? rate : 0,
    typ: type,
  });
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-BTK-APIKEY": apikey,
    "X-BTK-TIMESTAMP": ts,
    "X-BTK-SIGN": sig,
  };
  const response = await axios.post(sendUrl, {
    method: "POST",
    url: baseUrl + "/api/v3/market/place-bid",
    headers: headers,
    data: data,
  });
  if (response.data.error === 0) {
    return true;
  } else {
    return false;
  }
};

export const sell = async (symbol, sercetkey, apikey, type, amount, rate = 0) => {
  const formattedSymbol = formatSymbol(symbol);
  const { data, ts, sig } = await hashData(sercetkey, apikey, "/api/v3/market/place-ask", "POST", {
    sym: formattedSymbol,
    amt: amount,
    rat: type === "limit" ? rate : 0,
    typ: type,
  });
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-BTK-APIKEY": apikey,
    "X-BTK-TIMESTAMP": ts,
    "X-BTK-SIGN": sig,
  };
  const response = await axios.post(sendUrl, {
    method: "POST",
    url: baseUrl + "/api/v3/market/place-ask",
    headers: headers,
    data: data,
  });
  if (response.data.error === 0) {
    return true;
  } else {
    return false;
  }
};

export const orderList = async (sercetkey, apikey, symbol) => {
  const formattedSymbol = formatSymbol(symbol);
  const { ts, sig } = await hashData(sercetkey, apikey, "/api/v3/market/my-open-orders?sym=" + formattedSymbol, "GET");
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-BTK-APIKEY": apikey,
    "X-BTK-TIMESTAMP": ts,
    "X-BTK-SIGN": sig,
  };
  const response = await axios.post(sendUrl, {
    method: "GET",
    url: baseUrl + "/api/v3/market/my-open-orders?sym=" + formattedSymbol,
    headers: headers,
  });
  return response.data.result;
};

export const deleteOrder = async (sercetkey, apikey, hash) => {
  const { data, ts, sig } = await hashData(sercetkey, apikey, "/api/v3/market/cancel-order", "POST", {
    hash: hash,
  });
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-BTK-APIKEY": apikey,
    "X-BTK-TIMESTAMP": ts,
    "X-BTK-SIGN": sig,
  };
  const response = await axios.post(sendUrl, {
    method: "POST",
    url: baseUrl + "/api/v3/market/cancel-order",
    headers: headers,
    data: data,
  });
  if (response.data.error === 0) {
    return true;
  } else {
    return false;
  }
};

const hashData = async (sercetkey, apikey, path, method, input_data = {}) => {
  const serverTsResponse = await axios.post(sendUrl, {
    method: "GET",
    url: baseUrl + "/api/v3/servertime",
  });
  const timestamp = serverTsResponse.data;

  let query = '';
  let data = input_data;
  if (method === "GET") {
    query = new URLSearchParams(input_data).toString();
    data = {}; // GET requests typically don't have a body
  }

  const payload = `${timestamp}${method}${path}${query}${(method === "POST" ? JSON.stringify(data) : "")}`;
  console.log(payload);
  const hmacDigest = hmacSHA256(payload, sercetkey).toString();

  return {
    data,
    ts: timestamp,
    sig: hmacDigest,
  };
};

const formatSymbol = (symbol) => {
  const [base, quote] = symbol.split("_");
  return `${quote.toLowerCase()}_${base.toLowerCase()}`;
};