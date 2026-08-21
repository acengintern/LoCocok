# Design Specification: Google OAuth Authentication (Login & Registration)

**Author:** Antigravity Team  
**Date:** 2026-08-21  
**Status:** Approved  
**Tech Stack:** Laravel 12/13, Laravel Socialite, Laravel Sanctum, Spatie Permission, Next.js 16 (App Router), React 19

---

## 1. Goal & Requirements
1. Implement seamless and secure **Google OAuth 2.0 (Socialite)** authentication for Loco Track.
2. Allow users to:
   - **Sign In** using an existing account linked to their Google email.
   - **Sign Up / Register** automatically when logging in with Google for the first time.
3. Automatically assign the default role **`Staff`** to newly registered Google users.
4. Integrate frontend button on `/signin` to initiate OAuth flow and handle redirect callback gracefully.

---

## 2. Security & Validation Architecture

### 2.1 Security Controls
- **CSRF State Verification**: Utilize Laravel Socialite's built-in OAuth2 `state` parameter verification to prevent Cross-Site Request Forgery.
- **Account Linking Safety**:
  - If a user with the same email already exists:
    - If `status === 'SUSPENDED'` or `'INACTIVE'`: **Reject immediately** with 403 / redirect to frontend with error `account_suspended`.
    - If `status === 'ACTIVE'`: Link `google_id` and update `avatar`, log the user in.
- **Unique Username Generation**:
  - Automatically derive base username from email handle (e.g. `john.doe@gmail.com` -> `john.doe`).
  - Slugify and ensure uniqueness against collisions (e.g. `john.doe-1`, `john.doe-2`).
- **Database Schema**:
  - Migration to add `google_id` (nullable, indexed) and `avatar` (nullable) to `users` table.
  - Make `password` column nullable to support pure OAuth users without exposing default passwords.
- **Rate Limiting**:
  - Apply `throttle:10,1` on OAuth endpoints to prevent automated abuse.
- **Sanctum Token Handoff**:
  - Upon successful OAuth callback, generate a Sanctum personal access token (`$user->createToken('google-auth')->plainTextToken`).
  - Redirect to frontend callback route: `${FRONTEND_URL}/auth/callback?token=${token}&status=success`.
  - Record audit activity in Spatie ActivityLog (`activity()->causedBy($user)->log('Logged in via Google OAuth')`).
- **Error Handling**:
  - Handle OAuth cancelation or Google API exceptions gracefully, redirecting to `${FRONTEND_URL}/signin?error=oauth_failed`.

---

## 3. Architecture & API Endpoints

### 3.1 Backend Endpoints (`routes/api.php` or `routes/web.php`)
- `GET /api/v1/auth/google/redirect`: Redirects the client to Google's OAuth consent screen with scopes `openid profile email`.
- `GET /api/v1/auth/google/callback`: Receives authorization code from Google, exchanges for user details, performs user creation/login, and redirects to frontend.

### 3.2 Frontend Endpoints
- `/signin`: Button click initiates redirect to `http://localhost:8000/api/v1/auth/google/redirect`.
- `/auth/callback`: App Router page `src/app/(full-width-pages)/(auth)/callback/page.tsx`:
  - Extracts `token` from URL search parameters.
  - Initializes user session in `AuthContext` via `localStorage.setItem('auth_token', token)`.
  - Fetches authenticated user info via `GET /api/v1/user` or `GET /api/v1/profile`.
  - Shows success notification and redirects to `/dashboard`.
  - If `error` parameter is present, displays error toast and redirects back to `/signin`.

---

## 4. Environment Variables Configuration
**Backend `.env`**:
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

**Config `backend/config/services.php`**:
```php
'google' => [
    'client_id' => env('GOOGLE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    'redirect' => env('GOOGLE_REDIRECT_URI'),
],
```

---

## 5. Verification & Testing
- PHPUnit Feature tests in `backend/tests/Feature/GoogleAuthTest.php`:
  - Test redirect to Google returns valid redirect response.
  - Test callback creates new user with `Staff` role when email does not exist.
  - Test callback links existing active user with matching email.
  - Test callback rejects suspended user with error.
  - Test username collision handling.
- Frontend compilation check with `npm run build` (0 errors).
