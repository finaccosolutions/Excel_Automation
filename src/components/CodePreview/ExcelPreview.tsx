import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

const ExcelPreview: React.FC = () => {
  const { currentProject } = useProject();
  
  // This is a simplified preview. In a real application, you'd integrate
  // with a library that can render Excel-like spreadsheets
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-green-700 text-white p-2 flex items-center">
        <FileSpreadsheet className="h-5 w-5 mr-2" />
        <span className="font-medium">Excel Preview</span>
      </div>
      <div className="p-4">
        {currentProject?.vbaCode ? (
          <div className="border border-gray-300">
            <div className="grid grid-cols-5 border-b border-gray-300">
              <div className="border-r border-gray-300 p-2 font-bold bg-gray-100"></div>
              {['A', 'B', 'C', 'D'].map((col) => (
                <div key={col} className="border-r border-gray-300 p-2 font-bold text-center bg-gray-100">
                  {col}
                </div>
              ))}
            </div>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
              <div key={row} className="grid grid-cols-5 border-b border-gray-300">
                <div className="border-r border-gray-300 p-2 font-bold bg-gray-100 text-center">
                  {row}
                </div>
                {['A', 'B', 'C', 'D'].map((col) => (
                  <div key={`${row}${col}`} className="border-r border-gray-300 p-2 text-sm text-center hover:bg-blue-50">
                    {row === 1 && col === 'A' ? 'Sample Data' : ''}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-gray-500">
            <FileSpreadsheet className="h-16 w-16 mb-4 text-gray-300" />
            <p className="text-center">
              VBA code preview will appear here when generated.
            </p>
          </div>
        )}
      </div>
      <div className="bg-gray-100 p-2 text-xs text-gray-500 text-center border-t border-gray-200">
        Note: This is a simplified preview. Download the code to use in Excel.
      </div>
    </div>
  );
};

export default ExcelPreview;