# NPM E-ARŞİV

Basit ve kullanışlı [E-Arşiv Portal](https://earsivportal.efatura.gov.tr) client kütüphanesi. Sadece E-Arşiv Portal giriş ve fatura bilgilerini kullanarak kolayca E-Arşiv fatura düzenlemek için kullanabilirsiniz. Kendi kişisel bilgisayarınızda veya sunucunuzda çalıştırabileceğiniz gibi tek başına bir bulut fonksiyonu olarak da deploy edip gerekli bilgileri göndererek (mesela bir http endpoint açarak) fatura kesebilirsiniz.

## Kurulum

Paketi `node.js` projenizde kullanmaya başlamak için projenizin ana dizininde aşağıdaki komutu çalıştırın:

```sh
npm i e-arsiv
```

## Kullanım

Ardından modulü aşağıdaki gibi projenizde kullanmaya başlayabilirsiniz:

```js
const earsiv = require("e-arsiv");
token = earsiv.giris(kullaniciKodu, sifre);
await earsiv.taslakFaturaOlustur(token, fatura);
await earsiv.guvenliCikis(token);
```
