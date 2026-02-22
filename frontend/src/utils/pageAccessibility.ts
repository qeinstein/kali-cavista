/**
 * Utility functions for extracting page content for accessibility
 * Used by VoiceNavigator to provide context to the AI assistant
 */

export interface PageContext {
  page_name: string;
  path: string;
  content_summary: string;
  available_actions: string[];
  headings: string[];
  buttons: string[];
  links: string[];
  images: string[];
  forms: string[];
}

export function extractPageContext(): PageContext {
  const path = window.location.pathname;
  const pageName = path === '/' ? 'Home' : path.split('/').pop() || 'Unknown';
  
  // Get main content area
  const mainContent = document.querySelector('main') || document.body;
  
  // Extract headings
  const headings = Array.from(mainContent.querySelectorAll('h1, h2, h3, h4, h5, h6'))
    .map(h => h.textContent?.trim())
    .filter(Boolean) as string[];
  
  // Extract buttons
  const buttons = Array.from(mainContent.querySelectorAll('button, [role="button"]'))
    .map(b => b.textContent?.trim())
    .filter(Boolean) as string[];
  
  // Extract links
  const links = Array.from(mainContent.querySelectorAll('a[href]'))
    .map(a => a.textContent?.trim() || a.getAttribute('aria-label') || a.getAttribute('href'))
    .filter(Boolean) as string[];
  
  // Extract images with alt text
  const images = Array.from(mainContent.querySelectorAll('img[alt]'))
    .map(img => img.getAttribute('alt') || 'Image')
    .filter(Boolean) as string[];
  
  // Extract form inputs
  const forms = Array.from(mainContent.querySelectorAll('input, select, textarea'))
    .map(input => {
      const label = input.getAttribute('aria-label') || 
                   input.getAttribute('placeholder') || 
                   input.getAttribute('name') || 
                   input.getAttribute('id') || 
                   'Input field';
      return label;
    })
    .filter(Boolean) as string[];
  
  // Generate content summary
  let contentSummary = "";
  if (headings.length > 0) {
    contentSummary += `Page has headings: ${headings.slice(0, 3).join(', ')}. `;
  }
  if (buttons.length > 0) {
    contentSummary += `Available buttons: ${buttons.slice(0, 5).join(', ')}. `;
  }
  if (links.length > 0) {
    contentSummary += `Available links: ${links.slice(0, 3).join(', ')}. `;
  }
  if (forms.length > 0) {
    contentSummary += `Form inputs: ${forms.slice(0, 3).join(', ')}. `;
  }
  
  if (!contentSummary) {
    contentSummary = "Content loading or not available.";
  }
  
  // Extract available actions (combining buttons and links)
  const availableActions = [...buttons, ...links].slice(0, 10);
  
  return {
    page_name: pageName,
    path: path,
    content_summary: contentSummary,
    available_actions: availableActions,
    headings: headings,
    buttons: buttons,
    links: links,
    images: images,
    forms: forms
  };
}

export function extractAvailableActions(): string[] {
  const mainContent = document.querySelector('main') || document.body;
  const buttons = Array.from(mainContent.querySelectorAll('button, [role="button"]'))
    .map(b => b.textContent?.trim())
    .filter(Boolean) as string[];
  const links = Array.from(mainContent.querySelectorAll('a[href]'))
    .map(a => a.textContent?.trim() || a.getAttribute('aria-label') || a.getAttribute('href'))
    .filter(Boolean) as string[];
  
  return [...buttons, ...links].slice(0, 10);
}

export function getPageDescription(pageName: string, context: PageContext): string {
  const descriptions: Record<string, string> = {
    'Home': 'The main dashboard showing your health overview and quick actions.',
    'chat': 'A chat interface where you can ask questions and get health advice.',
    'insights': 'Your health insights and patterns analysis page.',
    'log': 'A page for logging meals, water intake, and other health data.',
    'dashboard': 'Your main dashboard with health metrics and statistics.',
    'settings': 'Settings page for configuring your preferences.',
    'profile': 'Your profile page with personal information and health goals.',
  };
  
  return descriptions[pageName] || `The ${pageName} page with relevant health information and actions.`;
}