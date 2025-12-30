import { OutputLanguage } from "@/types";

export const getLanguageInstruction = (lang: OutputLanguage) => {
    return `\nCRITICAL OUTPUT RULE: The final content MUST be written in ${lang}. Translate any structural logic into natural-sounding ${lang}.`;
};
