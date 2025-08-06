import React, { useState } from 'react';
import axios from 'axios';
import { Github, FileText, Zap, GitPullRequest, CheckCircle, Loader2, Play, AlertCircle } from 'lucide-react';
import { toast } from "react-hot-toast";

const VITE_BACKEND_URI = import.meta.env.VITE_BACKEND_URI;

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
  const [error, setError] = useState('');
  const [repoInfo, setRepoInfo] = useState(null);

  const clearError = () => setError('');

  const connectToGithub = async () => {
    setLoading(true);
    clearError();
    try {
      const response = await axios.post(`${VITE_BACKEND_URI}/api/github/connect`, {
        token: githubToken,
        repoUrl,
      });
      setFiles(response.data.files);
      setRepoInfo(response.data.repository);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.details || 'Failed to connect to GitHub. Please check your token and URL.');
    } finally {
      setLoading(false);
    }
  };


  const generateTestSummaries = async () => {
    setLoading(true);
    clearError();
    try {

      const contentResponse = await axios.post(`${VITE_BACKEND_URI}/api/github/content`, {
        token: githubToken,
        files: files.filter(file => selectedFiles.includes(file.path)),
      });

      if (contentResponse.data.fileContents.length === 0) {
        throw new Error('No valid file contents could be fetched.');
      }
      const summaryResponse = await axios.post(`${VITE_BACKEND_URI}/api/ai/generate-summaries`, {
        fileContents: contentResponse.data.fileContents,
      });

      setTestSummaries(summaryResponse.data.summaries);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.details || err.message || 'Failed to generate test summaries.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Generate Test Code
  const generateTestCode = async (summary) => {
    setSelectedSummary(summary);
    setLoading(true);
    clearError();
    try {
      // First, get the full content of the relevant files
      const contentResponse = await axios.post(`${VITE_BACKEND_URI}/api/github/content`, {
        token: githubToken,
        files: files.filter(file => summary.files.includes(file.path)),
      });

      // Second, send the summary and relevant file contents to the AI
      const codeResponse = await axios.post(`${VITE_BACKEND_URI}/api/ai/generate-test-code`, {
        summary,
        fileContents: contentResponse.data.fileContents,
      });

      setGeneratedCode(codeResponse.data.testCode);
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.details || 'Failed to generate test code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 4 (Optional): Create Pull Request
  const createPullRequest = async () => {
    setLoading(true);
    clearError();
    try {
      const prResponse = await axios.post(`${VITE_BACKEND_URI}/api/github/create-pr`, {
        token: githubToken,
        owner: repoInfo.owner,
        repo: repoInfo.repo,
        testCode: generatedCode,
        summary: selectedSummary,
      });
      toast.success(`Pull Request created successfully! 🎉\nPR URL: ${prResponse.data.pullRequest.html_url}`);
    } catch (err) {
      setError(err.response?.data?.details || 'Failed to create pull request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 font-sans text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold mb-2 flex items-center justify-center">
            <Zap className="inline-block mr-3 text-yellow-400" size={48} />
            AI Test Case Generator
          </h1>
          <p className="text-slate-300 text-lg">Generate intelligent test cases for your GitHub repositories</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-md font-bold transition-all duration-300 ${step >= num ? 'bg-purple-500 text-white' : 'bg-slate-600 text-slate-300'}`}>
                  {step > num ? <CheckCircle className="w-5 h-5" /> : num}
                </div>
                {num < 4 && <div className={`w-20 h-1 ${step > num ? 'bg-purple-500' : 'bg-slate-600'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="max-w-xl mx-auto bg-red-800 border border-red-600 text-white px-6 py-4 rounded-lg mb-8 flex items-center">
            <AlertCircle className="mr-3" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1 UI: Connect to GitHub */}
        {step === 1 && (
          <div className="max-w-lg mx-auto bg-slate-800 rounded-xl p-8 shadow-2xl">
            <div className="text-center mb-6">
              <Github className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-white">Connect to GitHub</h2>
              <p className="text-slate-400">Provide your personal access token and repository URL.</p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="GitHub Personal Access Token"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                className="w-full px-5 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Repository URL (e.g., owner/repo)"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full px-5 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none"
              />
              <button
                onClick={connectToGithub}
                disabled={loading || !githubToken || !repoUrl}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:text-slate-400 text-white py-3 px-6 rounded-lg font-bold transition-colors flex items-center justify-center"
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : <Github className="mr-2" />}
                Connect Repository
              </button>
            </div>
          </div>
        )}

        {/* Step 2 UI: Select Files */}
        {step === 2 && (
          <div className="max-w-5xl mx-auto bg-slate-800 rounded-xl p-8 shadow-2xl">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
              <FileText className="mr-3 text-purple-400" />
              Select Files for Test Generation
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 max-h-96 overflow-y-auto pr-2">
              {files.map((file) => (
                <div key={file.path} className="flex items-center p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors">
                  <input
                    type="checkbox"
                    id={`file-${file.path}`}
                    checked={selectedFiles.includes(file.path)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFiles([...selectedFiles, file.path]);
                      } else {
                        setSelectedFiles(selectedFiles.filter(f => f !== file.path));
                      }
                    }}
                    className="mr-3 w-5 h-5 text-purple-600 bg-slate-600 rounded border-slate-500 focus:ring-purple-500"
                  />
                  <label htmlFor={`file-${file.path}`} className="text-white flex-1 text-sm font-medium truncate">
                    {file.path}
                    <span className="text-xs text-slate-400 ml-2">({file.language})</span>
                  </label>
                </div>
              ))}
            </div>

            <button
              onClick={generateTestSummaries}
              disabled={selectedFiles.length === 0 || loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:text-slate-400 text-white py-3 px-8 rounded-lg font-bold transition-colors flex items-center"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Zap className="mr-2" />}
              Generate Test Summaries ({selectedFiles.length} files)
            </button>
          </div>
        )}

        {/* Step 3 UI: Generated Test Summaries */}
        {step === 3 && (
          <div className="max-w-5xl mx-auto bg-slate-800 rounded-xl p-8 shadow-2xl">
            <h2 className="text-2xl font-semibold text-white mb-8 flex items-center">
              <Zap className="mr-3 text-purple-400" />
              Generated Test Case Summaries
            </h2>

            <div className="space-y-6">
              {testSummaries.map((summary) => (
                <div key={summary.id} className="bg-slate-700 rounded-lg p-6 border border-slate-600 flex flex-col sm:flex-row sm:items-center justify-between">
                  <div>
                    <div className="flex items-center flex-wrap mb-2">
                      <h3 className="text-xl font-semibold text-white mr-3">{summary.title}</h3>
                      <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">{summary.framework}</span>
                    </div>
                    <p className="text-slate-300 mb-4">{summary.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {summary.coverage.map((item, index) => (
                        <span key={index} className="bg-slate-600 text-slate-200 px-3 py-1 rounded-full text-xs">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => generateTestCode(summary)}
                    disabled={loading}
                    className="mt-4 sm:mt-0 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:text-slate-400 text-white py-3 px-6 rounded-lg font-bold transition-colors flex items-center justify-center sm:self-center"
                  >
                    {loading ? <Loader2 className="animate-spin mr-2" /> : <Play className="mr-2" />}
                    Generate Code
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4 UI: Generated Test Code */}
        {step === 4 && (
          <div className="max-w-6xl mx-auto bg-slate-800 rounded-xl p-8 shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6">
              <h2 className="text-2xl font-semibold text-white flex items-center mb-4 sm:mb-0">
                <FileText className="mr-3 text-purple-400" />
                Generated Test Code: {selectedSummary?.title}
              </h2>
              <div className="flex space-x-3">
                <button
                  onClick={() => navigator.clipboard.writeText(generatedCode)}
                  className="bg-slate-600 hover:bg-slate-700 text-white py-3 px-6 rounded-lg font-bold transition-colors"
                >
                  Copy Code
                </button>
                <button
                  onClick={createPullRequest}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:text-slate-400 text-white py-3 px-6 rounded-lg font-bold transition-colors flex items-center"
                >
                  {loading ? <Loader2 className="animate-spin mr-2" /> : <GitPullRequest className="mr-2" />}
                  Create PR
                </button>
              </div>
            </div>

            <div className="bg-slate-900 rounded-lg p-6 overflow-x-auto text-sm max-h-[500px] overflow-y-auto">
              <pre className="text-green-400 whitespace-pre-wrap">
                <code>{generatedCode}</code>
              </pre>
            </div>

            <div className="mt-6 p-4 bg-slate-700 rounded-lg">
              <h3 className="text-white font-semibold mb-2 text-lg">Test Summary:</h3>
              <p className="text-slate-300 text-sm">{selectedSummary?.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestCaseGenerator;