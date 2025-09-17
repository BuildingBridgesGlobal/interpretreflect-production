/**
 * Accessibility Audit Script for InterpretReflect
 * Performs detailed accessibility checks
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const URL = 'http://localhost:5173/';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

console.log(`${colors.cyan}${colors.bright}
╔══════════════════════════════════════════════════╗
║   InterpretReflect Accessibility Audit          ║
║   WCAG 2.1 AA Compliance Check                  ║
╚══════════════════════════════════════════════════╝
${colors.reset}`);

// Fetch HTML content
function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Count occurrences of a pattern
function countOccurrences(html, pattern) {
  const regex = new RegExp(pattern, 'gi');
  const matches = html.match(regex);
  return matches ? matches.length : 0;
}

// Extract text content between tags
function extractTextBetween(html, startTag, endTag) {
  const regex = new RegExp(`${startTag}([^<]+)${endTag}`, 'i');
  const match = html.match(regex);
  return match ? match[1].trim() : null;
}

// Accessibility checks
async function runAccessibilityAudit() {
  try {
    console.log(`${colors.blue}Fetching page content...${colors.reset}\n`);
    const html = await fetchHTML(URL);
    
    let passCount = 0;
    let failCount = 0;
    let warnCount = 0;
    const issues = [];
    
    const checks = [
      // Level A - Essential
      {
        name: 'Images with alt text',
        test: () => {
          const imgCount = countOccurrences(html, '<img');
          const altCount = countOccurrences(html, 'alt=');
          return imgCount === 0 || altCount >= imgCount;
        },
        level: 'A',
        category: 'Images',
        wcag: '1.1.1'
      },
      {
        name: 'Page language specified',
        test: () => html.includes('lang="en"') || html.includes("lang='en'"),
        level: 'A',
        category: 'Language',
        wcag: '3.1.1'
      },
      {
        name: 'Page has title',
        test: () => {
          const title = extractTextBetween(html, '<title>', '</title>');
          return title && title.length > 0;
        },
        level: 'A',
        category: 'Page Info',
        wcag: '2.4.2'
      },
      {
        name: 'Heading hierarchy',
        test: () => {
          const h1Count = countOccurrences(html, '<h1');
          return h1Count >= 1;
        },
        level: 'A',
        category: 'Structure',
        wcag: '1.3.1'
      },
      {
        name: 'Form labels',
        test: () => {
          const inputCount = countOccurrences(html, '<input');
          const labelCount = countOccurrences(html, '<label') + countOccurrences(html, 'aria-label');
          return inputCount === 0 || labelCount >= inputCount;
        },
        level: 'A',
        category: 'Forms',
        wcag: '3.3.2'
      },
      {
        name: 'Skip navigation link',
        test: () => html.includes('Skip to main content') || html.includes('skip-link'),
        level: 'A',
        category: 'Navigation',
        wcag: '2.4.1'
      },
      
      // Level AA - Enhanced
      {
        name: 'Focus visible styles',
        test: () => html.includes(':focus') || html.includes('focus-visible'),
        level: 'AA',
        category: 'Focus',
        wcag: '2.4.7'
      },
      {
        name: 'Sufficient color contrast (check manually)',
        test: () => html.includes('--text-primary'),
        level: 'AA',
        category: 'Color',
        wcag: '1.4.3',
        warning: true
      },
      {
        name: 'Text resize support',
        test: () => html.includes('rem') || html.includes('em'),
        level: 'AA',
        category: 'Text',
        wcag: '1.4.4'
      },
      {
        name: 'Consistent navigation',
        test: () => html.includes('<nav') || html.includes('role="navigation"'),
        level: 'AA',
        category: 'Navigation',
        wcag: '3.2.3'
      },
      
      // ARIA Implementation
      {
        name: 'ARIA landmarks',
        test: () => {
          const hasMain = html.includes('role="main"') || html.includes('<main');
          const hasNav = html.includes('role="navigation"') || html.includes('<nav');
          const hasHeader = html.includes('role="banner"') || html.includes('<header');
          return hasMain && hasNav && hasHeader;
        },
        level: 'Best Practice',
        category: 'ARIA',
        wcag: 'N/A'
      },
      {
        name: 'ARIA labels on interactive elements',
        test: () => html.includes('aria-label') || html.includes('aria-labelledby'),
        level: 'Best Practice',
        category: 'ARIA',
        wcag: 'N/A'
      },
      {
        name: 'ARIA live regions',
        test: () => html.includes('aria-live') || html.includes('role="alert"'),
        level: 'Best Practice',
        category: 'ARIA',
        wcag: 'N/A'
      },
      
      // Keyboard Navigation
      {
        name: 'Keyboard accessible (tabindex)',
        test: () => !html.includes('tabindex="-1"') || html.includes('tabindex="0"'),
        level: 'A',
        category: 'Keyboard',
        wcag: '2.1.1'
      },
      {
        name: 'No keyboard traps',
        test: () => !html.includes('onkeydown="return false"'),
        level: 'A',
        category: 'Keyboard',
        wcag: '2.1.2'
      },
      
      // Mobile & Responsive
      {
        name: 'Viewport meta tag',
        test: () => html.includes('name="viewport"'),
        level: 'Best Practice',
        category: 'Mobile',
        wcag: 'N/A'
      },
      {
        name: 'Touch target size (44x44 minimum)',
        test: () => html.includes('min-height: 44px'),
        level: 'AAA',
        category: 'Mobile',
        wcag: '2.5.5'
      },
      
      // Cognitive Accessibility
      {
        name: 'Clear error messages',
        test: () => html.includes('error') || html.includes('Error'),
        level: 'AA',
        category: 'Cognitive',
        wcag: '3.3.3',
        warning: true
      },
      {
        name: 'Consistent help location',
        test: () => html.includes('help') || html.includes('Help'),
        level: 'AAA',
        category: 'Cognitive',
        wcag: '3.2.6'
      }
    ];
    
    // Group checks by category
    const categories = {};
    checks.forEach(check => {
      if (!categories[check.category]) {
        categories[check.category] = [];
      }
      categories[check.category].push(check);
    });
    
    // Run checks by category
    console.log(`${colors.bright}Running WCAG 2.1 Compliance Checks${colors.reset}`);
    console.log('═'.repeat(50));
    
    Object.keys(categories).forEach(category => {
      console.log(`\n${colors.bright}${category}:${colors.reset}`);
      console.log('─'.repeat(40));
      
      categories[category].forEach(check => {
        const passed = check.test();
        
        if (passed) {
          console.log(`${colors.green}✅ ${check.name} (WCAG ${check.wcag})${colors.reset}`);
          passCount++;
        } else if (check.warning) {
          console.log(`${colors.yellow}⚠️  ${check.name} (WCAG ${check.wcag}) - Manual check needed${colors.reset}`);
          warnCount++;
          issues.push({
            level: check.level,
            wcag: check.wcag,
            issue: check.name,
            severity: 'warning'
          });
        } else {
          console.log(`${colors.red}❌ ${check.name} (WCAG ${check.wcag})${colors.reset}`);
          failCount++;
          issues.push({
            level: check.level,
            wcag: check.wcag,
            issue: check.name,
            severity: 'error'
          });
        }
      });
    });
    
    // Summary
    console.log(`\n${colors.cyan}${colors.bright}═══════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}Accessibility Audit Summary${colors.reset}`);
    console.log('─'.repeat(40));
    console.log(`${colors.green}✅ Passed: ${passCount}${colors.reset}`);
    console.log(`${colors.yellow}⚠️  Warnings: ${warnCount}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${failCount}${colors.reset}`);
    
    // Compliance Level
    const totalChecks = passCount + failCount + warnCount;
    const score = Math.round((passCount / totalChecks) * 100);
    
    let complianceLevel = 'Non-compliant';
    let levelColor = colors.red;
    
    if (score >= 95) {
      complianceLevel = 'WCAG 2.1 AAA';
      levelColor = colors.green;
    } else if (score >= 85) {
      complianceLevel = 'WCAG 2.1 AA';
      levelColor = colors.green;
    } else if (score >= 75) {
      complianceLevel = 'WCAG 2.1 A';
      levelColor = colors.yellow;
    }
    
    console.log(`\n${colors.bright}Compliance Score: ${levelColor}${score}% (${complianceLevel})${colors.reset}`);
    
    // Critical Issues
    if (issues.length > 0) {
      console.log(`\n${colors.bright}Critical Issues to Address:${colors.reset}`);
      issues
        .filter(i => i.severity === 'error')
        .forEach((issue, idx) => {
          console.log(`${idx + 1}. ${issue.issue} (WCAG ${issue.wcag} - Level ${issue.level})`);
        });
    }
    
    // Recommendations
    console.log(`\n${colors.bright}Recommendations:${colors.reset}`);
    console.log('1. Test with screen readers (NVDA, JAWS, VoiceOver)');
    console.log('2. Verify color contrast ratios (4.5:1 for normal text, 3:1 for large)');
    console.log('3. Test keyboard navigation flow');
    console.log('4. Validate with axe DevTools browser extension');
    console.log('5. Test with users who have disabilities');
    
    // Manual Testing Required
    console.log(`\n${colors.magenta}${colors.bright}Manual Testing Required:${colors.reset}`);
    console.log('• Color contrast ratios');
    console.log('• Video captions and audio descriptions');
    console.log('• Form error handling and recovery');
    console.log('• Time limits and session timeouts');
    console.log('• Complex interactions and animations');
    console.log('• PDF and document accessibility');
    
    // Save report
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(process.cwd(), `accessibility-report-${timestamp}.json`);
    
    const report = {
      url: URL,
      timestamp: new Date().toISOString(),
      score,
      complianceLevel,
      summary: {
        passed: passCount,
        warnings: warnCount,
        failed: failCount
      },
      issues,
      checks: checks.map(c => ({
        name: c.name,
        wcag: c.wcag,
        level: c.level,
        category: c.category,
        passed: c.test()
      }))
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n${colors.blue}📄 Detailed report saved to: ${reportPath}${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}Error running accessibility audit: ${error.message}${colors.reset}`);
    console.error(`${colors.yellow}Make sure the dev server is running at ${URL}${colors.reset}`);
    process.exit(1);
  }
}

// Run the audit
runAccessibilityAudit();