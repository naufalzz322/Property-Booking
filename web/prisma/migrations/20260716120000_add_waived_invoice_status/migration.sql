-- Migration: Add WAIVED invoice status
-- Date: 2026-07-16

-- Add WAIVED as a new value in the InvoiceStatus enum
-- PostgreSQL requires redefining the enum type to add a new value

-- First, add the new value (PostgreSQL allows this without recreating the type if using ALTER TYPE)
ALTER TYPE "InvoiceStatus" ADD VALUE IF NOT EXISTS 'WAIVED';
