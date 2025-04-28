import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import Excel from 'npm:exceljs@4.4.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { operation, content } = await req.json();

    if (!operation || !content) {
      throw new Error('Operation and content are required');
    }

    const workbook = new Excel.Workbook();
    workbook.creator = 'Excel VBA Generator';
    workbook.lastModifiedBy = 'Excel VBA Generator';
    workbook.created = new Date();
    workbook.modified = new Date();

    const worksheet = workbook.addWorksheet('Sheet1', {
      properties: { tabColor: { argb: '4167B8' } }
    });

    // Add a header with instructions
    worksheet.getCell('A1').value = 'Excel VBA Generator';
    worksheet.getCell('A1').font = {
      bold: true,
      size: 14,
      color: { argb: '000000' }
    };

    switch (operation) {
      case 'create_vba': {
        // Extract macro name from VBA code
        const macroName = content.match(/Sub\s+(\w+)/)?.[1] || 'Macro1';
        
        // Add instructions
        worksheet.getCell('A3').value = 'Instructions for implementing VBA code:';
        worksheet.getCell('A4').value = '1. Open Visual Basic Editor (Alt + F11)';
        worksheet.getCell('A5').value = '2. Insert > Module';
        worksheet.getCell('A6').value = '3. Copy and paste the following code:';
        worksheet.getCell('A7').value = content;
        
        // Format cells
        for (let i = 3; i <= 6; i++) {
          worksheet.getCell(`A${i}`).font = {
            size: 11,
            color: { argb: '000000' }
          };
        }
        worksheet.getCell('A3').font.bold = true;
        
        // Add note about saving as .xlsm
        worksheet.getCell('A9').value = 'Important: Save this workbook as a macro-enabled file (.xlsm)';
        worksheet.getCell('A9').font = {
          bold: true,
          color: { argb: 'FF0000' }
        };
        
        // Adjust column widths
        worksheet.getColumn('A').width = 100;
        break;
      }

      case 'add_formula': {
        worksheet.getCell('A3').value = 'Formula:';
        worksheet.getCell('A3').font = { bold: true };
        
        try {
          worksheet.getCell('B3').value = { formula: content };
        } catch (error) {
          throw new Error(`Invalid formula: ${error.message}`);
        }
        
        // Add the formula text for reference
        worksheet.getCell('A4').value = 'Formula text:';
        worksheet.getCell('A4').font = { bold: true };
        worksheet.getCell('B4').value = content;
        
        // Auto-fit columns
        worksheet.columns.forEach(column => {
          column.width = 30;
        });
        break;
      }

      case 'add_button': {
        if (!content.buttonText || !content.buttonName || !content.macroName) {
          throw new Error('Button configuration is incomplete');
        }

        worksheet.getCell('A3').value = 'Button Configuration:';
        worksheet.getCell('A4').value = '1. Enable Developer tab in Excel:';
        worksheet.getCell('A5').value = '   - File > Options > Customize Ribbon > Check "Developer"';
        worksheet.getCell('A6').value = '2. On Developer tab, click "Insert" and choose "Button (Form Control)"';
        worksheet.getCell('A7').value = '3. Draw button on worksheet';
        worksheet.getCell('A8').value = '4. Configure button with these settings:';
        worksheet.getCell('A9').value = `   • Button Text: ${content.buttonText}`;
        worksheet.getCell('A10').value = `   • Macro Name: ${content.macroName}`;
        
        // Format cells
        for (let i = 3; i <= 10; i++) {
          worksheet.getCell(`A${i}`).font = {
            size: 11,
            color: { argb: '000000' }
          };
        }
        worksheet.getCell('A3').font.bold = true;
        
        // Adjust column width
        worksheet.getColumn('A').width = 80;
        break;
      }

      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=excel_template.xlsx'
      }
    });
  } catch (error) {
    console.error('Excel operation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});