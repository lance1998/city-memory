import js from "@eslint/js";

export default [
    js.configs.recommended,
    {
        languageOptions: {
            globals: {
                window: "readonly",
                document: "readonly",
                app: "readonly",
                DB: "readonly",
                L: "readonly",
                Storage: "readonly",
                console: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
                setInterval: "readonly",
                clearInterval: "readonly",
                requestAnimationFrame: "readonly",
                cancelAnimationFrame: "readonly",
                Math: "readonly",
                Date: "readonly",
                JSON: "readonly",
                Array: "readonly",
                String: "readonly",
                Number: "readonly",
                Object: "readonly",
                Boolean: "readonly",
                alert: "readonly",
                navigator: "readonly",
                location: "readonly",
                history: "readonly",
                fetch: "readonly",
                Promise: "readonly",
                localStorage: "readonly",
                sessionStorage: "readonly",
                module: "readonly",
                require: "readonly",
                echarts: "readonly"
            }
        },
        rules: {
            "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
        }
    }
];