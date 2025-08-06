# Workik Assignment: AI Test Case Generator

## Description

This project is a web application designed to demonstrate the feasibility of an AI-powered test case generator. It integrates with GitHub to allow a user to select code files from a repository and, using an AI model, generate suggested test cases. This application streamlines the testing process by providing a user-friendly interface to manage, generate, and even submit test cases directly to a GitHub repository.

The primary goal of this application is to showcase a full-stack solution that combines GitHub's API with a large language model (LLM) to assist developers in writing tests more efficiently.

## Features

* **GitHub Integration**: Authenticate with GitHub to access and list code files from a user's repositories.
* **File Selection**: A clean UI to browse and select multiple code files for which test cases need to be generated.
* **AI-Powered Test Case Summary**: The application sends the selected code files to an AI model (like Gemini) and receives a summary of potential test cases.
* **Interactive Test Case Generation**: Users can select a specific test case summary and, with a single click, generate the complete code for that test.
* **Clean UI/UX**: The interface is designed to be intuitive and easy to navigate, ensuring a smooth user experience from file selection to test case generation.
* **Optional - GitHub Pull Request Integration**: A bonus feature that allows the user to automatically create a new branch and a Pull Request on GitHub with the newly generated test case code.

## Technologies Used

* **Frontend**: React
* **Backend**: Node.js / Python (Choose one)
* **Database**: Not applicable for this prototype.
* **AI Model**: Gemini API (or any other free/open-source LLM)
* **Version Control**: Git / GitHub

This `README.md` provides a solid foundation for your project and is an excellent way to organize your submission. Let me know if you need help with any specific parts of the code!