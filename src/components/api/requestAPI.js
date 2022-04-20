import axios from "axios";
import hmacSHA256 from "crypto-js/hmac-sha256";
const sendUrl =
  "https://asia-southeast2-bitkub-console-f3fde.cloudfunctions.net/sendapi";
const baseUrl = "https://api.bitkub.com";
// const sercetkey = "733a93ec9d12af70183e54ac38c6ed2c";
// const apikey = "5219186fce0d175eacb36f17ca5ad262";

export const getWallet = async (sercetkey, apikey) => {
  const data = await hashData(sercetkey);
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-BTK-APIKEY": apikey,
  };
  const response = await axios.post(sendUrl, {
    method: "POST",
    url: baseUrl + "/api/market/balances",
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
  const res = await axios.post(sendUrl, {
    method: "GET",
    url: baseUrl + "/api/market/symbols",
  });
  return res.data.data.result;
};

export const getPrice = async (symbol) => {
  const res = await axios.post(sendUrl, {
    method: "GET",
    url: baseUrl + "/api/market/ticker?sym=" + symbol,
  });
  //   console.log(res.data);
  return res.data.data[symbol];
};

export const buy = async (
  symbol,
  sercetkey,
  apikey,
  type,
  amount,
  rate = 0
) => {
  const data = await hashData(sercetkey, {
    sym: symbol,
    amt: amount,
    rat: type === "limit" ? rate : 0,
    typ: type,
  });
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-BTK-APIKEY": apikey,
  };
  const response = await axios.post(sendUrl, {
    method: "POST",
    url: baseUrl + "/api/market/place-bid",
    headers: headers,
    data: data,
  });
  //   console.log(response.data);
  if (response.data.error === 0) {
    return true;
  } else {
    return false;
  }
};

export const sell = async (
  symbol,
  sercetkey,
  apikey,
  type,
  amount,
  rate = 0
) => {
  const data = await hashData(sercetkey, {
    sym: symbol,
    amt: amount,
    rat: type === "limit" ? rate : 0,
    typ: type,
  });
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-BTK-APIKEY": apikey,
  };
  const response = await axios.post(sendUrl, {
    method: "POST",
    url: baseUrl + "/api/market/place-ask",
    headers: headers,
    data: data,
  });
  //   console.log(response.data);
  if (response.data.error === 0) {
    return true;
  } else {
    return false;
  }
};

const hashData = async (sercetkey, input_data = {}) => {
  const serverTs = await axios.post(sendUrl, {
    method: "GET",
    url: baseUrl + "/api/servertime",
  });
  let data = {
    ...input_data,
    ts: serverTs.data.data,
  };
  const hmacDigest = hmacSHA256(JSON.stringify(data), sercetkey).toString();
  return {
    ...data,
    sig: hmacDigest,
  };
};
