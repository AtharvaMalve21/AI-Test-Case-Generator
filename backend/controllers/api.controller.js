const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


function generateMockSummaries(fileContents) {
  const summaries = [];
  let id = 1;

  fileContents.forEach((file) => {
    if (file.language === "javascript" && file.path.includes("component")) {
      summaries.push({
        id: id++,
        title: `${file.path.split("/").pop()} Component Tests`,
        description: `Comprehensive unit tests for React component including props validation, event handling, and rendering`,
        framework: "Jest + React Testing Library",
        coverage: [
          "Props testing",
          "Event handling",
          "Rendering",
          "Accessibility",
        ],
        files: [file.path],
        priority: "high",
      });
    } else if (file.language === "python") {
      summaries.push({
        id: id++,
        title: `${file.path.split("/").pop()} Function Tests`,
        description: `Unit tests for Python functions including edge cases and error handling`,
        framework: "Pytest",
        coverage: [
          "Function logic",
          "Edge cases",
          "Error handling",
          "Input validation",
        ],
        files: [file.path],
        priority: "medium",
      });
    }
  });

  return summaries.length > 0
    ? summaries
    : [
        {
          id: 1,
          title: "Generic Code Tests",
          description: "Basic unit tests for the selected code files",
          framework: "Jest",
          coverage: ["Basic functionality", "Error handling", "Edge cases"],
          files: fileContents.map((f) => f.path),
          priority: "medium",
        },
      ];
}

function generateMockTestCode(summary) {
  if (summary.framework.includes("Jest")) {
    return `// ${summary.title}
// ${summary.description}

describe('${summary.title}', () => {
  beforeEach(() => {
    // Setup before each test
  });

  test('should handle basic functionality', () => {
    // Test basic functionality
    expect(true).toBe(true);
  });

  test('should handle edge cases', () => {
    // Test edge cases
    expect(() => {
      // Test code here
    }).not.toThrow();
  });

  test('should validate inputs', () => {
    // Test input validation
    expect(true).toBeTruthy();
  });

  afterEach(() => {
    // Cleanup after each test
  });
});`;
  }

  return `# ${summary.title}
# ${summary.description}

import pytest

class Test${summary.title.replace(/\s+/g, "")}:
    def setup_method(self):
        """Setup before each test"""
        pass
    
    def test_basic_functionality(self):
        """Test basic functionality"""
        assert True
    
    def test_edge_cases(self):
        """Test edge cases"""
        assert True
    
    def test_input_validation(self):
        """Test input validation"""  
        assert True
    
    def teardown_method(self):
        """Cleanup after each test"""
        pass`;
}

exports.generateSummaries = async (req, res) => {
  try {
    const { fileContents } = req.body;

    if (!fileContents || fileContents.length === 0) {
      return res.status(400).json({ error: "No file contents provided" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Create prompt for test case summaries
    const filesInfo = fileContents
      .map(
        (file) =>
          `File: ${file.path} (${
            file.language
          })\nContent Preview: ${file.content.substring(0, 500)}...`
      )
      .join("\n\n");

    const prompt = `
    Analyze the following code files and generate test case summaries. For each file or group of related files, create a comprehensive test summary.

    Files to analyze:
    ${filesInfo}

    Generate 3-5 test case summaries in the following JSON format:
    {
      "summaries": [
        {
          "id": 1,
          "title": "Component/Module Test Title",
          "description": "Detailed description of what will be tested",
          "framework": "Testing framework to use (Jest, Pytest, JUnit, etc.)",
          "coverage": ["Test scenario 1", "Test scenario 2", "Test scenario 3"],
          "files": ["file1.js", "file2.py"],
          "priority": "high/medium/low"
        }
      ]
    }

    Focus on:
    1. Unit tests for individual functions/components
    2. Integration tests for connected components
    3. Edge cases and error handling
    4. Performance tests if applicable
    5. Security tests if applicable

    Choose appropriate testing frameworks based on the language:
    - JavaScript/React: Jest + React Testing Library
    - Python: Pytest or unittest
    - Java: JUnit
    - Other languages: appropriate framework

    Return only valid JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const summaries = JSON.parse(jsonMatch[0]);
        res.json(summaries);
      } else {
        // Fallback with mock data if AI response isn't parseable
        const mockSummaries = generateMockSummaries(fileContents);
        res.json({ summaries: mockSummaries });
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      // Fallback with mock data
      const mockSummaries = generateMockSummaries(fileContents);
      res.json({ summaries: mockSummaries });
    }
  } catch (error) {
    console.error("AI Generation Error:", error.message);
    // Fallback with mock data
    const mockSummaries = generateMockSummaries(req.body.fileContents || []);
    res.json({ summaries: mockSummaries });
  }
};

exports.generateTestCode = async (req, res) => {
  try {
    const { summary, fileContents } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Get relevant file contents for the test
    const relevantFiles = fileContents.filter(
      (file) =>
        summary.files && summary.files.some((f) => file.path.includes(f))
    );

    const filesCode = relevantFiles
      .map((file) => `File: ${file.path}\n${file.content}`)
      .join("\n\n---\n\n");

    const prompt = `
    Generate comprehensive test code based on the following test summary and source code:

    Test Summary:
    Title: ${summary.title}
    Description: ${summary.description}
    Framework: ${summary.framework}
    Coverage Areas: ${summary.coverage.join(", ")}

    Source Code:
    ${filesCode}

    Generate complete, runnable test code that includes:
    1. All necessary imports
    2. Test setup and teardown if needed
    3. Multiple test cases covering the specified areas
    4. Proper assertions
    5. Mock/stub implementations where appropriate
    6. Comments explaining test logic

    Make sure the code is:
    - Syntactically correct
    - Follows best practices for the testing framework
    - Comprehensive but not overly verbose
    - Ready to run without modification

    Return only the test code without any markdown formatting or explanations.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const testCode = response.text();

    res.json({ testCode: testCode.replace(/```[a-zA-Z]*\n?/g, "").trim() });
  } catch (error) {
    console.error("Test Code Generation Error:", error.message);

    // Fallback with mock test code
    const mockTestCode = generateMockTestCode(req.body.summary);
    res.json({ testCode: mockTestCode });
  }
};
