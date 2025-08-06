import React, { useState, useEffect } from 'react';
import { Github, FileText, Zap, GitPullRequest, CheckCircle, Loader2, Play } from 'lucide-react';

const TestCaseGenerator = () => {
  const [githubToken, setGithubToken] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [testSummaries, setTestSummaries] = useState([]);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Mock data for demo purposes
  const mockFiles = [
    { path: 'src/components/Button.jsx', type: 'file', language: 'javascript' },
    { path: 'src/utils/validation.js', type: 'file', language: 'javascript' },
    { path: 'src/services/api.js', type: 'file', language: 'javascript' },
    { path: 'src/hooks/useAuth.js', type: 'file', language: 'javascript' },
    { path: 'backend/models/User.py', type: 'file', language: 'python' },
    { path: 'backend/controllers/auth.py', type: 'file', language: 'python' }
  ];

  const mockTestSummaries = [
    {
      id: 1,
      title: 'Button Component Tests',
      description: 'Unit tests for React Button component including props validation, click handlers, and accessibility',
      framework: 'Jest + React Testing Library',
      coverage: ['Props testing', 'Event handling', 'Accessibility checks']
    },
    {
      id: 2,
      title: 'API Service Tests',
      description: 'Integration tests for API service methods including error handling and response validation',
      framework: 'Jest + MSW',
      coverage: ['HTTP methods', 'Error scenarios', 'Response parsing']
    },
    {
      id: 3,
      title: 'Authentication Hook Tests',
      description: 'Custom hook tests for authentication logic and state management',
      framework: 'Jest + React Hooks Testing Library',
      coverage: ['Login flow', 'Token management', 'State updates']
    }
  ];

  const connectToGithub = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setFiles(mockFiles);
      setStep(2);
      setLoading(false);
    }, 1500);
  };

  const generateTestSummaries = () => {
    setLoading(true);
    // Simulate AI processing
    setTimeout(() => {
      setTestSummaries(mockTestSummaries);
      setStep(3);
      setLoading(false);
    }, 2000);
  };

  const generateTestCode = (summary) => {
    setSelectedSummary(summary);
    setLoading(true);

    // Mock generated test code
    const mockCode = `import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from '../components/Button';

describe('Button Component', () => {
  test('renders button with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('applies custom className', () => {
    render(<Button className="custom-btn">Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-btn');
  });

  test('is accessible', () => {
    render(<Button aria-label="Submit form">Submit</Button>);
    expect(screen.getByLabelText('Submit form')).toBeInTheDocument();
  });
});`;

    setTimeout(() => {
      setGeneratedCode(mockCode);
      setStep(4);
      setLoading(false);
    }, 1500);
  };

  const createPullRequest = () => {
    setLoading(true);
    setTimeout(() => {
      alert('Pull Request created successfully! 🎉\nPR #42: Add automated test cases for Button component');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            <Zap className="inline-block mr-2 text-yellow-400" />
            AI Test Case Generator
          </h1>
          <p className="text-slate-300">Generate intelligent test cases for your GitHub repositories</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= num ? 'bg-purple-500 text-white' : 'bg-slate-600 text-slate-300'
                  }`}>
                  {step > num ? <CheckCircle className="w-4 h-4" /> : num}
                </div>
                {num < 4 && <div className={`w-16 h-0.5 ${step > num ? 'bg-purple-500' : 'bg-slate-600'}`} />}
              </div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="max-w-md mx-auto bg-slate-800 rounded-xl p-6 shadow-xl">
            <div className="text-center mb-6">
              <Github className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white">Connect to GitHub</h2>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="GitHub Personal Access Token"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Repository URL (e.g., owner/repo)"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none"
              />
              <button
                onClick={connectToGithub}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : <Github className="mr-2" />}
                Connect Repository
              </button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="max-w-4xl mx-auto bg-slate-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <FileText className="mr-2 text-purple-400" />
              Select Files for Test Generation
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {files.map((file, index) => (
                <div key={index} className="flex items-center p-3 bg-slate-700 rounded-lg">
                  <input
                    type="checkbox"
                    id={`file-${index}`}
                    checked={selectedFiles.includes(file.path)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFiles([...selectedFiles, file.path]);
                      } else {
                        setSelectedFiles(selectedFiles.filter(f => f !== file.path));
                      }
                    }}
                    className="mr-3 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor={`file-${index}`} className="text-white cursor-pointer flex-1">
                    {file.path}
                    <span className="text-xs text-slate-400 ml-2">({file.language})</span>
                  </label>
                </div>
              ))}
            </div>

            <button
              onClick={generateTestSummaries}
              disabled={selectedFiles.length === 0 || loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white py-2 px-6 rounded-lg font-medium transition-colors flex items-center"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Zap className="mr-2" />}
              Generate Test Summaries ({selectedFiles.length} files)
            </button>
          </div>
        )}
        {step === 3 && (
          <div className="max-w-4xl mx-auto bg-slate-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Zap className="mr-2 text-purple-400" />
              Generated Test Case Summaries
            </h2>

            <div className="space-y-4">
              {testSummaries.map((summary) => (
                <div key={summary.id} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-white">{summary.title}</h3>
                    <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs">{summary.framework}</span>
                  </div>
                  <p className="text-slate-300 mb-3">{summary.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {summary.coverage.map((item, index) => (
                      <span key={index} className="bg-slate-600 text-slate-200 px-2 py-1 rounded text-xs">
                        {item}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => generateTestCode(summary)}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center"
                  >
                    {loading ? <Loader2 className="animate-spin mr-2" /> : <Play className="mr-2" />}
                    Generate Code
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="max-w-6xl mx-auto bg-slate-800 rounded-xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <FileText className="mr-2 text-purple-400" />
                Generated Test Code: {selectedSummary?.title}
              </h2>
              <div className="flex space-x-3">
                <button
                  onClick={() => navigator.clipboard.writeText(generatedCode)}
                  className="bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Copy Code
                </button>
                <button
                  onClick={createPullRequest}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center"
                >
                  {loading ? <Loader2 className="animate-spin mr-2" /> : <GitPullRequest className="mr-2" />}
                  Create PR
                </button>
              </div>
            </div>

            <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-green-400 text-sm whitespace-pre-wrap">
                <code>{generatedCode}</code>
              </pre>
            </div>

            <div className="mt-6 p-4 bg-slate-700 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Test Summary:</h3>
              <p className="text-slate-300 text-sm">{selectedSummary?.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestCaseGenerator;