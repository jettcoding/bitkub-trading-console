import axios from "axios";
import hmacSHA256 from "crypto-js/hmac-sha256";
const sendUrl =
  "https://asia-southeast2-bitkub-console-f3fde.cloudfunctions.net/sendapi";
const baseUrl = "https://api.bitkub.com";
const sercetkey = "733a93ec9d12af70183e54ac38c6ed2c";
const apikey = "5219186fce0d175eacb36f17ca5ad262";

export const test = async () => {
  const serverTs = await axios.post(sendUrl, {
    method: "GET",
    url: baseUrl + "/api/servertime",
  });
  let data = {
    ts: serverTs.data.data,
  };
  const hmacDigest = hmacSHA256(JSON.stringify(data), sercetkey).toString();
  data["sig"] = hmacDigest;
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-BTK-APIKEY": apikey,
  };
  const response = await axios.post(sendUrl, {
    method: "POST",
    url: baseUrl + "/api/market/wallet",
    headers: headers,
    data: data,
  });
  let filldata = [];
  for (const property in response.data.result) {
    if (response.data.result[property] > 0) {
      filldata.push([property, response.data.result[property]]);
    }
  }
  console.log(filldata);
};

