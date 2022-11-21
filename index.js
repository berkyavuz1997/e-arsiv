// **************************
// ****** Kütüphaneler ******
// **************************
const utils = require("./utils");

// **************************
// ****** Tanımlamalar ******
// **************************
const portalUrl = "https://earsivportal.efatura.gov.tr";

const KOMUTLAR = {
  createDraftInvoice: ["EARSIV_PORTAL_FATURA_OLUSTUR", "RG_BASITFATURA"],
  getAllInvoicesByDateRange: [
    "EARSIV_PORTAL_TASLAKLARI_GETIR",
    "RG_BASITTASLAKLAR",
  ],
  getAllInvoicesIssuedToMeByDateRange: [
    "EARSIV_PORTAL_ADIMA_KESILEN_BELGELERI_GETIR",
    "RG_BASITTASLAKLAR",
  ],
  signDraftInvoice: [
    "EARSIV_PORTAL_FATURA_HSM_CIHAZI_ILE_IMZALA",
    "RG_BASITTASLAKLAR",
  ],
  getInvoiceHTML: ["EARSIV_PORTAL_FATURA_GOSTER", "RG_BASITTASLAKLAR"],
  cancelDraftInvoice: ["EARSIV_PORTAL_FATURA_SIL", "RG_BASITTASLAKLAR"],
  getRecipientDataByTaxIDOrTRID: [
    "SICIL_VEYA_MERNISTEN_BILGILERI_GETIR",
    "RG_BASITFATURA",
  ],
  sendSignSMSCode: ["EARSIV_PORTAL_SMSSIFRE_GONDER", "RG_SMSONAY"],
  verifySMSCode: ["EARSIV_PORTAL_SMSSIFRE_DOGRULA", "RG_SMSONAY"],
  getUserData: ["EARSIV_PORTAL_KULLANICI_BILGILERI_GETIR", "RG_KULLANICI"],
  updateUserData: ["EARSIV_PORTAL_KULLANICI_BILGILERI_KAYDET", "RG_KULLANICI"],

  // TODO:
  // createProducerReceipt: ['EARSIV_PORTAL_MUSTAHSIL_OLUSTUR', 'RG_MUSTAHSIL'],
  // createSelfEmployedInvoice: ['EARSIV_PORTAL_SERBEST_MESLEK_MAKBUZU_OLUSTUR', 'RG_SERBEST'],
};

// **************************
// ****** Fonksiyonlar ******
// **************************

/*
  Giriş
*/
async function giris(kullaniciKodu, sifre) {
  // Giriş için istek atılacak url
  const url = portalUrl + "/earsiv-services/assos-login";

  // Gönderilecek istek verisi
  const postData =
    "assoscmd=anologin&rtype=json&userid=" +
    kullaniciKodu +
    "&sifre=" +
    sifre +
    "&sifre2=" +
    sifre +
    "&parola=1";

  // İstek başlıkları
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
  };

  // İsteği gönder
  const resp = await utils.post(url, postData, headers);

  //JSON formatına çevir
  const obj = JSON.parse(resp);

  // İçerisinden token döndür
  return obj.token;
}

/*
  Güvenli Çıkış
*/
async function guvenliCikis(token) {
  if (token === null || token === undefined || token === "") return false;

  // Çıkış için istek atılacak url
  const url = portalUrl + "/earsiv-services/assos-login";

  // Gönderilecek istek verisi
  const postData = "assoscmd=logout&rtype=json&token=" + token;

  // İstek başlıkları
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
  };

  // İsteği gönder
  const resp = await utils.post(url, postData, headers);

  //JSON formatına çevir
  const obj = JSON.parse(resp);

  // Cevabı döndür
  return obj.data.redirectUrl == "login.html";
}

/*
  Taslak Fatura Oluştur
*/
async function taslakFaturaOlustur(token, fatura) {
  fullFatura = await varsayilanFaturaDetaylariylaTamamla(fatura);

  const resp = await komutCalistir(
    token,
    ...KOMUTLAR.createDraftInvoice,
    fullFatura
  );

  return {
    alinanFatura: fatura,
    gönderilenFatura: fullFatura,
    portalCevap: resp,
  };
}

/*
  Faturaları Getir
*/
async function faturalariGetir(token, baslangicTarihi, bitisTarihi) {
  const faturalar = await komutCalistir(
    token,
    ...KOMUTLAR.getAllInvoicesByDateRange,
    {
      baslangic: baslangicTarihi,
      bitis: bitisTarihi,
      hangiTip: "5000/30000",
    }
  );
  return faturalar;
}

/*
  Fatura Bul
*/
async function faturaBul(token, ettn, tarih) {
  const faturalar = await faturalariGetir(token, tarih, tarih);
  return faturalar.data.find((fatura) => fatura.ettn === ettn);
}

// ***********************************
// ****** Yardımcı Fonksiyonlar ******
// ***********************************

/*
  Komut Çalıştır
*/
async function komutCalistir(token, komut, sayfaAdi, data) {
  // Komut çalıştırmak için istek atılacak url
  const url = portalUrl + "/earsiv-services/dispatch";

  // Gönderilecek istek verisi
  const postData = `cmd=${komut}&callid=${utils.uid(
    15
  )}&pageName=${sayfaAdi}&token=${token}&jp=${encodeURIComponent(
    JSON.stringify(data || {})
  )}`;

  // İstek başlıkları
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
  };

  // İsteği gönder
  const resp = await utils.post(url, postData, headers);

  //JSON formatına çevir
  const obj = JSON.parse(resp);

  // Cevabı döndür
  return obj;
}

// Varsayılan fatura detayları
async function varsayilanFaturaDetaylariylaTamamla(faturaDetaylari) {
  faturaDetaylari.malHizmetTable.forEach((malHizmetSatir, index) => {
    faturaDetaylari.malHizmetTable[index] = {
      malHizmet: "Ürün",
      miktar: 1,
      birim: "C62",
      birimFiyat: (
        malHizmetSatir.malHizmetTutari / (malHizmetSatir.miktar || 1)
      )
        .toFixed(2)
        .toString(),
      fiyat: malHizmetSatir.malHizmetTutari,
      iskontoOrani: 0,
      iskontoTutari: "0",
      iskontoNedeni: "",
      malHizmetTutari: "0", // must parameter
      kdvOrani: "0",
      vergiOrani: 0,
      kdvTutari: utils
        .calculateTaxFromTaxFreeAmount(
          Number(malHizmetSatir.malHizmetTutari),
          Number(malHizmetSatir.kdvOrani || 0)
        )
        .toString(),
      vergininKdvTutari: "0",
      ozelMatrahTutari: "0",
      hesaplananotvtevkifatakatkisi: "0",

      ...malHizmetSatir,
    };

    if (
      faturaDetaylari.faturaTipi !== null &&
      faturaDetaylari.faturaTipi !== undefined &&
      faturaDetaylari.faturaTipi === "ISTISNA" &&
      !faturaDetaylari.malHizmetTable[index].hasOwnProperty("gtip")
    )
      faturaDetaylari.malHizmetTable[index].gtip = "";
  });

  faturaDetaylari = await {
    faturaUuid: utils.uid(36),
    belgeNumarasi: "",
    faturaTarihi: utils.getCurrentTurkeyDate(),
    saat: utils.getCurrentTurkeyTime(),
    paraBirimi: "TRY",
    dovzTLkur: (
      await utils.getCurrencyRate(
        faturaDetaylari.paraBirimi,
        faturaDetaylari.faturaTarihi
      )
    ).toString(),
    faturaTipi: "SATIS",
    hangiTip: "5000/30000",
    vknTckn: "11111111111",
    aliciUnvan: "",
    aliciAdi: "",
    aliciSoyadi: "",
    binaAdi: "",
    binaNo: "",
    kapiNo: "",
    kasabaKoy: "",
    vergiDairesi: "",
    ulke: "Türkiye",
    bulvarcaddesokak: "",
    irsaliyeNumarasi: "",
    irsaliyeTarihi: "",
    mahalleSemtIlce: "",
    sehir: " ",
    postaKodu: "",
    tel: "",
    fax: "",
    eposta: "",
    websitesi: "",
    iadeTable: [],
    vergiCesidi: " ",
    malHizmetTable: [],
    tip: "İskonto",
    matrah: faturaDetaylari.malHizmetTable
      .reduce((accumulator, malHizmetSatir) => {
        return accumulator + Number(malHizmetSatir.malHizmetTutari);
      }, 0)
      .toFixed(2)
      .toString(),
    malhizmetToplamTutari: faturaDetaylari.malHizmetTable
      .reduce((accumulator, malHizmetSatir) => {
        return accumulator + Number(malHizmetSatir.malHizmetTutari);
      }, 0)
      .toFixed(2)
      .toString(),
    toplamIskonto: "0",
    hesaplanankdv: faturaDetaylari.malHizmetTable
      .reduce((accumulator, malHizmetSatir) => {
        return accumulator + Number(malHizmetSatir.kdvTutari);
      }, 0)
      .toFixed(2)
      .toString(),
    vergilerToplami: faturaDetaylari.malHizmetTable
      .reduce((accumulator, malHizmetSatir) => {
        return accumulator + Number(malHizmetSatir.kdvTutari);
      }, 0)
      .toFixed(2)
      .toString(),
    vergilerDahilToplamTutar: faturaDetaylari.malHizmetTable
      .reduce((accumulator, malHizmetSatir) => {
        return (
          accumulator +
          Number(malHizmetSatir.malHizmetTutari) +
          Number(malHizmetSatir.kdvTutari)
        );
      }, 0)
      .toFixed(2)
      .toString(),
    odenecekTutar: faturaDetaylari.malHizmetTable
      .reduce((accumulator, malHizmetSatir) => {
        return (
          accumulator +
          Number(malHizmetSatir.malHizmetTutari) +
          Number(malHizmetSatir.kdvTutari)
        );
      }, 0)
      .toFixed(2)
      .toString(),
    not: "E-Arşiv fatura kapsamında düzenlenmiştir.",
    siparisNumarasi: "",
    siparisTarihi: "",
    fisNo: "",
    fisTarihi: "",
    fisSaati: " ",
    fisTipi: " ",
    zRaporNo: "",
    okcSeriNo: "",

    ...faturaDetaylari,
  };

  return faturaDetaylari;
}

// *********************
// ****** Exports ******
// *********************
module.exports = {
  giris,
  guvenliCikis,
  taslakFaturaOlustur,
  faturalariGetir,
  faturaBul,
  varsayilanFaturaDetaylariylaTamamla,
};
