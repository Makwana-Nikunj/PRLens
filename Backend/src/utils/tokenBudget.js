const CHARS_PER_TOKEN = 3.5; // Conservative estimate (was 4)

export const BUDGET = {
    systemPrompt: 32000,
    ragContext: 25600,
    chatHistory: 20000,
    userMessage: 6400,
    llmResponse: 25600
};

export function tokensToChars(tokens) {
    return tokens * CHARS_PER_TOKEN;
}

export function cap(text, tokenLimit, label = "content") {
    if (!text) return "";

    const charLimit = tokensToChars(tokenLimit);

    if (text.length <= charLimit) {
        return text;
    }

    return (
        text.slice(0, charLimit) +
        `\n[${label} truncated]`
    );
}
