import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Helper to recursively read all 'page.tsx' files in the app directory
function getRoutes(dir: string, baseRoute = ''): { path: string, description: string }[] {
    let results: { path: string, description: string }[] = [];

    try {
        const list = fs.readdirSync(dir);

        list.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat && stat.isDirectory()) {
                // Skip api directory, components, layouts, etc
                if (file === 'api' || file.startsWith('_') || file.startsWith('.')) return;

                // Recursively read subdirectories
                // For the root app/ dir, the baseRoute starts empty
                const nextBaseRoute = baseRoute === '' ? `/${file}` : `${baseRoute}/${file}`;
                results = results.concat(getRoutes(filePath, nextBaseRoute));
            } else {
                // If it's a page file, add it to our routes
                if (file === 'page.tsx' || file === 'page.jsx' || file === 'page.js') {
                    // If baseRoute is empty, it's the root '/' page
                    const routePath = baseRoute === '' ? '/' : baseRoute;

                    let desc = "Application page";
                    // Generate a basic description based on the path
                    if (routePath === '/') {
                        desc = "Home page / Overview";
                    } else {
                        // make it nice e.g. /dashboard -> Dashboard page
                        const segments = routePath.split('/');
                        const lastSegment = segments[segments.length - 1];
                        if (lastSegment.startsWith('[') && lastSegment.endsWith(']')) {
                            desc = `Dynamic ${lastSegment.replace('[', '').replace(']', '')} page`;
                        } else {
                            desc = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1) + " page";
                        }
                    }

                    results.push({ path: routePath, description: desc });
                }
            }
        });
    } catch (error) {
        console.error("Error reading routes:", error);
    }

    return results;
}

export async function GET() {
    const appDir = path.join(process.cwd(), 'src', 'app');
    // Root page is actually found in the base dir without a folder name
    const rootRoutes = getRoutes(appDir);
    return NextResponse.json(rootRoutes);
}
