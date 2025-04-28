import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const generateExcelFile = async (
  operation: 'create_vba' | 'add_formula' | 'add_button',
  content: any
) => {
  try {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration is missing');
    }

    // Validate operation and content
    if (!operation || !content) {
      throw new Error('Operation and content are required');
    }

    // Validate content based on operation type
    if (operation === 'create_vba' && typeof content !== 'string') {
      throw new Error('VBA code must be a string');
    }

    if (operation === 'add_formula' && typeof content !== 'string') {
      throw new Error('Formula must be a string');
    }

    if (operation === 'add_button' && 
        (!content.buttonText || !content.buttonName || !content.macroName)) {
      throw new Error('Invalid button configuration');
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/excel-operations`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          operation, 
          content: typeof content === 'string' ? content.trim() : content 
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate Excel file');
    }

    // Download the generated Excel file
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'excel_template.xlsx';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

  } catch (error) {
    console.error('Error generating Excel file:', error);
    throw error;
  }
};