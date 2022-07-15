const lData = {
  /**
   * ABIERTO
   */
  abierto_fechas_correctas: {
    fApertura: "01/21/2023", // mes/dia/año
    fCierreOfertas: "02/21/2023",
    fCierreEvaluacion: "03/21/2023"
  },
  abierto_fCEval_menor_que_fCOfertas: {
    fApertura: "01/21/2023",
    fCierreOfertas: "02/21/2023",
    fCierreEvaluacion: "02/20/2023"
  },
  abierto_fCOfertas_menor_que_fApertura: {
    fApertura: "01/21/2023",
    fCierreOfertas: "01/20/2023",
    fCierreEvaluacion: "03/21/2023"
  },
  abierto_fApertura_menor_que_fActual: {
    fApertura: "01/21/2020",
    fCierreOfertas: "02/20/2023",
    fCierreEvaluacion: "03/21/2023"
  },

  /**
   * SIMPLIFICADO
   */

  simplificado_fechas_correctas: {
    fApertura: "01/21/2023",
    fCierreOfertas: "02/09/2023"
  },
  simplificado_fCOfertas_menor_que_fApertura: {
    fApertura: "01/21/2023",
    fCierreOfertas: "02/09/2022"
  },
  simplificado_fApertura_menor_que_fActual: {
    fApertura: "01/21/2021",
    fCierreOfertas: "02/09/2023"
  },
  simplificado_plazoOfertas_mayor_20dias: {
    fApertura: "01/21/2023",
    fCierreOfertas: "02/11/2023"
  }
};

module.exports = lData;