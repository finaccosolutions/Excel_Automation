import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import Excel from 'npm:exceljs@4.4.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { operation, content } = await req.json();

    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    switch (operation) {
      case 'create_vba':
        // Add VBA module
        worksheet.workbook.addWorksheet('VBAModule');
        worksheet.workbook.views = [{
          x: 0, y: 0, width: 10000, height: 20000,
          firstSheet: 0, activeTab: 1, visibility: 'visible'
        }];
        
        // Add the VBA code
        const vbaModule = workbook.addWorksheet('Module1');
        vbaModule.addRow([content]);
        break;

      case 'add_formula':
        // Add formula to cell
        worksheet.getCell('A1').value = { formula: content };
        break;

      case 'add_button':
        // Add button (form control)
        worksheet.addButton({
          text: content.buttonText,
          name: content.buttonName,
          macro: content.macroName
        });
        break;

      default:
        throw new Error('Unsupported operation');
    }

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=generated.xlsx'
      }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});