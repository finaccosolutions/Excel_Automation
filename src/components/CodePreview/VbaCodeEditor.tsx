import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { Copy, FileDown, Check } from 'lucide-react';

const VbaCodeEditor: React.FC = () => {
  const { currentProject } = useProject();
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    if (currentProject?.vbaCode) {
      navigator.clipboard.writeText(currentProject.vbaCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadAsVba = () => {
    if (currentProject?.vbaCode) {
      const blob = new Blob([currentProject.vbaCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentProject.title.replace(/\s+/g, '_')}_vba_code.bas`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 border-l border-gray-200">
      <div className="bg-gray-800 text-white py-2 px-4 flex justify-between items-center">
        <h3 className="font-medium">VBA Code Preview</h3>
        <div className="flex space-x-2">
          <button
            onClick={copyToClipboard}
            className="p-1 rounded hover:bg-gray-700 text-sm flex items-center transition-colors"
            disabled={!currentProject?.vbaCode}
            title="Copy code"
          >
            {copied ? <Checked /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            onClick={downloadAsVba}
            className="p-1 rounded hover:bg-gray-700 text-sm flex items-center transition-colors"
            disabled={!currentProject?.vbaCode}
            title="Download .bas file"
          >
            <FileDown className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {currentProject?.vbaCode ? (
          <pre className="bg-gray-900 text-gray-100 p-4 m-0 overflow-auto h-full text-sm font-mono">
            <code>{currentProject.vbaCode}</code>
          </pre>
        ) : (
          <div className="flex items-center justify-center h-full p-4 text-gray-500">
            <p className="text-center">
              Send a message to generate VBA code. The code will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const Checked = () => (
  <div className="flex items-center text-green-400">
    <Checked className="h-4 w-4 mr-1" />
    <span>Copied!</span>
  </div>
);

export default VbaCodeEditor;