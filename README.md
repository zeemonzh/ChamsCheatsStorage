# ChamsCheats Storage – MVP

Neon-themed full stack platform for uploading, storing, downloading, and deleting large files (up to 500 MB) with JWT auth. Built with Next.js + Tailwind + Framer Motion on the frontend and Express + MongoDB + Multer + optional S3 storage on the backend.

## Project layout

```
frontend/  # Next.js app (pages router)
backend/   # Express API + MongoDB + Multer/S3 storage
```

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB instance (local or Atlas)

## Quick start

### Backend

```bash
cd backend
cp .env.example .env    # update MongoDB + JWT + storage settings
npm run dev             # http://localhost:5000
```

The API exposes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/files/upload`
- `GET /api/files`
- `GET /api/files/download/:id`
- `DELETE /api/files/:id`
- `PATCH /api/files/:id`
- `POST /api/share` (generate time-boxed public links)
- `GET /api/share/:token` + `/api/share/:token/download/:fileId`
- `GET /api/invites` (admin only)
- `POST /api/invites` (admin only)

### Frontend

```bash
cd frontend
cp .env.local.example .env.local  # point to backend API
npm run dev                       # http://localhost:3000
```

Pages:

- `/login` & `/register` – token issuing auth flow
- `/dashboard` – file list, download/delete actions
- `/upload` – drag & drop uploader with progress bar

## Notes

- Registration is invite-only. Create invite codes from the Dashboard (only users listed in `INVITE_ADMIN_EMAILS` can generate codes) and share them with trusted users. Each code is single-use and must be entered on the registration form.
- Default storage provider is local disk (`backend/uploads`). Switch to an S3-compatible provider (AWS S3, Cloudflare R2, MinIO, etc.) by setting `STORAGE_PROVIDER=s3` and populating the AWS variables. For Cloudflare R2, set `AWS_REGION=auto`, `AWS_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com`, and optionally `CDN_BASE_URL` to a public Worker/Custom domain.
- Files can be organized via collections + sub-collections, and any file or collection can be shared through expiring public links (`/share/:token`) without exposing the dashboard.
- Upload limit enforced at both frontend (client-side messaging) and backend (multer limit).
- JWT tokens persist in `localStorage`; API requires `Authorization: Bearer <token>`.

