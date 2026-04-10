import { SyntaxStyle, RGBA } from '@opentui/core';

export const markdownSyntaxStyle = SyntaxStyle.fromStyles({
    // Headings
    'markup.heading.1': { fg: RGBA.fromHex('#99BB70'), bold: true },
    'markup.heading.2': { fg: RGBA.fromHex('#99BB70'), bold: true },
    'markup.heading.3': { fg: RGBA.fromHex('#99BB70'), bold: true },
    'markup.heading.4': { fg: RGBA.fromHex('#BAD29C') },
    'markup.heading.5': { fg: RGBA.fromHex('#BAD29C') },
    'markup.heading.6': { fg: RGBA.fromHex('#BAD29C') },

    // Emphasis
    'markup.bold': { bold: true },
    'markup.italic': { italic: true },
    'markup.strikethrough': { dim: true },

    // Lists
    'markup.list': { fg: RGBA.fromHex('#99BB70') },

    // Code
    'markup.raw': { fg: RGBA.fromHex('#B5BAAF') },
    'markup.raw.block': { fg: RGBA.fromHex('#B5BAAF') },

    // Links
    'markup.link': { fg: RGBA.fromHex('#7AA2F7'), underline: true },
    'markup.link.url': { fg: RGBA.fromHex('#515A46'), dim: true },

    // Blockquote
    'markup.quote': { fg: RGBA.fromHex('#515A46'), italic: true },

    // Horizontal rule
    'markup.separator': { fg: RGBA.fromHex('#515A46'), dim: true },

    // Default text
    'default': { fg: RGBA.fromHex('#E6EDF3') },
});
