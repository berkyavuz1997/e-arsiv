npm i e-arsiv

Basit ve kullanışlı E-Arşiv Portal (https://earsivportal.efatura.gov.tr) client kütüphanesi. Sadece E-Arşiv Portal giriş ve fatura bilgilerini kullanarak kolayca E-Arşiv fatura düzenlemek için kullanabilirsiniz. Kendi kişisel bilgisayarınızda veya sunucunuzda çalıştırabileceğiniz gibi tek başına bir bulut fonksiyonu olarak da deploy edip gerekli bilgileri göndererek (mesela bir http endpoint açarak) fatura kesebilirsiniz.


Paketi node.js projenizde kullanmaya başlamak için:

Projenizin ana dizininde aşağıdaki komutu çalıştırın:

npm i e-arsiv


Ardından modulü aşağıdaki gibi projenizde kullanmaya başlayabilirsiniz:

const earsiv = require("e-arsiv");

token = earsiv.giris(kullaniciKodu, sifre);

await earsiv.taslakFaturaOlustur(token, fatura);

await earsiv.guvenliCikis(token);