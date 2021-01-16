
##Akses python ke I2C device menggunakan USB HID I2C, MCP2221A
##dengan Kirim-Terima lebih dari 64 byte.

<p align="center">
  <img src="img/prototype.png">
</p>

modul yang saya gunakan : Adafruit MCP2221A Breakout - General Purpose USB to GPIO ADC I2C - Stemma QT / Qwiic
[Adafruit MCP2221A Breakout link] (https://www.adafruit.com/product/4471)

##Latar belakang:
pengalaman mengakses I2C device menggunakan interface USB. Karena dengan menggunakan USB, 
implementasi I2C device tidak perlu "membongkar" perangkat Host (antara lain solder langsung ke mother board), 
serta saat ini konektivitas USB banyak diterapkan pada perangkat PC/SBC/USB-OTG-smartphone

##tantangan:
dalam standard USB-HID, maksimum kirim-terima data adalah 64 byte. Padahal terkadang kita memerlukan kirim terima data lebih dari 64 byte.
Saya mencari di banyak forum dan github, untuk kirim terima data lebih dari 64 byte pada HID, selalu tidak ada contoh yang berhasil.

##Titik terang ... 
Dalam datasheet MCP2221A dituliskan bahwa datalength maksimum adalah 0xFF. 
setelah kirim data, bila mana datalength lebih dari 60byte, maka "SubSequent I2C Write Data Commands will transport the reminder of the user data- till requested length ".

Serta saya telah berhasil dalam mengirimkan data lebih dari 60byte, dengan menggunakan utility tool, MCP2221 I2C SMBUS terminal.
file perintah MCP2221 I2C SMBUS terminal dapat diimport pada file Terminal_multiwrite.csv.
hasil capture logic analyzer pada file Terminal_Multiwrite.sr .

hasil capture logic analyzer dapat dibuka menggunakan aplikasi PulseView.

Lalu bagaimana kalau interfacing MCP2221 menggunakan python?

Berikut ini adalah pengalaman saya, berhasil transfer kirim-terima data lebih dari 64 byte, adalah dengan menjalankan :

```
python3 test10.py
```

<p align="center">
  <img src="img/read_signal.PNG">
</p>


<p align="center">
  <img src="img/Write_signal.PNG">
</p>


Saya juga merekam digital signal saat mengeksekusi perintah tersebut menggunakan logic Analyzer (Test10_multiwrite.sr).

##I2C Signal saat read multiple times

<p align="center">
  <img src="img/chunked_read.PNG">
</p>
 
##I2C Signal saat write multiple times

<p align="center">
  <img src="img/preparing_write_data.PNG">
</p>
 

untuk terima data lebih dari 60 byte,
ternyata sangat mudah,
setelah perintah proses ke I2C device telah sukses dikirim, 
anda hanya perlu perintah membaca berulang2 dan tiap-tiap pembacaan maksimum 60 byte.

untuk pengiriman data lebih dari 60 byte 
anda hanya perlu perintah Write berulang2.
Perintah pertama (first chunk) adalah dikirim sebanyak 60 byte dari total perintah, namun data length adalah total keseluruhan data yang akan dikirim (misalnya 72 byte/0x48 ). 
Segera (perlu time.sleep) setelah pengiriman pertama, dilanjutkan dengan pengiriman byte sisa nya,

Hal penting yang bisa menjadi kunci sukses adalah ukuran dari time.sleep.

pada Python Code yang saya buat, saya mengambil beberapa code pada  
https://github.com/nonNoise/PyMCP2221A/blob/master/PyMCP2221A/PyMCP2221A.py
(The MIT License (MIT) Copyright (c) 2017 Yuta Kitagami (kitagami@artifactnoise.com,@nonnoise)

Lisensi:
saya belum belajar dan belum terlalu mengerti  tentang lisensi.
Saya memilih MIT License.

License
The MIT License (MIT) Copyright (c) 2021 Irvan Kristianto (irvan.kristianto@gmail.com)

