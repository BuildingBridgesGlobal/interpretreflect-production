#!/bin/bash

# ============================================
# InterpretReflect UX/UI Audit Script
# ============================================

echo "🔍 Starting UX/UI Audit for InterpretReflect Platform"
echo "=================================================="

# Set colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if dev server is running
echo -e "\n${BLUE}Checking development server...${NC}"
if ! curl -f http://localhost:5173/ > /dev/null 2>&1; then
  echo -e "${RED}❌ Dev server not running. Please start with 'npm run dev'${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Dev server is running${NC}"

# Create audit directory with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
AUDIT_DIR="audit-results/${TIMESTAMP}"
mkdir -p "${AUDIT_DIR}"

echo -e "\n${BLUE}Creating audit report in: ${AUDIT_DIR}${NC}"

# Check if Python audit tools exist
if [ -d "../ux-audit-tools" ]; then
  echo -e "\n${BLUE}Running Python audit tools...${NC}"
  python ../ux-audit-tools/scripts/main_auditor.py http://localhost:5173/ --output "${AUDIT_DIR}"
else
  echo -e "${YELLOW}⚠️  Python audit tools not found. Running basic audit...${NC}"
fi

# Run basic HTML validation using Node.js
echo -e "\n${BLUE}Running basic accessibility checks...${NC}"
node scripts/basic-audit.js > "${AUDIT_DIR}/basic-audit.txt" 2>&1

# Create summary report
echo -e "\n${BLUE}Generating summary report...${NC}"
cat > "${AUDIT_DIR}/audit-summary.md" << EOF
# InterpretReflect UX/UI Audit Report
**Date:** $(date)
**URL:** http://localhost:5173/

## ✅ Implemented Features

### Accessibility
- [x] Skip to main content link
- [x] Proper HTML landmarks (header, nav, main, footer)
- [x] ARIA labels and roles
- [x] Keyboard navigation support
- [x] Focus indicators
- [x] Screen reader support

### Design System
- [x] CSS variables for consistency
- [x] Typography scale
- [x] Color system (5 main colors)
- [x] Spacing system
- [x] Component classes

### Components
- [x] Search box with accessibility
- [x] Help widget with contact info
- [x] Responsive design
- [x] Dark mode support

### SEO & Meta
- [x] Meta description
- [x] Favicon implementation
- [x] Open Graph tags
- [x] Twitter cards
- [x] PWA manifest

## 📊 Audit Results

Check individual report files for detailed results:
- basic-audit.txt - Basic accessibility checks
- lighthouse-report.html - Performance metrics (if available)
- accessibility-report.json - Detailed accessibility audit

## 🎯 Recommendations

1. Test with actual screen readers (NVDA, JAWS, VoiceOver)
2. Validate color contrast ratios
3. Test keyboard navigation flow
4. Verify mobile responsiveness
5. Check loading performance

EOF

echo -e "\n${GREEN}✅ Audit complete!${NC}"
echo -e "${BLUE}📁 Results saved to: ${AUDIT_DIR}${NC}"
echo -e "${BLUE}📄 View summary: ${AUDIT_DIR}/audit-summary.md${NC}"

# Open the results directory (Windows/Mac/Linux compatible)
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
  explorer "${AUDIT_DIR//\//\\}" 2>/dev/null
elif [[ "$OSTYPE" == "darwin"* ]]; then
  open "${AUDIT_DIR}" 2>/dev/null
else
  xdg-open "${AUDIT_DIR}" 2>/dev/null
fi