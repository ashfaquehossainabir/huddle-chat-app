# Huddle

A responsive messenger-style web app where people sign up with a unique username, chat one-to-one, and create group conversations.

**Stack:** React 18 (Vite) · Express 4 · MongoDB (Mongoose) · JWT authentication

---

## Table of contents
1. [Features](#features)
2. [How it works](#how-it-works)
3. [Project structure](#project-structure)
4. [Getting started (local)](#getting-started-local)
5. [Environment variables](#environment-variables)
6. [API reference](#api-reference)
7. [Data models](#data-models)
8. [Rules and limits](#rules-and-limits)
9. [Responsive design](#responsive-design)
10. [Deployment (Vercel + Render)](#deployment-vercel--render)
11. [CORS](#cors)
12. [Troubleshooting](#troubleshooting)
13. [Known limitations and ideas](#known-limitations-and-ideas)

---

## Features

### Authentication
- Sign up with full name, unique username and password; log in with username and password.
- Passwords are hashed with bcrypt; sessions use a JWT valid for 7 days.
- Sessions persist across page reloads (token kept in `localStorage`). Log out from the sidebar.
- Protected API: every route except signup, login and `/health` requires a valid token.

### Usernames and user search
- Every user has a unique username (3-20 letters, numbers or underscores, stored in lowercase).
- Search by the start of a username to find people. Results show name, username and activity status.
- Search is used both to start direct chats and to add people to groups.

### Direct messages
- Start a one-to-one chat with any user by searching their username (Direct tab, "New message").
- Your conversations appear in the Direct tab once a message has been exchanged.

### Groups
- Create a group with a name and initial members (found by username).
- The Groups tab lists every group you created or joined.
- Any member can add more people by username from the Members panel.
- Group chat shows the sender's name and username on each message.
- The creator is the group **owner**.

### Group management
- **Leave group:** any member can leave. If the owner leaves, ownership passes to the next member. If the last member leaves, the group and its messages are deleted.
- **Remove members:** the owner can remove any other member.
- **Members panel:** shows all members, who the owner is, and each member's activity status.

### Read receipts
- Your own messages show **Sent**, then **Seen** in direct chats.
- In groups they show **Seen by N**, where N is how many other members have opened the chat since the message was sent.

### Typing indicators
- "Name is typing..." appears above the message box while someone types.
- In groups, several typers are listed ("Ana, Ben are typing...").

### Activity status
- Shows **Active now**, or **Active 3 minutes ago** (also hours and days).
- Displayed in the chat header, the Direct list, the group member list and search results.
- A user counts as active whenever their app is open and talking to the server.

### Deleting messages
- **Delete a message:** you can delete your own messages; they disappear for everyone.
- **Delete all messages:**
  - Direct chat: either participant can use **Clear chat**.
  - Group: only the owner can use **Delete all messages** (in the Members panel).
  - Both ask for confirmation and delete for everyone. This cannot be undone.

### Responsive UI
- Works on desktop, laptop, tablet and mobile (see [Responsive design](#responsive-design)).
- Automatic light and dark theme based on the device setting.
- Safe-area support for phones with notches and home indicators.

---

## How it works

- **Near-real-time updates through polling** (no WebSockets):
  - open conversation: every 3 seconds
  - sidebar chats and activity status: every 5 seconds
  - typing status: every 1.5 seconds
- **Read receipts:** loading a conversation marks other people's unread messages as read by you (`readBy`).
- **Typing:** the client pings the server at most once every 2 seconds while typing; the server remembers typers for 4 seconds.
- **Activity:** every authenticated request updates the user's `lastActive` timestamp.
- **Direct chat key:** a direct conversation is the set of messages between two users with no group attached.

---

## Project structure

```
huddle/
├── render.yaml               # Render Blueprint (API)
├── README.md
├── server/
│   ├── index.js              # Express app: models, auth, routes, CORS
│   ├── package.json
│   └── .env.example
└── client/
    ├── index.html
    ├── vite.config.js        # dev proxy: /api -> http://localhost:5000
    ├── vercel.json           # SPA rewrite + build settings
    ├── package.json
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx           # Page switch: Splash -> Auth -> Home
        ├── pages/
        │   ├── SplashPage/   # SplashPage (session check)
        │   ├── AuthPage/     # AuthPage, AuthHero, PasswordField
        │   └── HomePage/     # HomePage (sidebar + chat + modals), EmptyState
        ├── api/              # client.js (fetch wrapper), session.js (token storage)
        ├── utils/            # format.js, avatarColor.js, message.js
        ├── hooks/            # useAuth, useTheme, useConversations, useMessages,
        │                     # useTypingUsers, useAutoScroll, useAutoGrow
        ├── components/       # shared pieces used by pages
        │   ├── ui/           # Icon, Mark, BrandLockup, Avatar, Modal, ThemeToggle, UserPicker
        │   ├── account/      # SettingsModal, ProfileForm, PasswordForm, ConfirmLogout
        │   ├── sidebar/      # Sidebar, ProfileRow, ConversationTabs, ConversationList
        │   ├── chat/         # Chat, ChatHeader, MessageList, MessageBubble, Composer, TypingIndicator
        │   ├── groups/       # NewGroupModal, MembersModal
        │   └── direct/       # NewMessageModal
        └── styles/           # index.css imports tokens, base, forms, buttons, identity,
                              # auth, layout, chat, composer, modals, responsive, motion
```

---

## Getting started (local)

**Requirements:** Node.js 18+, and MongoDB running locally or an Atlas connection string.

```bash
# 1. API
cd server
cp .env.example .env        # then edit values
npm install
npm start                   # http://localhost:5000

# 2. Client (new terminal)
cd client
npm install
npm run dev                 # http://localhost:5173
```

Leave `VITE_API_URL` empty in local development; Vite proxies `/api` to the server.
To test the app, sign up two accounts in two browsers (or one normal and one private window).

Production build of the client: `npm run build` (output in `client/dist`).

---

## Environment variables

### Server (`server/.env`)
| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | yes | MongoDB connection string, e.g. `mongodb://127.0.0.1:27017/huddle` |
| `JWT_SECRET` | yes | Long random string used to sign tokens |
| `CLIENT_URL` | yes (production) | Comma-separated allowed frontend origins. Default `http://localhost:5173` |
| `PORT` | no | Defaults to `5000` (Render sets it automatically) |

The server exits on startup if `MONGO_URI` or `JWT_SECRET` is missing.

### Client (`client/.env`)
| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | production only | Public URL of the API, no trailing slash and no `/api`. Baked in at build time |

---

## API reference

Base path `/api`. Send `Authorization: Bearer <token>` on every request except signup and login.
Errors return JSON `{ "error": "message" }`.

### Auth and profile
| Method | Path | Body / query | Description |
|---|---|---|---|
| POST | `/auth/signup` | `name, username, password` | Create account, returns `{ token, user }` |
| POST | `/auth/login` | `username, password` | Returns `{ token, user }` |
| GET | `/me` | | Current user |
| GET | `/users/search` | `?q=prefix` | Up to 8 users whose username starts with `q` (excludes you) |

### Chats and groups
| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/chats` | | `{ groups, direct }` for the sidebar |
| POST | `/groups` | `name, members[]` (usernames) | Create a group (you become owner and member) |
| POST | `/groups/:id/members` | `username` | Add a member (any member can) |
| DELETE | `/groups/:id/members/:username` | | Remove a member (owner only) |
| POST | `/groups/:id/leave` | | Leave the group |

### Messages
| Method | Path | Body / query | Description |
|---|---|---|---|
| GET | `/messages` | `?type=group\|dm&id=<groupId or username>` | Latest 100 messages; marks others' messages as read |
| POST | `/messages` | `type, to, text` | Send a message (`to` is a group id or a username) |
| DELETE | `/messages/:id` | | Delete your own message |
| DELETE | `/messages` | `?type=group\|dm&id=...` | Delete all messages in a conversation (DM: either user; group: owner only) |

### Typing and health
| Method | Path | Description |
|---|---|---|
| POST | `/typing` | Body `type, to`. Marks you as typing |
| GET | `/typing` | `?type&id`. Names of others currently typing |
| GET | `/health` | Public health check (`{ ok: true }`) |

---

## Data models

**User:** `name`, `username` (unique, lowercase), `password` (bcrypt hash), `lastActive`, timestamps.

**Group:** `name`, `owner` (User), `members` (Users), timestamps.

**Message:** `sender` (User), `recipient` (User, direct messages only), `group` (Group, group messages only), `text`, `readBy` (Users), timestamps.

---

## Rules and limits
- Username: 3-20 characters, letters, numbers, underscore; unique; case-insensitive.
- Password: at least 6 characters.
- Message: up to 2,000 characters; empty messages are rejected.
- Request body limit: 100 KB.
- Only the latest 100 messages of a conversation are loaded.
- Only members can read or send in a group; only the owner can remove members or delete all group messages.
- You can only delete your own messages individually.
- The token expires after 7 days; an expired or invalid token sends the user back to login.

---

## Responsive design

| Screen | Layout |
|---|---|
| Desktop / laptop (over 1024px) | 320px sidebar beside the chat |
| Tablet (721-1024px) | Narrower 270px sidebar beside the chat |
| Mobile (720px and below) | Single column: chat list first; opening a chat shows the conversation with a back button |

Modals fit small screens, the composer respects the phone safe area, and text wraps for long messages.

---

## Deployment (Vercel + Render)

Deploy in this order: database, API, frontend, then update CORS.

### 1. MongoDB Atlas
1. Create a free M0 cluster at mongodb.com/atlas.
2. Database Access: add a database user (save the password).
3. Network Access: add `0.0.0.0/0`.
4. Copy the connection string, replace `<password>`, and add the database name:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/huddle?retryWrites=true&w=majority`
   (URL-encode special characters in the password).

### 2. Render (API)
1. Push the project to GitHub.
2. New > Blueprint, select the repo (uses `render.yaml`). Or create a Web Service manually with Root Directory `server`, Build `npm install`, Start `npm start`, Health Check `/health`.
3. Set `MONGO_URI`, `CLIENT_URL` (temporarily `*.vercel.app`) and `JWT_SECRET` (auto-generated by the Blueprint).
4. Verify `https://YOUR-API.onrender.com/health` returns `{"ok":true}`.

### 3. Vercel (client)
1. Add New > Project and import the repo.
2. Root Directory: `client` (Vite is detected automatically).
3. Environment variable: `VITE_API_URL` = your Render URL (no trailing slash).
4. Deploy.

### 4. Final CORS update
On Render set `CLIENT_URL` to the exact Vercel origin, e.g. `https://huddle-xyz.vercel.app,*.vercel.app`, and let it redeploy.

Both platforms redeploy automatically on every push to `main`.

---

## CORS

The API only accepts browser requests from origins listed in `CLIENT_URL`.
- Separate several origins with commas, no trailing slashes: `https://a.vercel.app,https://b.com`.
- Entries starting with `*.` match any subdomain (`*.vercel.app` allows preview deployments).
- Preflight requests are handled; allowed methods are GET, POST, PUT, PATCH, DELETE, OPTIONS; allowed headers are `Content-Type` and `Authorization`.
- Requests from other origins are rejected.

---

## Troubleshooting
| Problem | Fix |
|---|---|
| CORS error in the browser | `CLIENT_URL` must exactly match the site origin (check `http` vs `https` and trailing slash) |
| Requests go to the wrong host or fail | Set `VITE_API_URL` in Vercel and redeploy (it is applied at build time) |
| First request is very slow | Render's free plan sleeps when idle; wait 30-60 seconds |
| "Set MONGO_URI and JWT_SECRET" in Render logs | Add the missing environment variable |
| MongoDB timeout | Allow `0.0.0.0/0` in Atlas and check the password in the URI |
| 404 after refreshing on Vercel | Ensure `client/vercel.json` exists (SPA rewrite) |
| "Username is already taken" | The username exists (maybe from an earlier or double-clicked signup): try Log in, or pick another. If it appears for a brand-new name, see the API logs for a "Duplicate key" line: a stale index in the database (e.g. from another project) is the cause. Use a fresh database or drop the old index |

---

## Known limitations and ideas
- Updates use polling; WebSockets (Socket.IO) would give instant delivery and remove polling load.
- Typing status is stored in server memory, so it resets on restart and does not work across multiple server instances (use Redis or Socket.IO).
- The JWT is stored in `localStorage`; an httpOnly cookie is a stricter alternative.
- No rate limiting, password reset, email verification, or account deletion yet.
- Messages are text only (no images, files or emoji picker), with no editing and no pagination beyond the latest 100.
- People are added to groups directly without an invitation or approval step.
- Activity status only reflects when the app last contacted the server.
