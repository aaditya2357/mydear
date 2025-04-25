#!/usr/bin/env bash
# Exit on error
set -o errexit

# Build the project
npm install
npm run build

# Set up database schema
npm run db:push

# Seed initial data if needed
npm run db:seed