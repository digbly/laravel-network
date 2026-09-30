/* eslint-disable @typescript-eslint/no-explicit-any */

const corePages = import.meta.glob<any>('../Pages/**/*.{tsx,jsx}');

const modulePages = import.meta.glob<any>('../../../modules/*/resources/views/**/*.{tsx,jsx}');

const modulePattern = /^\.\.\/\.\.\/\.\.\/modules\/([^/]+)\/resources\/views\/(.+)\.(tsx|jsx)$/;

/**
 * Resolve an Inertia page component.
 *
 * Supported names:
 * - "Admin::dashboard/Index" -> modules/Admin/resources/views/dashboard/Index.tsx
 * - "Auth/Login"             -> resources/js/Pages/Auth/Login.tsx
 */
export function resolvePage(name: string): () => Promise<any> {
    if (name.includes('::')) {
        const [namespace, page] = name.split('::');
        const normalized = page.replace(/\./g, '/');

        const match = Object.entries(modulePages).find(([key]) => {
            const found = key.match(modulePattern);

            if (!found) {
                return false;
            }

            return (
                found[1].toLowerCase() === namespace.toLowerCase() &&
                found[2] === normalized
            );
        });

        if (!match) {
            throw new Error(
                `Inertia page not found for "${name}" (modules/${namespace}/resources/views/${normalized}.tsx)`
            );
        }

        return match[1];
    }

    const normalized = name.replace(/\./g, '/');
    const tsx = `../Pages/${normalized}.tsx`;
    const jsx = `../Pages/${normalized}.jsx`;

    if (corePages[tsx]) {
        return corePages[tsx];
    }

    if (corePages[jsx]) {
        return corePages[jsx];
    }

    throw new Error(
        `Inertia page not found for "${name}" (resources/js/Pages/${normalized}.tsx)`
    );
}

export default resolvePage;
