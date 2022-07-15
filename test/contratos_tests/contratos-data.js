const cData = {
  contratoGenerico: {
    objeto:
      "Concesion de obra de construccion y explotacion del Centro Deportivo Municipal en Zaragoza",
    presupuesto: 3000000 * 100,
    valorEstimado: 3000600 * 100,
    plazoEjecucion: "5 meses",
    CPV: ["45212200", "92610000"],
    subtipo: "De ventilacion, calefaccion y climatizacion",
    pliegosIPFS: "AjU5bVAaD7YyvqEGzKetWAWmP36DW5uXcmqkzTJiwnbQTb"
  },

  contratoGenericoValorMenor2Millones: {
    objeto:
      "Concesion de obra de construccion y explotacion del Centro Deportivo Municipal en Zaragoza",
    presupuesto: 1500000 * 100,
    valorEstimado: 1500600 * 100,
    plazoEjecucion: "5 meses",
    CPV: ["45212200", "92610000"],
    subtipo: "De ventilacion, calefaccion y climatizacion",
    pliegosIPFS: "GbtuTYXmWPAD5bje5cwQVWm6vzyzAkqEq3WTnAKJ7UiaDb"
  },

  contratoGenericoValorSuperior12Millones: {
    objeto:
      "Concesion de obra de construccion y explotacion del Centro Deportivo Municipal en Zaragoza",
    presupuesto: 13000000 * 100,
    valorEstimado: 13542600 * 100,
    plazoEjecucion: "5 meses",
    CPV: ["45212200", "92610000"],
    subtipo: "De ventilacion, calefaccion y climatizacion",
    pliegosIPFS: "zWEYWbKczk6vAuTTm5mtn3jAGUXe7byViDQDJbaqq5wPAW"
  },

  contratoGenericoValorInferior40K: {
    objeto:
      "Concesion de obra de construccion y explotacion del Centro Deportivo Municipal en Zaragoza",
    presupuesto: 21000 * 100,
    valorEstimado: 21600 * 100,
    plazoEjecucion: "5 meses",
    CPV: ["45212200", "92610000"],
    subtipo: "De ventilacion, calefaccion y climatizacion",
    pliegosIPFS: "YuvTwEUqAz5DejnAbbKWWy53kWim6GqbDPczat7mJTQAVX"
  },

  contratoGenericoArmonizado: {
    objeto:
      "Concesion de obra de construccion y explotacion del Centro Deportivo Municipal en Zaragoza",
    presupuesto: 6000000 * 100,
    valorEstimado: 6000600 * 100, //mayor que 5382000 * 100
    plazoEjecucion: "5 meses",
    CPV: ["45212200", "92610000"],
    subtipo: "De ventilacion, calefaccion y climatizacion",
    pliegosIPFS: "wD6b3ktXTjmKEyTWWAG7YimuWz5P5cAanQADqJVezqbvUb"
  },


  contratoMenor: {
    objeto: "Reparacion de puentes por deterioro tras la Borrasca Filomena",
    presupuesto: 8497.43 * 100,
    valorEstimado: 8497.43 * 100,
    plazoEjecucion: "1 mes",
    CPV: ["45000000", "45110000", "45221200"],
    subtipo: "Obras viales sin cualificacion especifica",
    pliegosIPFS: "TWnKjD7A5mVaWbziUQDcPWbyYGumqetkJEq6AzX3A5Twbv",
    empresa: "0xF1f95D70344E1cef71c6b219545E1841FFffFaBD"
  },

  contratoMenorValorSuperior40K: {
    objeto: "Reparacion de puentes por deterioro tras la Borrasca Filomena",
    presupuesto: 60000 * 100,
    valorEstimado: 60321 * 100,
    plazoEjecucion: "1 mes",
    CPV: ["45000000", "45110000", "45221200"],
    subtipo: "Obras viales sin cualificacion especifica",
    pliegosIPFS: "3JDqtQUGmTjWAzWEVenAqwPWYTvkbzAcKDbam5X756ubyi",
    empresa: "0xF1f95D70344E1cef71c6b219545E1841FFffFaBD"
  }
};

module.exports = cData;
