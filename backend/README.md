# Spotify Clone Backend API

This is the backend for a Spotify Clone built with Node.js, Express.js, and MongoDB. It provides a RESTful API for user authentication, music uploads, and album management. It utilizes role-based access control to differentiate between regular users and artists.

## Tech Stack

*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB with Mongoose
*   **Authentication:** JSON Web Tokens (JWT) & bcrypt for password hashing
*   **File Uploads:** Multer (memory storage)
*   **Cloud Storage:** ImageKit (for hosting audio files/images)

## Features

*   **Role-Based Access Control:** Differentiates between `user` and `artist` roles.
*   **Authentication:** Register, Login, and Logout functionality using JWT stored in cookies.
*   **Music Management (Artists):** Artists can upload music tracks (audio files are uploaded to ImageKit).
*   **Album Management (Artists):** Artists can create albums and group multiple tracks together.
*   **Browsing (Users):** Users can fetch all music tracks, browse albums, and view specific album details.

## API Endpoints

### Authentication Routes (`/auth`)

*   `POST /auth/register`: Register a new account (user or artist).
*   `POST /auth/login`: Authenticate an account and receive a JWT cookie.
*   `POST /auth/logout`: Clear the JWT cookie to log out.

### Music & Album Routes (`/music` or relevant prefix)

*   `GET /`: Get a list of all music tracks (Requires `user` authentication).
*   `GET /albums`: Get a list of all albums (Requires `user` authentication).
*   `GET /albums/:albumId`: Get specific album details and its tracks (Requires `user` authentication).
*   `POST /upload`: Upload a single music file (Requires `artist` authentication, uses Multer field name `music`).
*   `POST /album`: Create a new album with an array of music IDs (Requires `artist` authentication).

## Installation and Setup

1.  **Clone the repository** (if applicable).
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Environment Variables:** Create a `.env` file in the root directory and add the following required variables:
    ```env
    # Database Configuration
    MONGODB_URI=your_mongodb_connection_string

    # Authentication
    JWT_SECRET=your_jwt_secret_key

    # ImageKit Configuration (for file uploads)
    IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
    IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
    IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
    ```
4.  **Run the application:**
    *   For development (uses nodemon):
        ```bash
        npm run dev
        ```
    *   For production:
        ```bash
        npm start
        ```

The server should now be running on port 3000 (or the port specified in your environment variables).
