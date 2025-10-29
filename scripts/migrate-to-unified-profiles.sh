#!/bin/bash

# Script to help migrate from user_profiles to profiles table
# This finds all references and helps you update them

echo "========================================="
echo "MIGRATE TO UNIFIED PROFILES TABLE"
echo "========================================="
echo ""

echo "Finding all references to 'user_profiles' table..."
echo ""

# Find all TypeScript/TSX files that reference user_profiles
grep -r "\.from('user_profiles')" src/ --include="*.ts" --include="*.tsx" -n

echo ""
echo "========================================="
echo "SUMMARY"
echo "========================================="
echo ""
echo "Files that need updating:"
grep -r "\.from('user_profiles')" src/ --include="*.ts" --include="*.tsx" -l | wc -l

echo ""
echo "Next steps:"
echo "1. Review the files listed above"
echo "2. Change .from('user_profiles') to .from('profiles')"
echo "3. Update any column references if needed"
echo "4. Test each component after updating"
echo ""
echo "Note: The 'profiles' table now has ALL columns from both tables"
echo "========================================="
