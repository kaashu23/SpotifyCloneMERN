# Spotify Clone (Full Stack)

A fully-featured, full-stack Spotify clone built with the MERN stack (MongoDB, Express, React, Node.js). This project features role-based access control (Users & Artists), dynamic music playback, album creation, song uploading via ImageKit, and personalized libraries.

## 🚀 Features
- **Authentication**: JWT-based auth with secure HTTP-only cookies.
- **Roles**:
  - `user`: Can listen to music, like songs, and save albums to their library.
  - `artist`: Can create albums, upload audio files, and manage their artist library.
- **Music Player**: Global, persistent audio player with play/pause, next/prev, shuffle, repeat, timeline scrubbing, and volume control.
- **Library Management**: Dedicated "Liked Songs" and "Saved Albums" playlists.
- **Cloud Storage**: Audio files are securely uploaded and streamed via ImageKit.
- **UI/UX**: Beautiful, responsive, dark-mode design using Tailwind CSS, Lucide Icons, and the Figtree font to replicate the Spotify aesthetic.

---

## 🛠 Technology Stack
- **Frontend**: React (Vite), Tailwind CSS, React Router, Axios, Lucide React.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, bcryptjs, Multer, ImageKit.

---

## 🔑 Environment Variables
Before deploying or running locally, you must create a `.env` file in the `backend` directory.

```env
# backend/.env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key

# ImageKit Configuration (for song uploads)
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
```

---

## 📡 API Documentation

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register a new account (`username`, `email`, `password`, `role`) | Public |
| POST | `/login` | Log into an account (`email`, `password`) | Public |
| POST | `/logout` | Clear the auth cookie | Public |
| GET | `/me` | Get the currently logged-in user profile | Protected |

### Music Routes (`/api/music`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/upload` | Upload a new song (`title`, `music` file, optional `albumId`) | Artist Only |
| POST | `/album` | Create a new album (`title`) | Artist Only |
| GET | `/` | Fetch all available songs | Protected |
| GET | `/albums` | Fetch all available albums | Protected |
| GET | `/albums/saved` | Fetch the current user's saved albums | Protected |
| GET | `/albums/:albumId` | Fetch details & songs of a specific album | Protected |
| POST | `/like/:musicId` | Toggle like status of a song | Protected |
| GET | `/liked` | Fetch all liked songs for the current user | Protected |
| POST | `/album/save/:albumId` | Toggle save status of an album | Protected |

---

## 🚀 Deployment Guide

### 1. Deploying the Backend on Render
1. Create a GitHub repository and push your `backend` folder code.
2. Log in to [Render](https://render.com/).
3. Click **New +** > **Web Service**.
4. Connect your GitHub repository.
5. Configuration:
   - **Name**: `spotify-clone-backend`
   - **Root Directory**: `backend` (if it's in a subfolder)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js` (or `npm start` if defined in package.json)
6. Scroll down to **Environment Variables** and add all the keys from your `.env` file (MONGO_URI, JWT_SECRET, IMAGEKIT, etc.).
7. Click **Create Web Service**. Wait for the build to finish, and copy the deployed URL (e.g., `https://spotifyclonemern.onrender.com`).

### 2. Preparing Frontend for Deployment
Before deploying the frontend, you need to tell Axios to use your new Render backend URL instead of localhost.

1. Open `frontend/src/App.jsx` (and any other files where Axios is configured).
2. Set the default base URL for Axios directly under your imports:
   ```javascript
   import axios from 'axios';
   
   // Replace with your actual Render URL
   axios.defaults.baseURL = 'https://spotifyclonemern.onrender.com';
   axios.defaults.withCredentials = true;
   ```
3. Remove the proxy from `vite.config.js` as it is only for local development.

### 3. Deploying the Frontend on Netlify
Netlify needs a special `_redirects` file so that React Router can handle page navigation correctly (otherwise refreshing on `/library` will result in a 404 error).

1. In your `frontend/public/` folder, create a file named `_redirects` (no file extension).
2. Add the following line to `_redirects`:
   ```text
   /*   /index.html   200
   ```
3. Create a GitHub repository for your `frontend` code and push it.
4. Log in to [Netlify](https://www.netlify.com/).
5. Click **Add new site** > **Import an existing project**.
6. Connect your GitHub repository.
7. Configuration:
   - **Base directory**: `/` (or `frontend` depending on your repo structure)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
8. Click **Deploy Site**.

### ⚠️ Important Note About Cookies
Because the frontend (Netlify) and backend (Render) will be on different domains (Cross-Site), your backend must configure cookies to allow cross-site usage. 
In your backend auth controller, ensure the cookie options look like this:
```javascript
res.cookie('token', token, {
    httpOnly: true,
    secure: true, // MUST be true for cross-site cookies
    sameSite: 'none', // MUST be 'none' for cross-site cookies
    maxAge: 24 * 60 * 60 * 1000 
});
```

## 🎉 All Set!
Your Spotify clone is now live and accessible on the web!
