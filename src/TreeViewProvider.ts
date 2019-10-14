import {
    TreeItem,
    TreeItemCollapsibleState,
    TreeDataProvider,
    Uri,
    window,
    EventEmitter,
    Event,
    ExtensionContext
} from "vscode";

import { join } from "path";

const ITEM_ICON_MAP = new Map<string, string>([
    ["word1", "word1.svg"],
    ["word2", "word2.svg"],
    ["word3", "word3.svg"]
]);

export class TreeItemNode extends TreeItem {
    group: string = "";
    word: string = "";

    constructor(
        public readonly label: string,
        public readonly collapsibleState: TreeItemCollapsibleState,
        group = "",
        word = ""
    ) {
        super(label, collapsibleState);
        this.group = group;
        this.word = word;
        this.iconPath = this.getIconUriForLabel(group, word);
    }

    command = {
        title: this.label, // 标题
        command: "itemClick", // 命令 ID
        tooltip: this.label, // 鼠标覆盖时的小小提示框
        arguments: [
            // 向 registerCommand 传递的参数。
            this.label // 目前这里我们只传递一个 label
        ]
    };

    getIconUriForLabel(group: string, word: string): Uri {
        return Uri.file(
            join(
                __filename,
                "..",
                "..",
                "src",
                "assert",
                group && word ? "icon_word.svg" : group ? "collection.svg" : ""
            )
        );
    }
}

export class TreeViewProvider implements TreeDataProvider<TreeItemNode> {
    context: ExtensionContext;
    word: string = "";
    group: string = "";

    constructor(context: ExtensionContext) {
        this.context = context;
    }
    // private _onDidChangeTreeData: EventEmitter<
    //     TreeItemNode | undefined
    // > = new EventEmitter<TreeItemNode | undefined>();
    // readonly onDidChangeTreeData: Event<TreeItemNode | undefined> = this
    //     ._onDidChangeTreeData.event;

    getTreeItem(element: TreeItemNode): TreeItem | Thenable<TreeItem> {
        return element;
    }

    getChildren(
        element?: TreeItemNode | undefined
    ): import("vscode").ProviderResult<TreeItemNode[]> {
        if (!element) {
            return [
                new TreeItemNode("WORDS", TreeItemCollapsibleState.Expanded)
            ];
        }

        const res: TreeItemNode[] = [];

        if (!element.group && !element.word) {
            const group: { [key: string]: any } =
                this.context.globalState.get("wordsMap") || {};
            const keys = Object.keys(group);

            for (const key of keys) {
                res.push(
                    new TreeItemNode(
                        key,
                        TreeItemCollapsibleState.Collapsed as TreeItemCollapsibleState,
                        key
                    )
                );
            }
        }

        if (element.group && !element.word) {
            const group: { [key: string]: any } =
                this.context.globalState.get("wordsMap") || {};

            for (const k of Object.keys(group[element.group])) {
                res.push(
                    new TreeItemNode(
                        k,
                        TreeItemCollapsibleState.Expanded,
                        element.group,
                        k
                    )
                );
            }
        }

        if (element.group && element.word) {
            const group: { [key: string]: any } =
                this.context.globalState.get("wordsMap") || {};
            const word = group[element.group][element.word];
            res.push(
                new TreeItemNode(
                    `userDesc: ${word.userDesc}`,
                    TreeItemCollapsibleState.None
                )
            );

            res.push(
                new TreeItemNode(
                    `desc: ${word.desc}`,
                    TreeItemCollapsibleState.None
                )
            );

            res.push(
                new TreeItemNode(
                    `file: ${word.file}`,
                    TreeItemCollapsibleState.None
                )
            );

            res.push(
                new TreeItemNode(
                    `example: ${word.example}`,
                    TreeItemCollapsibleState.None
                )
            );
        }

        console.log(element);

        console.log("res", res);

        return res;
    }
}
