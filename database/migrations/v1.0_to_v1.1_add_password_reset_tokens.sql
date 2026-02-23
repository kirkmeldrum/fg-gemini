-- ============================================================
-- Migration: v1.0 → v1.1 — Add password_reset_tokens
-- Date: 2026-02-22
-- Author: Kirk Meldrum
-- Requirements: REQ-001.9 (User can request a password reset)
-- ============================================================
-- This migration adds the password_reset_tokens table to support
-- the "Forgot Password" flow. Tokens expire after 1 hour and are
-- single-use (marked is_used = 1 after consumption).
-- ============================================================

USE FoodGenieGemini;
GO

-- ============================================================
-- FORWARD MIGRATION
-- ============================================================

BEGIN TRANSACTION;
BEGIN TRY

    -- --------------------------------------------------------
    -- 1. New Table: password_reset_tokens
    -- --------------------------------------------------------

    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_NAME = 'password_reset_tokens'
    )
    BEGIN
        CREATE TABLE password_reset_tokens (
            id          INT IDENTITY(1,1) PRIMARY KEY,
            user_id     INT             NOT NULL,
            token       NVARCHAR(255)   NOT NULL,   -- Cryptographically random, stored hashed
            expires_at  DATETIME2       NOT NULL,   -- GETDATE() + 1 hour at creation time
            is_used     BIT             NOT NULL DEFAULT 0,
            used_at     DATETIME2       NULL,
            created_at  DATETIME2       NOT NULL DEFAULT GETDATE(),
            updated_at  DATETIME2       NOT NULL DEFAULT GETDATE(),

            CONSTRAINT FK_password_reset_tokens_user    FOREIGN KEY (user_id)   REFERENCES users(id) ON DELETE CASCADE,
            CONSTRAINT UQ_password_reset_tokens_token   UNIQUE (token)
        );

        CREATE INDEX IX_password_reset_tokens_user_id   ON password_reset_tokens(user_id);
        CREATE INDEX IX_password_reset_tokens_token     ON password_reset_tokens(token);
        CREATE INDEX IX_password_reset_tokens_active
            ON password_reset_tokens(token, expires_at)
            WHERE is_used = 0;

        PRINT 'Created table: password_reset_tokens';
    END
    ELSE
    BEGIN
        PRINT 'Table password_reset_tokens already exists — skipping.';
    END

    -- --------------------------------------------------------
    -- 2. Update Schema Version
    -- --------------------------------------------------------

    INSERT INTO schema_version (version, description, applied_at)
    VALUES ('1.1', 'Add password_reset_tokens (REQ-001.9)', GETDATE());

    COMMIT TRANSACTION;
    PRINT '✅ Migration v1.0 → v1.1 applied successfully.';

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT '❌ Migration failed: ' + ERROR_MESSAGE();
    THROW;
END CATCH;
GO

-- ============================================================
-- ROLLBACK (Uncomment and run to reverse this migration)
-- ============================================================
/*
BEGIN TRANSACTION;
BEGIN TRY

    IF EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_NAME = 'password_reset_tokens'
    )
    BEGIN
        DROP TABLE password_reset_tokens;
        PRINT 'Dropped table: password_reset_tokens';
    END

    DELETE FROM schema_version WHERE version = '1.1';

    COMMIT TRANSACTION;
    PRINT '✅ Rollback v1.1 → v1.0 applied successfully.';

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT '❌ Rollback failed: ' + ERROR_MESSAGE();
    THROW;
END CATCH;
GO
*/

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
/*
-- Check current schema version
SELECT TOP 5 * FROM schema_version ORDER BY applied_at DESC;

-- Verify table exists
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'password_reset_tokens';

-- Verify columns
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'password_reset_tokens'
ORDER BY ORDINAL_POSITION;
*/
