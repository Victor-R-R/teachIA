-- Fix Auth.js adapter column names to match @auth/pg-adapter expectations (camelCase)

-- Drop and recreate Auth.js tables with correct camelCase column names
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS verification_tokens;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id             TEXT        PRIMARY KEY,
  name           TEXT,
  email          TEXT        UNIQUE NOT NULL,
  "emailVerified" TIMESTAMPTZ,
  image          TEXT,
  role           TEXT        NOT NULL DEFAULT 'student'
                             CHECK (role IN ('student', 'superadmin')),
  blocked        BOOLEAN     NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE accounts (
  "userId"            TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                TEXT NOT NULL,
  provider            TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token       TEXT,
  access_token        TEXT,
  expires_at          INTEGER,
  token_type          TEXT,
  scope               TEXT,
  id_token            TEXT,
  session_state       TEXT,
  PRIMARY KEY (provider, "providerAccountId")
);

CREATE TABLE sessions (
  "sessionToken" TEXT        PRIMARY KEY,
  "userId"       TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires        TIMESTAMPTZ NOT NULL
);

CREATE TABLE verification_tokens (
  identifier TEXT NOT NULL,
  token      TEXT NOT NULL,
  expires    TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
);
