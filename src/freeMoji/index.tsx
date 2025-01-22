import type { ExtensionWebExports } from "@moonlight-mod/types";

const logger = moonlight.getLogger("freeMoji");

// https://moonlight-mod.github.io/ext-dev/webpack/#patching
export const patches: ExtensionWebExports["patches"] = [
    {
        find: /canUseEmojisEverywhere:(\w+)/,
        replace: [{
            match: /canUseAnimatedEmojis:(\w+),/,
            replacement: 'canUseAnimatedEmojis: () => true,'
        }, {
            match: /canUseEmojisEverywhere:(\w+),/,
            replacement: 'canUseEmojisEverywhere: () => true,'
        }]
    },
    {
        find: /async sendMessage\((\w+),(\w+)\)\{/,
        replace: [{
            match: /async sendMessage\((\w+),(\w+)\)\{/,
            replacement: `async sendMessage($1, $2) {
                require('freeMoji_entrypoint').interceptMessageSend($1, $2);
                `
        }]
    }
];

// https://moonlight-mod.github.io/ext-dev/webpack/#webpack-module-insertion
export const webpackModules: ExtensionWebExports["webpackModules"] = {
    entrypoint: {
        dependencies: [
            { ext: "common", id: "stores" },
        ],
        entrypoint: true
    },
};
