import type { ExtensionWebExports } from "@moonlight-mod/types";

// extension will fail to load if this is not present
export const patches: ExtensionWebExports["patches"] = [
    {
        find: "shouldShowSpeakingWhileMutedTooltip",
        replace: {
            match: /children:\[(?=.{0,25}?accountContainerRef)/,
            replacement: "$&require('gameActivityToggle_entrypoint').GameActivityToggleButton(arguments[0]),"
        }
    }
];

export const webpackModules: ExtensionWebExports["webpackModules"] = {
    entrypoint: {
        dependencies: [
            "react",
            {
                ext: "spacepack",
                id: "spacepack"
            },
            {
                ext: "common",
                id: "ErrorBoundary"
            }
        ]
    }
};
