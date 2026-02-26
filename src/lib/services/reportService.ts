import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { OrderWithItems } from "./orderService";

export const reportService = {
    generateDailySalesReport(foodTruckName: string, orders: OrderWithItems[], date: Date) {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(255, 107, 43); // Primary color
        doc.text(foodTruckName, 14, 22);

        doc.setFontSize(16);
        doc.setTextColor(30, 41, 59); // Slate-800
        doc.text("Reporte Diario de Ventas", 14, 32);

        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // Slate-400
        doc.text(`Fecha: ${date.toLocaleDateString()}`, 14, 40);
        doc.text(`Total de pedidos: ${orders.length}`, 14, 46);

        // Calculations
        const totalSales = orders.reduce((sum, o) => sum + Number(o.total), 0);
        const deliveredOrders = orders.filter(o => o.status === 'delivered');
        const cancelledOrders = orders.filter(o => o.status === 'cancelled');

        // Summary Table
        autoTable(doc, {
            startY: 55,
            head: [['Resumen', 'Valor']],
            body: [
                ['Ventas Totales', `$ ${totalSales.toFixed(2)}`],
                ['Pedidos Entregados', deliveredOrders.length.toString()],
                ['Pedidos Cancelados', cancelledOrders.length.toString()],
                ['Ticket Promedio', `$ ${(totalSales / (orders.length || 1)).toFixed(2)}`]
            ],
            theme: 'grid',
            headStyles: { fillColor: [30, 41, 59] }
        });

        // Orders Table
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.text("Detalle de Pedidos", 14, (doc as any).lastAutoTable.finalY + 15);

        const tableData = orders.map(o => [
            o.id?.slice(-6).toUpperCase() || 'N/A',
            o.customerName || 'Cliente',
            o.items.length.toString(),
            o.status.toUpperCase(),
            `$ ${Number(o.total).toFixed(2)}`
        ]);

        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 20,
            head: [['ID', 'Cliente', 'Items', 'Estado', 'Total']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [255, 107, 43] }
        });

        // Save
        const fileName = `Reporte_${foodTruckName.replace(/\s+/g, '_')}_${date.toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
    }
};
