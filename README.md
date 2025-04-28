# Module Insight Application

## Overview

Module Insight is a multi-platform application designed to provide insights and recommendations based on module review data. It features:

*   **Review Analysis:** Processes student reviews to determine sentiment, emotions, key topics, and overall module outlook.
*   **Recommendations:** Offers personalized module recommendations for students and provides feedback insights for teachers.
*   **User Management:** Supports different roles (Student, Teacher) with distinct features (saving modules, tracking taught modules, personal preferences).
*   **Cross-Platform:** Built with a Flask backend and a React Native (Expo) frontend, enabling use on web browsers, iOS, and Android devices (via Expo Go or native builds).

This project combines data processing capabilities (explored in the `Data_Preprocessing_Labelling` notebooks) with a functional web/mobile application.

## Project Structure

The project is organized into three main directories:

*   **`/Data_Preprocessing_Labelling`**: Contains Jupyter notebooks used for initial data exploration, sentiment/emotion analysis, topic modelling experiments, model performance evaluation, and data preprocessing steps. This directory represents the research and development phase for the data analysis components.
*   **`/backend`**: Contains the Python Flask web server code.
    *   `app.py`: Main Flask application entry point.
    *   `database.py`, `models.py`: SQLAlchemy database setup and models.
    *   `routes/`: Flask Blueprints defining API endpoints for authentication, modules, and recommendations.
    *   `populate_db.py`: Script to seed the database with initial data (from processed CSVs).
    *   `requirements.txt`: Python dependencies.
    *   `instance/`: Contains the SQLite database file (`database.db`).
*   **`/frontend`**: Contains the React Native (Expo) application code.
    *   `MyApp/`: The root directory for the Expo application source.
        *   `App.js`: Main application component, sets up navigation.
        *   `Screens/`: Components for each screen of the application.
        *   `api/apiService.js`: Functions for making calls to the backend API.
        *   `UserContext.js`: React Context for managing global user state.
        *   `assets/`: Static assets like images and icons.
        *   `package.json`: Node.js dependencies and project metadata.
    *   `analysis_plots/`, `analysis_plots_topic_module/`: Contains paths to generated plots from the data analysis phase, used by the application.

Please note that the actual datasets have been removed from the `/reviews_data_processing`, for the purpose of submission, and the database is already populated, so it is not required to run `populate_db.py`.

## Prerequisites

*   Python 3.x
*   Node.js (LTS version recommended)
*   npm (usually comes with Node.js)
*   `pip` (Python package installer)
*   **(macOS specific)** `watchman`: Recommended for optimal performance with the React Native Metro bundler. Install via Homebrew: `brew install watchman`

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <your-repository-directory>
    ```

2.  **Backend Setup:**
    ```bash
    cd backend

    # Create and activate a virtual environment (recommended)
    python3 -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`

    # Install Python dependencies
    pip install -r requirements.txt

    # Initialize/Populate the database (if necessary)
    # Check if `populate_db.py` needs to be run manually for initial setup.
    # python3 populate_db.py
    ```

3.  **Frontend Setup:**
    ```bash
    cd ../frontend/MyApp
    npm install
    ```

## Running the Application

You need to run both the backend Flask server and the frontend Expo development server simultaneously.

1.  **Start the Backend Server:**
    *   Open a terminal window.
    *   Navigate to the `backend` directory.
    *   Activate the virtual environment: `source venv/bin/activate`
    *   Run the Flask app:
        ```bash
        python3 app.py
        ```
    *   Note the address the server is running on (usually `http://127.0.0.1:5000` or `http://localhost:5000`).

2.  **Start the Frontend Server:**
    *   Open a *second* terminal window.
    *   Navigate to the `frontend/MyApp` directory.
    *   Run the Expo development server:
        ```bash
        npx expo start
        ```
    *   This will open the Expo developer tools in your browser and show a QR code.
        *   **To run on a physical device (iOS/Android):** Install the "Expo Go" app, then scan the QR code.
        *   **To run in a simulator/emulator:** Press `i` (iOS simulator) or `a` (Android emulator).
        *   **To run in your web browser:** Press `w`.

## Configuration: Connecting Frontend to Backend (Important!)

The frontend application (`frontend/MyApp/api/apiService.js`) needs to know the address of your running backend server.

**Problem:** The original README mentioned needing to update the API endpoint manually every time the Flask server restarts. This should *not* be necessary and indicates a configuration issue.

**Correct Approach:**

1.  **Identify the Backend URL:**
    *   If running the frontend in a **web browser** on the *same machine* as the backend, use `http://localhost:5000` (or `http://127.0.0.1:5000`). Replace `5000` if your Flask app uses a different port.
    *   If running the frontend on a **physical device (Expo Go)** or an **emulator**, you *cannot* use `localhost`. You need the **local IP address** of the machine running the Flask backend.
        *   On macOS: `ipconfig getifaddr en0` (or `en1` for Wi-Fi)
        *   On Linux: `hostname -I` or `ip a`
        *   On Windows: `ipconfig` (Look for the IPv4 address of your active network adapter)
        *   The URL will look like `http://192.168.1.XXX:5000` (replace `192.168.1.XXX` with your actual local IP and `5000` with the correct port).
        *   **Note:** Your physical device running Expo Go must be on the *same Wi-Fi network* as the machine running the backend.

2.  **Configure `apiService.js`:**
    *   Open `frontend/MyApp/api/apiService.js`.
    *   Find where the base URL for API calls is defined (it might be hardcoded in multiple places or defined as a constant).
    *   **Recommendation:** Define a single constant for the base URL at the top of the file:
        ```javascript
        // Example using local IP for Expo Go / Emulator:
        // const API_BASE_URL = 'http://192.168.1.100:5000'; // <-- REPLACE with your actual local IP and port

        // Example using localhost for Web Browser:
        const API_BASE_URL = 'http://localhost:5000'; // <-- Use this if running frontend in web browser on same machine

        // --- Then use this constant in your fetch calls ---
        // Example:
        // fetch(`${API_BASE_URL}/api/auth/login`, { ... })
        ```
    *   **Best Practice:** Use environment variables (e.g., via a `.env` file and a library like `react-native-dotenv`) to manage the API URL, rather than hardcoding it directly in the source code.

**Do NOT manually change the IP/port in the code every time unless your local IP address genuinely changes frequently.** Using `localhost` for web or the correct local IP for mobile/emulator should provide a stable connection during development.

## Troubleshooting

*   **"Too many files open" / Metro Bundler Issues (macOS):** If the Expo server fails or runs slowly, especially on macOS, ensure `watchman` is installed (`brew install watchman`). It helps Metro efficiently watch project files.
*   **API Call Errors (Network Request Failed):**
    *   Double-check that the backend Flask server is running.
    *   Verify the `API_BASE_URL` in `apiService.js` is correct for how you are running the frontend (localhost for web, local IP for Expo Go/emulator).
    *   Ensure your mobile device/emulator can reach the backend machine's IP address (they must be on the same network, and no firewall should block the port).
    *   Check the backend server logs for any errors when the API call is made.