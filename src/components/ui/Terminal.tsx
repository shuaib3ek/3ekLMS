"use client";

import { useState, useEffect, useRef } from "react";
import { Terminal as TerminalIcon, Play, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Terminal() {
    const [lines, setLines] = useState<string[]>([
        "Welcome to 3ekLMS Cloud Shell",
        "Initializing environment...",
        "Connected to instance i-03948572 (us-east-1a)",
        "Type 'help' for available commands.",
    ]);
    const [input, setInput] = useState("");
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [lines]);

    // Mock File System
    const fileSystem: Record<string, string | object> = {
        "/": {
            "projects": {
                "demo-app": {
                    "package.json": "{ \"name\": \"demo-app\" }",
                    "README.md": "# Demo App\nThis is a sample project.",
                    "src": {
                        "index.js": "console.log('Hello World');",
                        "App.js": "export default function App() { return <div />; }"
                    }
                },
                "notes.txt": "Remember to update the AWS credentials."
            },
            "README.md": "# 3ekLMS Lab Environment\nWelcome to your sandbox."
        }
    };

    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [cwd, setCwd] = useState<string[]>([]); // Current working directory as path array

    // Helper to get current directory object
    const getCurrentDir = () => {
        let current = fileSystem["/"];
        for (const dir of cwd) {
            if (typeof current === 'object' && current !== null && dir in current) {
                // @ts-ignore
                current = current[dir];
            }
        }
        return current;
    };

    const processCommand = (cmd: string) => {
        const parts = cmd.trim().split(" ");
        const command = parts[0];
        const args = parts.slice(1);

        switch (command) {
            case "help":
                return [
                    "GNU bash, version 5.1.16(1)-release",
                    "These shell commands are defined internally.  Type `help' to see this list.",
                    "",
                    "Available commands:",
                    "  ls [dir]      List directory contents",
                    "  cd [dir]      Change directory",
                    "  cat [file]    Print file content",
                    "  clear         Clear the terminal screen",
                    "  pwd           Print working directory",
                    "  echo [text]   Display a line of text",
                    "  whoami        Print effective userid"
                ];
            case "clear":
                setLines([]);
                return null;
            case "ls":
                const currentDir = getCurrentDir();
                if (typeof currentDir === 'object') {
                    // Start of rudimentary ls implementation
                    return Object.keys(currentDir).map(name => {
                        // @ts-ignore
                        const isDir = typeof currentDir[name] === 'object';
                        return `<span class="${isDir ? 'text-blue-400 font-bold' : 'text-white'}">${name}</span>`;
                    });
                }
                return [`ls: cannot access '${cwd.join('/')}': No such file or directory`];
            case "pwd":
                return [`/${cwd.join('/')}`];
            case "whoami":
                return ["root"];
            case "cd":
                if (!args[0] || args[0] === "~" || args[0] === "/") {
                    setCwd([]);
                    return [];
                }
                if (args[0] === "..") {
                    setCwd(prev => prev.slice(0, -1));
                    return [];
                }
                // Check if directory exists
                const target = args[0];
                const current = getCurrentDir();
                // @ts-ignore
                if (current && typeof current === 'object' && target in current && typeof current[target] === 'object') {
                    setCwd(prev => [...prev, target]);
                    return [];
                }
                return [`bash: cd: ${target}: No such file or directory`];
            case "cat":
                if (!args[0]) return ["cat: missing file operand"];
                const catTarget = args[0];
                const catCurrent = getCurrentDir();
                // @ts-ignore
                if (catCurrent && typeof catCurrent === 'object' && catTarget in catCurrent) {
                    // @ts-ignore
                    const content = catCurrent[catTarget];
                    if (typeof content === 'string') return [content];
                    return [`cat: ${catTarget}: Is a directory`];
                }
                return [`cat: ${catTarget}: No such file or directory`];
            case "echo":
                return [args.join(" ")];
            case "aws":
                if (args[0] === "--version") return ["aws-cli/2.15.30 Python/3.11.8 Darwin/23.4.0 source/x86_64 prompt/off"];
                return ["aws: error: argument command: Invalid choice"];
            default:
                if (command === "") return [];
                return [`bash: ${command}: command not found`];
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            const pathDisplay = cwd.length === 0 ? "~" : `~/${cwd.join('/')}`;
            const newLine = `<span class="text-green-400">user@3ek-lab</span>:<span class="text-blue-400">${pathDisplay}</span>$ ${input}`;

            setLines(prev => [...prev, newLine]);
            setHistory(prev => [...prev, input]);
            setHistoryIndex(-1);

            const output = processCommand(input);
            if (output) {
                setLines(prev => [...prev, ...output]);
            }

            setInput("");
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (history.length > 0) {
                const newIndex = historyIndex + 1;
                if (newIndex < history.length) {
                    setHistoryIndex(newIndex);
                    setInput(history[history.length - 1 - newIndex]);
                }
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInput(history[history.length - 1 - newIndex]);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInput("");
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] rounded-xl overflow-hidden font-mono text-sm shadow-2xl border border-gray-800">
            {/* Terminal Header */}
            <div className="bg-[#2d2d2d] px-4 py-2 flex items-center justify-between border-b border-black/20">
                <div className="flex items-center gap-2">
                    <TerminalIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300 font-medium">bash — user@3ek-lab</span>
                </div>
                <div className="flex gap-2">
                    <button className="p-1 hover:bg-white/10 rounded" title="Restart Lab">
                        <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    <button className="p-1 hover:bg-white/10 rounded" title="Close">
                        <X className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-1 text-gray-300">
                {lines.map((line, i) => (
                    <div key={i} className="break-all" dangerouslySetInnerHTML={{ __html: line }} />
                ))}
                <div className="flex gap-2 items-center text-white">
                    <span className="text-green-400">user@3ek-lab</span>:<span className="text-blue-400">{cwd.length === 0 ? "~" : `~/${cwd.join('/')}`}</span>$
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-transparent border-none outline-none focus:ring-0 p-0"
                        autoFocus
                    />
                </div>
                <div ref={endRef} />
            </div>
        </div>
    );
}
