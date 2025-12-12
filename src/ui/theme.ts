export const theme = {
    colors: {
        // Primary palette
        primary: '#a78bfa',      // Soft purple (like Claude)
        secondary: '#22d3ee',    // Teal accent

        // Text
        text: '#e2e8f0',         // Light gray
        textMuted: '#94a3b8',    // Muted gray
        textDim: '#64748b',      // Dim gray

        // Status
        success: '#4ade80',      // Green
        warning: '#fbbf24',      // Yellow
        error: '#f87171',        // Red

        // UI
        border: '#334155',       // Subtle border
        background: '#0f172a',   // Dark background

        // Roles
        user: '#60a5fa',         // Blue for user
        assistant: '#a78bfa',    // Purple for Gloo
    },

    icons: {
        user: '→',
        assistant: '◆',
        thinking: '○',
        success: '✓',
        error: '✗',
        warning: '!',
    },

    borders: {
        single: 'single',
        round: 'round',
        double: 'double',
    }
} as const;

export type Theme = typeof theme;