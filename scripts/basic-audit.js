/**
 * Basic Accessibility and UX Audit Script
 * Checks for common accessibility issues
 */

import https from 'https';
import http from 'http';

const URL = 'http://localhost:5173/';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}${colors.bright}
╔════════════════════════════════════════════╗
║   InterpretReflect Basic Audit Tool        ║
║   Checking: ${URL}              ║
╚════════════════════════════════════════════╝
${colors.reset}`);

// Fetch the HTML content
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

// Audit checks
async function runAudit() {
  try {
    console.log(`${colors.blue}Fetching page content...${colors.reset}\n`);
    const html = await fetchHTML(URL);
    
    let passCount = 0;
    let failCount = 0;
    let warnCount = 0;
    
    const checks = [
      // Document structure
      {
        name: 'HTML lang attribute',
        test: () => html.includes('lang="en"') || html.includes("lang='en'"),
        category: 'Document'
      },
      {
        name: 'Viewport meta tag',
        test: () => html.includes('name="viewport"'),
        category: 'Document'
      },
      {
        name: 'Meta description',
        test: () => html.includes('name="description"'),
        category: 'SEO'
      },
      {
        name: 'Title tag',
        test: () => html.includes('<title>') && html.includes('</title>'),
        category: 'SEO'
      },
      
      // Accessibility
      {
        name: 'Skip to main content link',
        test: () => html.includes('Skip to main content') || html.includes('skip-link'),
        category: 'Accessibility'
      },
      {
        name: 'Main landmark',
        test: () => html.includes('role="main"') || html.includes('<main'),
        category: 'Accessibility'
      },
      {
        name: 'Navigation landmark',
        test: () => html.includes('role="navigation"') || html.includes('<nav'),
        category: 'Accessibility'
      },
      {
        name: 'Header landmark',
        test: () => html.includes('role="banner"') || html.includes('<header'),
        category: 'Accessibility'
      },
      {
        name: 'Footer landmark',
        test: () => html.includes('role="contentinfo"') || html.includes('<footer'),
        category: 'Accessibility'
      },
      
      // Favicon
      {
        name: 'Favicon SVG',
        test: () => html.includes('favicon.svg'),
        category: 'Branding'
      },
      {
        name: 'Apple touch icon',
        test: () => html.includes('apple-touch-icon'),
        category: 'Branding'
      },
      {
        name: 'Web manifest',
        test: () => html.includes('manifest'),
        category: 'PWA'
      },
      {
        name: 'Theme color',
        test: () => html.includes('name="theme-color"'),
        category: 'PWA'
      },
      
      // Open Graph
      {
        name: 'Open Graph title',
        test: () => html.includes('property="og:title"'),
        category: 'Social'
      },
      {
        name: 'Open Graph description',
        test: () => html.includes('property="og:description"'),
        category: 'Social'
      },
      {
        name: 'Twitter card',
        test: () => html.includes('name="twitter:card"'),
        category: 'Social'
      },
      
      // Components
      {
        name: 'Search functionality',
        test: () => html.includes('search') || html.includes('Search'),
        category: 'Components'
      },
      {
        name: 'Help widget',
        test: () => html.includes('help-widget') || html.includes('HelpWidget'),
        category: 'Components'
      },
      
      // Security
      {
        name: 'HTTPS recommendation',
        test: () => URL.startsWith('https://'),
        category: 'Security',
        warning: true
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
    Object.keys(categories).forEach(category => {
      console.log(`${colors.bright}${category} Checks:${colors.reset}`);
      console.log('─'.repeat(40));
      
      categories[category].forEach(check => {
        const passed = check.test();
        
        if (passed) {
          console.log(`${colors.green}✅ ${check.name}${colors.reset}`);
          passCount++;
        } else if (check.warning) {
          console.log(`${colors.yellow}⚠️  ${check.name}${colors.reset}`);
          warnCount++;
        } else {
          console.log(`${colors.red}❌ ${check.name}${colors.reset}`);
          failCount++;
        }
      });
      
      console.log('');
    });
    
    // Summary
    console.log(`${colors.cyan}${colors.bright}═══════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}Audit Summary:${colors.reset}`);
    console.log(`${colors.green}Passed: ${passCount}${colors.reset}`);
    console.log(`${colors.yellow}Warnings: ${warnCount}${colors.reset}`);
    console.log(`${colors.red}Failed: ${failCount}${colors.reset}`);
    
    const score = Math.round((passCount / checks.length) * 100);
    const scoreColor = score >= 80 ? colors.green : score >= 60 ? colors.yellow : colors.red;
    
    console.log(`\n${colors.bright}Overall Score: ${scoreColor}${score}%${colors.reset}`);
    
    // Recommendations
    if (failCount > 0) {
      console.log(`\n${colors.bright}Recommendations:${colors.reset}`);
      console.log('1. Review failed checks above');
      console.log('2. Ensure all accessibility landmarks are present');
      console.log('3. Add missing meta tags for SEO');
      console.log('4. Implement any missing components');
    }
    
    // Additional checks notice
    console.log(`\n${colors.cyan}Note: This is a basic audit. For comprehensive testing:${colors.reset}`);
    console.log('• Use Lighthouse in Chrome DevTools');
    console.log('• Test with screen readers (NVDA, JAWS)');
    console.log('• Run axe DevTools extension');
    console.log('• Test keyboard navigation manually');
    console.log('• Validate color contrast ratios');
    
  } catch (error) {
    console.error(`${colors.red}Error running audit: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run the audit
runAudit();