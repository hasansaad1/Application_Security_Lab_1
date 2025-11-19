-- Migration: Remove role column from Users table
-- This script removes the unused role column from the Users table

USE homigo;

ALTER TABLE Users DROP COLUMN role;

