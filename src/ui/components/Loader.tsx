import { TextAttributes } from "@opentui/core";
import { useEffect, useState } from "react";

interface LoaderProps {
    color?: string;
    dimColor?: string;
    speed?: number;
    text?: string;
}

export function Loader({
    color = '#99BB70',
    dimColor = '#515A46',
    speed = 150,
    text = "LOADING"
}: LoaderProps) {
    const [tick, setTick] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTick(t => t + 1);
        }, speed);

        return () => clearInterval(interval);
    }, [speed]);

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+<>?";

    const output = text.split('').map((char, i) => {
        const isStable = Math.sin((tick * 0.2) - (i * 0.5)) > -0.2;
        const randomGlitch = Math.random() < 0.05;

        if (isStable && !randomGlitch) {
            return char;
        } else {
            return chars[Math.floor(Math.random() * chars.length)];
        }
    });

    return (
        <box style={{ flexDirection: 'row', alignItems: 'center' }}>
            <text style={{ fg: dimColor }}>[ </text>
            <text style={{ fg: color, attributes: TextAttributes.BOLD }}>{output.join('')}</text>
            <text style={{ fg: dimColor }}> ]</text>
        </box>
    );
}
