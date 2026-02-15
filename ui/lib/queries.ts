export const GUIDED_QUERIES = [
    {
        id: 1,
        title: "Buscar CFDI por UUID",
        description: "Encuentra un comprobante específico usando su UUID único.",
        sql: "SELECT * FROM cfdi_comprobantes WHERE uuid = 'YOUR-UUID-HERE';",
        difficulty: 1,
        tags: ["SELECT", "WHERE"]
    },
    {
        id: 2,
        title: "Buscar por Serie/Folio",
        description: "Búsqueda común operativa por folio interno.",
        sql: "SELECT * FROM cfdi_comprobantes WHERE serie = 'F' AND folio = '1001';",
        difficulty: 1,
        tags: ["SELECT", "WHERE", "AND"]
    },
    {
        id: 3,
        title: "Facturación total por mes",
        description: "Agrupa los totales facturados por mes (YYYY-MM).",
        sql: "SELECT strftime('%Y-%m', fecha_emision) as mes, SUM(total) as total_facturado, COUNT(*) as cantidad FROM cfdi_comprobantes GROUP BY mes ORDER BY mes DESC;",
        difficulty: 2,
        tags: ["GROUP BY", "SUM", "DATE"]
    },
    {
        id: 4,
        title: "Facturación por emisor",
        description: "Total facturado agrupado por RFC de emisor.",
        sql: "SELECT e.rfc, e.nombre, SUM(c.total) as total FROM cfdi_comprobantes c JOIN cfdi_emisores e ON c.emisor_id = e.id GROUP BY e.rfc ORDER BY total DESC LIMIT 10;",
        difficulty: 2,
        tags: ["JOIN", "GROUP BY", "ORDER BY"]
    },
    {
        id: 5,
        title: "Facturación por receptor",
        description: "Quiénes son mis mejores clientes (receptores).",
        sql: "SELECT r.rfc, r.nombre, SUM(c.total) as total FROM cfdi_comprobantes c JOIN cfdi_receptores r ON c.receptor_id = r.id GROUP BY r.rfc ORDER BY total DESC LIMIT 10;",
        difficulty: 2,
        tags: ["JOIN", "GROUP BY"]
    },
    {
        id: 6,
        title: "Top 10 conceptos más comunes",
        description: "Productos o servicios que más se facturan.",
        sql: "SELECT clave_prod_serv, descripcion, COUNT(*) as frecuencia FROM cfdi_conceptos GROUP BY clave_prod_serv ORDER BY frecuencia DESC LIMIT 10;",
        difficulty: 2,
        tags: ["GROUP BY", "COUNT"]
    },
    {
        id: 7,
        title: "CFDI con IVA 16% vs Exento",
        description: "Comparativa de importes por tipo de impuesto.",
        sql: "SELECT tipo_factor, tasa_o_cuota, COUNT(*) as items, SUM(importe) as base_gravable FROM cfdi_conceptos GROUP BY tipo_factor, tasa_o_cuota;",
        difficulty: 2,
        tags: ["GROUP BY", "SUM"]
    },
    {
        id: 8,
        title: "Saldo total por emisor",
        description: "Cuánto se debe todavía a cada proveedor (Emisor).",
        sql: "SELECT e.nombre, SUM(c.saldo) as saldo_pendiente FROM cfdi_comprobantes c JOIN cfdi_emisores e ON c.emisor_id = e.id WHERE c.saldo > 0 GROUP BY e.nombre ORDER BY saldo_pendiente DESC;",
        difficulty: 3,
        tags: ["JOIN", "WHERE", "HAVING"]
    },
    {
        id: 9,
        title: "Facturas pagadas vs no pagadas",
        description: "Status financiero: Pagado vs Pendiente.",
        sql: "SELECT CASE WHEN saldo <= 0.01 THEN 'Pagado' ELSE 'Pendiente' END as estado, COUNT(*) as cantidad, SUM(total) as monto FROM cfdi_comprobantes GROUP BY estado;",
        difficulty: 3,
        tags: ["CASE", "GROUP BY"]
    },
    {
        id: 10,
        title: "Pagos parciales",
        description: "Facturas que tienen abonos pero siguen con saldo.",
        sql: "SELECT uuid, total, monto_pagado, saldo FROM cfdi_comprobantes WHERE monto_pagado > 0 AND saldo > 0.01;",
        difficulty: 2,
        tags: ["WHERE", "AND"]
    },
    {
        id: 11,
        title: "Canceladas últimos 30 días",
        description: "Auditoría de cancelaciones recientes.",
        sql: "SELECT * FROM cfdi_comprobantes WHERE estatus_sat = 'Cancelado' AND fecha_cancelacion >= date('now', '-30 days');",
        difficulty: 2,
        tags: ["DATE", "WHERE"]
    },
    {
        id: 12,
        title: "PUE vs PPD por mes",
        description: "Análisis de flujo de efectivo esperado vs inmediato.",
        sql: "SELECT strftime('%Y-%m', fecha_emision) as mes, metodo_pago, COUNT(*) as cantidad, SUM(total) as total FROM cfdi_comprobantes GROUP BY mes, metodo_pago ORDER BY mes DESC;",
        difficulty: 2,
        tags: ["GROUP BY", "MULTIPLE COLUMNS"]
    },
    {
        id: 13,
        title: "Formas de pago más usadas",
        description: "Cómo nos pagan (03 Transferencia, 01 Efectivo, etc).",
        sql: "SELECT forma_pago, COUNT(*) as txs, SUM(total) as volumen FROM cfdi_comprobantes GROUP BY forma_pago ORDER BY volumen DESC;",
        difficulty: 1,
        tags: ["GROUP BY"]
    },
    {
        id: 14,
        title: "Moneda MXN vs USD",
        description: "Exposición a moneda extranjera.",
        sql: "SELECT moneda, COUNT(*) as docs, SUM(total) as total_nominal FROM cfdi_comprobantes GROUP BY moneda;",
        difficulty: 1,
        tags: ["GROUP BY"]
    },
    {
        id: 15,
        title: "Buscar por rango de fechas",
        description: "Consulta básica de reportes mensuales.",
        sql: "SELECT * FROM cfdi_comprobantes WHERE fecha_emision BETWEEN '2023-01-01' AND '2023-12-31' ORDER BY fecha_emision;",
        difficulty: 1,
        tags: ["BETWEEN", "ORDER BY"]
    },
    {
        id: 16,
        title: "JOIN Comprobantes + Conceptos",
        description: "Ver el detalle de líneas de cada factura.",
        sql: "SELECT c.uuid, con.descripcion, con.cantidad, con.importe FROM cfdi_comprobantes c JOIN cfdi_conceptos con ON c.id = con.comprobante_id LIMIT 20;",
        difficulty: 2,
        tags: ["JOIN"]
    },
    {
        id: 17,
        title: "Promedio de ticket por receptor",
        description: "Cuál es el valor promedio de venta a cada cliente.",
        sql: "SELECT r.nombre, AVG(c.total) as ticket_promedio FROM cfdi_comprobantes c JOIN cfdi_receptores r ON c.receptor_id = r.id GROUP BY r.nombre HAVING COUNT(*) > 5 ORDER BY ticket_promedio DESC;",
        difficulty: 3,
        tags: ["AVG", "HAVING"]
    },
    {
        id: 18,
        title: "Auditoría de Inconsistencias",
        description: "Facturas donde el total no coincide con subtotal + impuestos (simulado).",
        sql: "SELECT uuid, total, subtotal, (subtotal * 1.16) as calculado_aprox FROM cfdi_comprobantes WHERE ABS(total - (subtotal * 1.16)) > 1.0 AND moneda = 'MXN' LIMIT 10;",
        difficulty: 3,
        tags: ["MATH", "WHERE"]
    }
];
