import fs from "node:fs";
import path from "node:path";

export interface FileAttachment {
    path: string;
    name: string;
    content: string;
    isImage: boolean;
}

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];

export function isFilePath(text: string): boolean {
    const cleaned = text.trim().replace(/^['"]|['"]$/g, '');

    if (!cleaned.startsWith('/') && !cleaned.startsWith('~/') && !cleaned.startsWith('./')) return false;

    const expanded = cleaned.startsWith('~') ? cleaned.replace('~', process.env.HOME || '') : cleaned;

    try {
        return fs.existsSync(expanded) && fs.statSync(expanded).isFile();
    } catch {
        return false;
    }
}

export function parseFileAttachment(text: string): FileAttachment | null {
    const cleaned = text.trim().replace(/^['"]|['"]$/g, '');

    const expanded = cleaned.startsWith('~')
        ? cleaned.replace('~', process.env.HOME || '')
        : cleaned;

    if (!isFilePath(cleaned)) return null;

    try {
        const ext = path.extname(expanded).toLowerCase();
        const isImage = IMAGE_EXTENSIONS.includes(ext);

        let content: string;
        if (isImage) {
            const buffer = fs.readFileSync(expanded);
            content = buffer.toString('base64');
        } else {
            content = fs.readFileSync(expanded, 'utf-8');
        }

        return {
            path: expanded,
            name: path.basename(expanded),
            content,
            isImage
        };
    } catch {
        return null;
    }
}

export function parseFileMentions(input: string, cwd: string): { cleanedInput: string; attachments: FileAttachment[] } {
    const mentions = input.match(/@([^\s]+)/g);
    const attachments: FileAttachment[] = [];
    let cleanedInput = input;

    if (!mentions) return { cleanedInput, attachments };

    for (const mention of mentions) {
        const relativePath = mention.slice(1);
        const fullPath = path.resolve(cwd, relativePath);

        try {
            if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
                const ext = path.extname(fullPath).toLowerCase();
                const isImage = IMAGE_EXTENSIONS.includes(ext);

                let content: string;
                if (isImage) {
                    content = fs.readFileSync(fullPath).toString('base64');
                } else {
                    content = fs.readFileSync(fullPath, 'utf-8');
                }
                attachments.push({
                    path: fullPath,
                    name: path.basename(fullPath),
                    content,
                    isImage
                });
            }
        } catch { }
    }
    return { cleanedInput, attachments };
}