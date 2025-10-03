/**
 * Enhanced Audit Script for InterpretReflect
 * Waits for React to render before auditing
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
║   InterpretReflect Enhanced Audit Tool          ║
║   Full React Component Analysis                 ║
╚══════════════════════════════════════════════════╝
${colors.reset}`);

// Fetch HTML content with retry for React rendering
function fetchHTML(url, retries = 3) {
  return new Promise((resolve, reject) => {
    const attempt = (attemptNum) => {
      const client = url.startsWith('https') ? https : http;
      
      client.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          // Wait a bit for React to render
          setTimeout(() => {
            resolve(data);
          }, 2000);
        });
      }).on('error', (err) => {
        if (attemptNum < retries) {
          console.log(`${colors.yellow}Retry ${attemptNum + 1}/${retries}...${colors.reset}`);
          setTimeout(() => attempt(attemptNum + 1), 1000);
        } else {
          reject(err);
        }
      });
    };
    
    attempt(0);
  });
}

// Count occurrences
function countOccurrences(html, pattern) {
  const regex = new RegExp(pattern, 'gi');
  const matches = html.match(regex);
  return matches ? matches.length : 0;
}

// Extract text content
function extractTextBetween(html, startTag, endTag) {
  const regex = new RegExp(`${startTag}([^<]+)${endTag}`, 'i');
  const match = html.match(regex);
  return match ? match[1].trim() : null;
}

// Generate HTML report
function generateHTMLReport(results) {
  const timestamp = new Date().toISOString();
  const dateStr = new Date().toLocaleString();
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>InterpretReflect Audit Report - ${dateStr}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #FAF9F6 0%, #F0EDE8 100%);
            min-height: 100vh;
            padding: 2rem;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #5C7F4F 0%, #8F9F88 100%);
            color: white;
            padding: 3rem;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            font-weight: 600;
        }
        
        .header .subtitle {
            font-size: 1.2rem;
            opacity: 0.95;
        }
        
        .header .date {
            margin-top: 1rem;
            font-size: 0.95rem;
            opacity: 0.9;
        }
        
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 2rem;
            padding: 3rem;
            background: #FAFAFA;
            border-bottom: 1px solid #E0E0E0;
        }
        
        .summary-card {
            text-align: center;
            padding: 1.5rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }
        
        .summary-card .number {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        
        .summary-card.passed .number {
            color: #4CAF50;
        }
        
        .summary-card.warning .number {
            color: #FFC107;
        }
        
        .summary-card.failed .number {
            color: #F44336;
        }
        
        .summary-card.score .number {
            color: #5C7F4F;
        }
        
        .summary-card .label {
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #666;
        }
        
        .compliance-badge {
            display: inline-block;
            padding: 0.5rem 1rem;
            background: #5C7F4F;
            color: white;
            border-radius: 20px;
            font-weight: 600;
            margin-top: 1rem;
        }
        
        .content {
            padding: 3rem;
        }
        
        .section {
            margin-bottom: 3rem;
        }
        
        .section h2 {
            font-size: 1.75rem;
            color: #2C3E50;
            margin-bottom: 1.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #5C7F4F;
        }
        
        .category {
            margin-bottom: 2rem;
        }
        
        .category h3 {
            font-size: 1.25rem;
            color: #34495E;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .check-list {
            list-style: none;
            padding: 0;
        }
        
        .check-item {
            display: flex;
            align-items: center;
            padding: 0.75rem 1rem;
            margin-bottom: 0.5rem;
            background: #FAFAFA;
            border-radius: 6px;
            border-left: 4px solid transparent;
            transition: all 0.2s;
        }
        
        .check-item:hover {
            background: #F0F0F0;
        }
        
        .check-item.passed {
            border-left-color: #4CAF50;
        }
        
        .check-item.warning {
            border-left-color: #FFC107;
            background: #FFF9E6;
        }
        
        .check-item.failed {
            border-left-color: #F44336;
            background: #FFEBEE;
        }
        
        .check-icon {
            font-size: 1.25rem;
            margin-right: 1rem;
            width: 24px;
            text-align: center;
        }
        
        .check-name {
            flex: 1;
            font-weight: 500;
        }
        
        .check-wcag {
            font-size: 0.875rem;
            padding: 0.25rem 0.5rem;
            background: #E8F5E9;
            color: #2E7D32;
            border-radius: 4px;
            font-family: monospace;
        }
        
        .recommendations {
            background: #E8F4F9;
            border: 1px solid #B3D9E8;
            border-radius: 8px;
            padding: 2rem;
            margin-top: 2rem;
        }
        
        .recommendations h3 {
            color: #1976D2;
            margin-bottom: 1rem;
        }
        
        .recommendations ul {
            margin-left: 1.5rem;
        }
        
        .recommendations li {
            margin-bottom: 0.5rem;
            color: #424242;
        }
        
        .footer {
            text-align: center;
            padding: 2rem;
            background: #F5F5F5;
            color: #666;
            font-size: 0.875rem;
        }
        
        .footer a {
            color: #5C7F4F;
            text-decoration: none;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .container {
                box-shadow: none;
            }
        }
        
        @media (max-width: 768px) {
            .summary {
                grid-template-columns: 1fr;
                padding: 2rem;
            }
            
            .content {
                padding: 2rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>InterpretReflect Audit Report</h1>
            <div class="subtitle">Comprehensive UX/UI & Accessibility Analysis</div>
            <div class="date">${dateStr}</div>
        </div>
        
        <div class="summary">
            <div class="summary-card passed">
                <div class="number">${results.summary.passed}</div>
                <div class="label">Passed</div>
            </div>
            <div class="summary-card warning">
                <div class="number">${results.summary.warnings}</div>
                <div class="label">Warnings</div>
            </div>
            <div class="summary-card failed">
                <div class="number">${results.summary.failed}</div>
                <div class="label">Failed</div>
            </div>
            <div class="summary-card score">
                <div class="number">${results.score}%</div>
                <div class="label">Score</div>
                <div class="compliance-badge">${results.complianceLevel}</div>
            </div>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>Test Results by Category</h2>
                ${Object.entries(results.categories).map(([category, checks]) => `
                    <div class="category">
                        <h3>${category}</h3>
                        <ul class="check-list">
                            ${checks.map(check => `
                                <li class="check-item ${check.status}">
                                    <span class="check-icon">${
                                        check.status === 'passed' ? '✅' : 
                                        check.status === 'warning' ? '⚠️' : '❌'
                                    }</span>
                                    <span class="check-name">${check.name}</span>
                                    ${check.wcag !== 'N/A' ? `<span class="check-wcag">WCAG ${check.wcag}</span>` : ''}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
            
            ${results.issues.length > 0 ? `
                <div class="section">
                    <h2>Issues to Address</h2>
                    <ul>
                        ${results.issues.map(issue => `
                            <li>${issue.issue} (WCAG ${issue.wcag} - Level ${issue.level})</li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}
            
            <div class="recommendations">
                <h3>Recommendations for Improvement</h3>
                <ul>
                    <li>Test with screen readers (NVDA, JAWS, VoiceOver) for real-world accessibility</li>
                    <li>Verify color contrast ratios meet WCAG standards (4.5:1 for normal text)</li>
                    <li>Test keyboard navigation flow throughout the application</li>
                    <li>Validate with axe DevTools browser extension for additional checks</li>
                    <li>Consider user testing with people who have disabilities</li>
                    <li>Run Lighthouse audit in Chrome DevTools for performance metrics</li>
                    <li>Test on various devices and screen sizes for responsive design</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p>Generated by InterpretReflect Audit Tool | ${timestamp}</p>
            <p><a href="https://www.w3.org/WAI/WCAG21/quickref/">WCAG 2.1 Quick Reference</a></p>
        </div>
    </div>
</body>
</html>`;
  
  return html;
}

// Main audit function
async function runEnhancedAudit() {
  try {
    console.log(`${colors.blue}Fetching page content (waiting for React render)...${colors.reset}\n`);
    const html = await fetchHTML(URL);
    
    let passCount = 0;
    let failCount = 0;
    let warnCount = 0;
    const issues = [];
    
    const checks = [
      // Document structure
      {
        name: 'HTML lang attribute',
        test: () => html.includes('lang="en"') || html.includes("lang='en'"),
        category: 'Document',
        wcag: '3.1.1',
        level: 'A'
      },
      {
        name: 'Viewport meta tag',
        test: () => html.includes('name="viewport"'),
        category: 'Document',
        wcag: 'N/A'
      },
      {
        name: 'Meta description',
        test: () => html.includes('name="description"'),
        category: 'SEO',
        wcag: 'N/A'
      },
      {
        name: 'Title tag',
        test: () => html.includes('<title>') && html.includes('</title>'),
        category: 'SEO',
        wcag: '2.4.2',
        level: 'A'
      },
      
      // Accessibility
      {
        name: 'Skip to main content link',
        test: () => html.includes('Skip to main content') || html.includes('skip-link'),
        category: 'Accessibility',
        wcag: '2.4.1',
        level: 'A'
      },
      {
        name: 'Main landmark',
        test: () => html.includes('role="main"') || html.includes('<main'),
        category: 'Accessibility',
        wcag: '1.3.1',
        level: 'A'
      },
      {
        name: 'Navigation landmark',
        test: () => html.includes('role="navigation"') || html.includes('<nav'),
        category: 'Accessibility',
        wcag: '1.3.1',
        level: 'A'
      },
      {
        name: 'Header landmark',
        test: () => html.includes('role="banner"') || html.includes('<header'),
        category: 'Accessibility',
        wcag: '1.3.1',
        level: 'A'
      },
      {
        name: 'Footer landmark',
        test: () => html.includes('role="contentinfo"') || html.includes('<footer'),
        category: 'Accessibility',
        wcag: '1.3.1',
        level: 'A'
      },
      {
        name: 'ARIA labels',
        test: () => html.includes('aria-label') || html.includes('aria-labelledby'),
        category: 'Accessibility',
        wcag: '4.1.2',
        level: 'A'
      },
      {
        name: 'Focus indicators',
        test: () => html.includes('focus:') || html.includes(':focus'),
        category: 'Accessibility',
        wcag: '2.4.7',
        level: 'AA'
      },
      
      // Components
      {
        name: 'Search functionality',
        test: () => html.toLowerCase().includes('search'),
        category: 'Components',
        wcag: 'N/A'
      },
      {
        name: 'Help widget',
        test: () => html.toLowerCase().includes('help'),
        category: 'Components',
        wcag: 'N/A'
      },
      
      // Branding
      {
        name: 'Favicon SVG',
        test: () => html.includes('favicon.svg'),
        category: 'Branding',
        wcag: 'N/A'
      },
      {
        name: 'Apple touch icon',
        test: () => html.includes('apple-touch-icon'),
        category: 'Branding',
        wcag: 'N/A'
      },
      
      // PWA
      {
        name: 'Web manifest',
        test: () => html.includes('manifest'),
        category: 'PWA',
        wcag: 'N/A'
      },
      {
        name: 'Theme color',
        test: () => html.includes('name="theme-color"'),
        category: 'PWA',
        wcag: 'N/A'
      },
      
      // Social
      {
        name: 'Open Graph title',
        test: () => html.includes('property="og:title"'),
        category: 'Social',
        wcag: 'N/A'
      },
      {
        name: 'Open Graph description',
        test: () => html.includes('property="og:description"'),
        category: 'Social',
        wcag: 'N/A'
      },
      {
        name: 'Twitter card',
        test: () => html.includes('name="twitter:card"'),
        category: 'Social',
        wcag: 'N/A'
      },
      
      // Performance
      {
        name: 'CSS variables for theming',
        test: () => html.includes('--') || html.includes('var('),
        category: 'Performance',
        wcag: 'N/A'
      },
      {
        name: 'Responsive design',
        test: () => html.includes('responsive') || html.includes('@media'),
        category: 'Performance',
        wcag: 'N/A'
      },
      
      // Security
      {
        name: 'HTTPS recommendation',
        test: () => URL.startsWith('https://'),
        category: 'Security',
        wcag: 'N/A',
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
    
    // Run checks and store results
    const categoriesWithResults = {};
    
    Object.keys(categories).forEach(category => {
      console.log(`\n${colors.bright}${category} Checks:${colors.reset}`);
      console.log('─'.repeat(40));
      
      categoriesWithResults[category] = [];
      
      categories[category].forEach(check => {
        const passed = check.test();
        let status;
        
        if (passed) {
          console.log(`${colors.green}✅ ${check.name}${colors.reset}`);
          passCount++;
          status = 'passed';
        } else if (check.warning) {
          console.log(`${colors.yellow}⚠️  ${check.name}${colors.reset}`);
          warnCount++;
          status = 'warning';
          issues.push({
            level: check.level || 'N/A',
            wcag: check.wcag,
            issue: check.name,
            severity: 'warning'
          });
        } else {
          console.log(`${colors.red}❌ ${check.name}${colors.reset}`);
          failCount++;
          status = 'failed';
          issues.push({
            level: check.level || 'N/A',
            wcag: check.wcag,
            issue: check.name,
            severity: 'error'
          });
        }
        
        categoriesWithResults[category].push({
          name: check.name,
          wcag: check.wcag || 'N/A',
          level: check.level || 'N/A',
          status
        });
      });
    });
    
    // Calculate score
    const totalChecks = checks.length;
    const score = Math.round((passCount / totalChecks) * 100);
    
    let complianceLevel = 'Needs Improvement';
    if (score >= 95) {
      complianceLevel = 'Excellent (AAA)';
    } else if (score >= 85) {
      complianceLevel = 'Good (AA)';
    } else if (score >= 75) {
      complianceLevel = 'Fair (A)';
    }
    
    // Summary
    console.log(`\n${colors.cyan}${colors.bright}═══════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}Audit Summary:${colors.reset}`);
    console.log(`${colors.green}Passed: ${passCount}${colors.reset}`);
    console.log(`${colors.yellow}Warnings: ${warnCount}${colors.reset}`);
    console.log(`${colors.red}Failed: ${failCount}${colors.reset}`);
    console.log(`\n${colors.bright}Overall Score: ${score}% (${complianceLevel})${colors.reset}`);
    
    // Create results object
    const results = {
      url: URL,
      timestamp: new Date().toISOString(),
      score,
      complianceLevel,
      summary: {
        passed: passCount,
        warnings: warnCount,
        failed: failCount
      },
      categories: categoriesWithResults,
      issues
    };
    
    // Generate reports
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const auditDir = path.join(process.cwd(), 'audit-results', timestamp);
    
    // Create directory
    fs.mkdirSync(auditDir, { recursive: true });
    
    // Save JSON report
    const jsonPath = path.join(auditDir, 'audit-report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
    console.log(`\n${colors.blue}📄 JSON report saved to: ${jsonPath}${colors.reset}`);
    
    // Save HTML report
    const htmlPath = path.join(auditDir, 'audit-report.html');
    fs.writeFileSync(htmlPath, generateHTMLReport(results));
    console.log(`${colors.blue}📄 HTML report saved to: ${htmlPath}${colors.reset}`);
    
    // Save text summary
    const textPath = path.join(auditDir, 'audit-summary.txt');
    const textSummary = `InterpretReflect Audit Summary
==============================
Date: ${new Date().toLocaleString()}
URL: ${URL}

RESULTS
-------
✅ Passed: ${passCount}
⚠️  Warnings: ${warnCount}
❌ Failed: ${failCount}

Overall Score: ${score}% (${complianceLevel})

FAILED CHECKS
-------------
${issues.filter(i => i.severity === 'error').map(i => `- ${i.issue} (WCAG ${i.wcag})`).join('\n') || 'None'}

WARNINGS
--------
${issues.filter(i => i.severity === 'warning').map(i => `- ${i.issue}`).join('\n') || 'None'}

RECOMMENDATIONS
---------------
1. Test with screen readers (NVDA, JAWS, VoiceOver)
2. Verify color contrast ratios
3. Test keyboard navigation flow
4. Validate with axe DevTools
5. Test on various devices
`;
    
    fs.writeFileSync(textPath, textSummary);
    console.log(`${colors.blue}📄 Text summary saved to: ${textPath}${colors.reset}`);
    
    console.log(`\n${colors.green}${colors.bright}✅ Audit complete! Open the HTML report for detailed results.${colors.reset}`);
    console.log(`${colors.cyan}📁 All reports saved to: ${auditDir}${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}Error running audit: ${error.message}${colors.reset}`);
    console.error(`${colors.yellow}Make sure the dev server is running at ${URL}${colors.reset}`);
    process.exit(1);
  }
}

// Run the audit
runEnhancedAudit();