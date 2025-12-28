import { useState, useEffect, useMemo } from "react";
import fg from "fast-glob";
import fuzzysort from "fuzzysort";

export interface FileSuggestion {
    path: string,
    display: string
}

export function useFileSuggestions(input: string, cwd: string) {
    const [files, setFiles] = useState<string[]>([]);
    const [isActive, setIsActive] = useState(false);
    const [query, setQuery] = useState('');

    useEffect(() => {
        const loadFiles = async () => {
            try {
                const entries = await fg(['**/*'], {
                    cwd,
                    ignore: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/.gloo/**', '**/build/**'],
                    onlyFiles: true,
                    dot: false,
                    deep: 6
                })
                setFiles(entries);
            } catch (err) { }
        }

        loadFiles();
    }, [cwd])

    useEffect(() => {
        const lastAtIndex = input.lastIndexOf('@');
        if (lastAtIndex !== -1) {
            const afterAt = input.slice(lastAtIndex + 1);

            if (!afterAt.includes(' ')) {
                setIsActive(true);
                setQuery(afterAt);
            } else {
                setIsActive(false);
                setQuery('');
            }
        } else {
            setIsActive(false);
            setQuery('');
        }
    }, [input])

    const suggestions = useMemo((): FileSuggestion[] => {
        if (!isActive || files.length === 0) return [];
        if (query === '') return files.slice(0, 8).map(f => ({ path: f, display: f }));

        const results = fuzzysort.go(query, files, { limit: 8, threshold: -10000 });

        return results.map(r => ({ path: r.target, display: r.target }))
    }, [isActive, query, files]);

    return { suggestions, isActive, query };
}