"use client";

import { useMemo, useState } from "react";

type WasmModule = {
    default: (moduleOrPath?: unknown) => Promise<unknown>;
    encrypty: (key: string, message: string) => string;
};

let wasmReady: Promise<WasmModule> | null = null;
async function getWasm(): Promise<WasmModule> {
    if (!wasmReady) {
        wasmReady = import("./src/pkgs/wasm.js").then(async (m) => {
            await m.default();
            return m as WasmModule;
        });
    }

    return wasmReady;
}

function IconLock(props: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className={props.className}
        >
            <path
                d="M7 10V8a5 5 0 0 1 10 0v2"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
            <path
                d="M6.5 10.5h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            <path
                d="M12 14v3"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
        </svg>
    );
}

function IconCopy(props: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className={props.className}
        >
            <path
                d="M8 8h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2Z"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            <path
                d="M16 6H7a3 3 0 0 0-3 3v9"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
        </svg>
    );
}

export default function Home() {
    const [keyText, setKeyText] = useState("");
    const [message, setMessage] = useState("");
    const [output, setOutput] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [showKey, setShowKey] = useState(false);

    const canRun = useMemo(
        () => keyText.trim().length > 0 && message.length > 0,
        [keyText, message],
    );

    async function run() {
        setError(null);
        setCopied(false);

        if (!canRun) {
            setError("Enter a key and a message.");
            return;
        }

        try {
            setBusy(true);
            const wasm = await getWasm();
            const result = wasm.encrypty(keyText, message);
            setOutput(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to encrypt.");
        } finally {
            setBusy(false);
        }
    }

    async function copyOutput() {
        setError(null);
        setCopied(false);

        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
        } catch {
            setError("Copy failed. Your browser may block clipboard access.");
        }
    }

    function clearAll() {
        setError(null);
        setCopied(false);
        setKeyText("");
        setMessage("");
        setOutput("");
    }

    return (
        <div className="min-h-screen">
            <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
                <header className="mb-10 flex flex-col items-start justify-between gap-6 sm:mb-14 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                        <div className="grid size-11 place-items-center rounded-2xl bg-white/60 ring-1 ring-black/10 shadow-(--shadow) backdrop-blur dark:bg-black/30 dark:ring-white/10">
                            <IconLock className="size-5 text-zinc-900 dark:text-zinc-100" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                                    Encrypty
                                </h1>
                            </div>
                            <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                                Enter a message and key. The same function
                                decrypts when you run it again with the same
                                key.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={clearAll}
                            className="inline-flex h-10 items-center justify-center rounded-xl bg-white/60 px-4 text-sm font-medium text-zinc-800 ring-1 ring-black/10 backdrop-blur transition hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 active:translate-y-px dark:bg-black/30 dark:text-zinc-100 dark:ring-white/10 dark:hover:bg-black/40 dark:focus-visible:ring-white/20"
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={run}
                            disabled={busy || !canRun}
                            className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 disabled:cursor-not-allowed disabled:opacity-60 active:translate-y-px dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-white dark:focus-visible:ring-white/20"
                        >
                            {busy ? "Encrypting…" : "Encrypt/decrypt"}
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <section className="rounded-3xl bg-(--card) p-5 ring-1 ring-(--card-border) shadow-(--shadow) backdrop-blur sm:p-7">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-sm font-semibold tracking-wide text-zinc-900 dark:text-zinc-100">
                                Input
                            </h2>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                Key + message
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                                    Key
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        value={keyText}
                                        onChange={(e) =>
                                            setKeyText(e.target.value)
                                        }
                                        type={showKey ? "text" : "password"}
                                        placeholder="Enter your key"
                                        className="h-11 w-full rounded-2xl bg-white/70 px-4 text-sm text-zinc-900 ring-1 ring-black/10 backdrop-blur placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black/20 dark:bg-black/30 dark:text-zinc-50 dark:ring-white/10 dark:placeholder:text-zinc-500 dark:focus:ring-white/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowKey((s) => !s)}
                                        className="h-11 shrink-0 rounded-2xl bg-white/60 px-3 text-sm font-medium text-zinc-800 ring-1 ring-black/10 backdrop-blur transition hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 active:translate-y-px dark:bg-black/30 dark:text-zinc-100 dark:ring-white/10 dark:hover:bg-black/40 dark:focus-visible:ring-white/20"
                                    >
                                        {showKey ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                                    Message
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={8}
                                    placeholder="Type or paste your message…"
                                    className="w-full resize-none rounded-2xl bg-white/70 px-4 py-3 text-sm leading-6 text-zinc-900 ring-1 ring-black/10 backdrop-blur placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black/20 dark:bg-black/30 dark:text-zinc-50 dark:ring-white/10 dark:placeholder:text-zinc-500 dark:focus:ring-white/20"
                                />
                            </div>

                            {error ? (
                                <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800 ring-1 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:ring-rose-900/40">
                                    {error}
                                </div>
                            ) : null}

                            <div className="rounded-2xl bg-white/40 px-4 py-3 text-xs leading-5 text-zinc-600 ring-1 ring-black/10 backdrop-blur dark:bg-black/20 dark:text-zinc-300 dark:ring-white/10">
                                Tip: This algorithm is reversible (XOR). To
                                decrypt, run the output as the message with the
                                same key.
                            </div>
                        </div>
                    </section>

                    <section className="rounded-3xl bg-(--card) p-5 ring-1 ring-(--card-border) shadow-(--shadow) backdrop-blur sm:p-7">
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-sm font-semibold tracking-wide text-zinc-900 dark:text-zinc-100">
                                    Output
                                </h2>
                                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                                    Encrypted / decrypted text
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={copyOutput}
                                disabled={!output}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white/60 px-4 text-sm font-medium text-zinc-800 ring-1 ring-black/10 backdrop-blur transition hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 disabled:cursor-not-allowed disabled:opacity-60 active:translate-y-px dark:bg-black/30 dark:text-zinc-100 dark:ring-white/10 dark:hover:bg-black/40 dark:focus-visible:ring-white/20"
                            >
                                <IconCopy className="size-4" />
                                {copied ? "Copied" : "Copy"}
                            </button>
                        </div>

                        <textarea
                            value={output}
                            readOnly
                            rows={13}
                            placeholder="Your encrypted output will appear here…"
                            className="w-full resize-none rounded-2xl bg-white/70 px-4 py-3 font-mono text-sm leading-6 text-zinc-900 ring-1 ring-black/10 backdrop-blur placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black/20 dark:bg-black/30 dark:text-zinc-50 dark:ring-white/10 dark:placeholder:text-zinc-500 dark:focus:ring-white/20"
                        />

                        <div className="mt-4 flex items-start justify-between gap-4">
                            <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                                Note: output may include non-printable
                                characters. Copy works best for moving it
                                around. Numbers as key might make the output
                                printable but less secure.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setError(null);
                                    setCopied(false);
                                    setMessage(output);
                                    setOutput("");
                                }}
                                disabled={!output}
                                className="inline-flex h-9 shrink-0 items-center justify-center rounded-xl bg-zinc-950 px-3 text-xs font-medium text-white shadow-sm transition hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 disabled:cursor-not-allowed disabled:opacity-60 active:translate-y-px dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-white dark:focus-visible:ring-white/20"
                            >
                                Use as message
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
