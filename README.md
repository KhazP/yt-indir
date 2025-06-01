# YT-Indir - YouTube Video Downloader 🎬⬇️

YT-Indir is a web application designed to help you download your favorite YouTube videos for offline viewing. It features a sleek, modern glassmorphism UI and provides video previews before downloading.

**Disclaimer:** This tool is intended for downloading publicly available, non-copyrighted content or content for which you have explicit permission from the copyright holder. Users are responsible for adhering to YouTube's Terms of Service and all applicable copyright laws. Please use this tool responsibly.

## ✨ Key Features

*   **Modern UI**: Clean and responsive glassmorphism design.
*   **Video Preview**: View video title, thumbnail, duration, and view count before downloading (via YouTube Data API).
*   **Quality Selection**: Choose from available video qualities (e.g., 360p, 480p, 720p, 1080p).
*   **Real-time URL Validation**: Instant feedback on YouTube URL input.
*   **Progress Visualization**: UI components are in place for future download progress tracking.
*   **Legal Safeguards**: Includes age gate and legal disclaimer modals to promote responsible use.
*   **Efficient Processing**: Utilizes `yt-dlp` (via `ytdlp-nodejs`) for robust video downloading capabilities.

## 🛠️ Tech Stack

*   **Frontend**: React, Vite, Tailwind CSS, TypeScript
*   **Backend (Current)**: Node.js, Express
*   **Video Processing**: `ytdlp-nodejs` (a Node.js wrapper for `yt-dlp`)
*   **Database (Currently for download metadata/status simulation)**: NeonDB (using Drizzle ORM)
*   **Shared Code**: Zod for schema validation.

### Target Architecture (Future Goals)
*   **Backend**: Migrate from Node.js to Cloudflare Workers for a serverless architecture.
*   **Processing**: Integrate yt-dlp WASM + FFmpeg.wasm for in-browser or edge processing.
*   **Hosting**: Deploy to Cloudflare Pages.

## 🚀 Project Status & Roadmap

*   ✅ UI/UX Design Complete (Glassmorphism, Dark Mode, Responsive)
*   ✅ Video Preview Functionality (YouTube Data API)
*   ✅ YouTube URL Validation (Real-time)
*   ✅ Quality Selector Dropdown
*   ✅ Backend Download Endpoint: Basic video file streaming implemented using `ytdlp-nodejs`.
*   🚧 **In Progress / Needs Testing**:
    *   Thorough testing of the current Node.js download functionality across various YouTube videos and quality settings.
    *   Refinement of video format selection and error handling in the download process.
*   🎯 **Next Steps**:
    1.  Stabilize and thoroughly test the Node.js backend video download feature.
    2.  Implement robust client-side progress visualization for downloads.
    3.  Begin migration of backend logic from Node.js/Express to Cloudflare Workers.
    4.  Integrate yt-dlp WASM / FFmpeg.wasm for worker-based or client-side processing (reducing server load).
    5.  Deploy the complete application to Cloudflare Pages with Cloudflare Workers.

## ⚙️ Setup & Installation

To run this project locally, you'll need Node.js (v18+ recommended) and npm installed.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/yt-indir.git # Replace with your actual repository URL
    cd yt-indir
    ```

2.  **Install dependencies:**
    Dependencies for both the server and client are managed in the root `package.json`.
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    *   You'll need a **YouTube Data API Key** for the video information preview feature.
    *   Create a `.env` file in the project root (where `package.json` is).
    *   Add your API key to the `.env` file:
        ```env
        YOUTUBE_API_KEY=your_youtube_api_key_here
        ```
    *   The application also expects a `DATABASE_URL` for Drizzle ORM (used for download status simulation). You can set up a free NeonDB instance or adapt the storage logic.
        ```env
        DATABASE_URL=your_neon_db_connection_string_here
        ```
    *   Ensure `yt-dlp` and `ffmpeg` are accessible in your server's environment. While `ytdlp-nodejs` attempts to download `yt-dlp`, system configurations can vary. `ffmpeg` might be needed by `yt-dlp` for merging certain video/audio formats.

4.  **Running the Backend Server (Node.js):**
    The backend server handles API requests, including video downloads.
    ```bash
    npm run dev
    ```
    This will typically start the server (check your console output, often on a port like `3000` or `8080`).

5.  **Running the Frontend (React + Vite):**
    The frontend is a Vite application. The `vite.config.ts` specifies `client` as its root.
    ```bash
    cd client
    npx vite
    ```
    This will start the Vite development server, usually on `http://localhost:5173`. Open this URL in your browser.

## 📄 Usage

1.  Ensure both the backend server and frontend Vite development server are running.
2.  Open the frontend URL (e.g., `http://localhost:5173`) in your web browser.
3.  Paste a valid YouTube video URL into the input field.
4.  The application will attempt to fetch and display video details (title, thumbnail, etc.).
5.  Select your desired video quality from the dropdown menu.
6.  Click the "Download Video" button.
7.  If successful, the video should start downloading directly through your browser via the backend.

## ⚖️ License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

*This README is a living document and will be updated as the project progresses and features are added or refined.* 