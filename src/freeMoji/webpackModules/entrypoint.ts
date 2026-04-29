import { EmojiStore, SelectedGuildStore } from "@moonlight-mod/wp/common_stores";
import spacepack from "@moonlight-mod/wp/spacepack_spacepack";

const logger = moonlight.getLogger("freeMoji/entrypoint");
logger.info("Hello from freeMoji/entrypoint!");

interface Emoji {
    id: string;
    guildId: string;
    animated: boolean;
    available: boolean;
    type: number;
    name: string;
    // note: many attributes omitted as not relevant
}

interface Message {
    content: string;
    invalidEmojis: Emoji[];
    tts: boolean;
    validNonShortcutEmojis: Emoji[];
}

let module = spacepack.findByCode("Queueing message to be sent")[0].exports;
module = module[Object.getOwnPropertyNames(module)[0]];

const originalSend = module.sendMessage;
module.sendMessage = async (...args: any[]) => {
    logger.trace("sendMessage called with", args);
    modifyIfNeeded(args[1]);
    return originalSend.call(module, ...args);
};

// https://github.com/luimu64/nitro-spoof/blob/1bb75a2471c39669d590bfbabeb7b922672929f5/index.js#L25
const hasEmotesRegex = /<a?:(\w+):(\d+)>/i;

function extractUnusableEmojis(messageString: string, size: number) {
    const emojiStrings = messageString.matchAll(/<a?:(\w+):(\d+)>/gi);

    for (const emojiString of emojiStrings) {
        // Fetch required info about the emoji
        const emoji: Emoji = EmojiStore.getCustomEmojiById(emojiString[2]);

        // Check emoji usability
        if (emoji.guildId !== SelectedGuildStore.getGuildId() || emoji.animated) {
            // Replace the discord emoji format with the corresponding emoji url
            messageString = messageString.replace(
                emojiString[0],
                `[:${emoji.name}:](https://cdn.discordapp.com/emojis/${emoji.id}.webp?size=${size}${emoji.animated ? "&animated=true" : ""})`
            );
        }
    }

    return {
        newContent: messageString.trim()
    };
}

export default function modifyIfNeeded(msg: Message) {
    if (!msg.content.match(hasEmotesRegex)) return;

    // Find all emojis from the captured message string and return object with emojiURLS and content
    const { newContent } = extractUnusableEmojis(msg.content, 48);

    msg.content = newContent;

    // Set invalidEmojis to empty to prevent Discord yelling to you about you not having nitro
    msg.invalidEmojis = [];
}
