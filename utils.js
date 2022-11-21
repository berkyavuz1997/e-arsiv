const https = require("https");
const tcmb = require("node-tcmb");
const moment = require("moment");

function uid(len = 10) {
  var random = "";
  while (random.length < len) {
    random += Math.random().toString(26).slice(2);
  }

  return random.substring(0, len);
}

function previousDay(date) {
  let momentDate = moment(date, "DD/MM/YYYY");
  return momentDate.subtract(1, "d").format("DD/MM/YYYY").toString();
}

function getCurrentTurkeyTime() {
  return new Date().toLocaleTimeString("tr-TR", {
    timeZone: "Europe/Istanbul",
  });
}

function getCurrentTurkeyDate() {
  return new Date()
    .toLocaleDateString("tr-TR", {
      timeZone: "Europe/Istanbul",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\./g, "/");
}

async function getCurrencyRate(currencyCode, date) {
  if (currencyCode === "TRY") return 0;

  date = date || getCurrentTurkeyDate();
  const prevDate = previousDay(date);

  return (await tcmb.rates.date(prevDate, currencyCode)).currency.forexBuying;
}

function calculateTaxFreeAmount(taxIncludedAmount, taxRate) {
  return (taxIncludedAmount / (1 + taxRate / 100)).toFixed(2);
}
function calculateTaxIncludedAmount(taxFreeAmount, taxRate) {
  return (taxFreeAmount * (1 + taxRate / 100)).toFixed(2);
}

function calculateTaxFromTaxFreeAmount(taxFreeAmount, taxRate) {
  return (taxFreeAmount * (taxRate / 100)).toFixed(2);
}

function calculateTaxFromTaxIncludedAmount(taxIncludedAmount, taxRate) {
  return (taxIncludedAmount - taxIncludedAmount / (1 + taxRate / 100)).toFixed(
    2
  );
}

function post(url, data, headers) {
  const options = {
    method: "POST",
    headers: {
      "Content-Length": data.length,
      ...headers,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      if (res.statusCode < 200 || res.statusCode > 299) {
        return reject(new Error(`HTTP status code ${res.statusCode}`));
      }

      const body = [];
      res.on("data", (chunk) => body.push(chunk));
      res.on("end", () => {
        const resString = Buffer.concat(body).toString();
        resolve(resString);
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request time out"));
    });

    req.write(data);

    req.end();
  });
}

module.exports = {
  uid,
  previousDay,
  getCurrentTurkeyTime,
  getCurrentTurkeyDate,
  getCurrencyRate,
  calculateTaxFreeAmount,
  calculateTaxIncludedAmount,
  calculateTaxFromTaxFreeAmount,
  calculateTaxFromTaxIncludedAmount,
  post,
};
