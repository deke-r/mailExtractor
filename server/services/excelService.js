const ExcelJS = require('exceljs');

const generateExcel = async (data) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Extracted Emails');

    worksheet.columns = [
        { header: 'Keyword', key: 'keyword', width: 20 },
        { header: 'Website', key: 'website', width: 30 },
        { header: 'Page URL', key: 'url', width: 40 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Extracted At', key: 'extractedAt', width: 20 }
    ];

    data.forEach(item => {
        worksheet.addRow({
            keyword: item.keyword || 'N/A',
            website: item.website,
            url: item.url,
            email: item.email,
            extractedAt: new Date().toISOString()
        });
    });

    // Style the header
    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
};

module.exports = { generateExcel };
