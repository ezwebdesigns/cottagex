// Utils index
// Paste your Base44 code here.
export function createPageUrl(pageName: string) {
    return '/' + pageName.replace(/ /g, '-');
}