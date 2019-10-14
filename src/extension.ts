// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { TreeViewProvider } from "./TreeViewProvider";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "komorebi" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json

    context.subscriptions.push(
        vscode.commands.registerCommand("extension.komorebi", () => {
            // The code you place here will be executed every time your command is executed

            // Display a message box to the user
            console.log("Komorebi: " + Date());
            vscode.window.showInformationMessage("Komorebi: " + Date());
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("itemClick", label => {
            vscode.window.showInformationMessage(label);
        })
    );

    context.subscriptions.push(
        vscode.languages.registerHoverProvider("typescript", {
            provideHover(doc: vscode.TextDocument) {
                console.log("ts hover!!!!");

                return new vscode.Hover("For *all* TypeScript documents.");
            }
        })
    );

    context.subscriptions.push(
        vscode.window.registerTreeDataProvider(
            "wordCollection-item",
            new TreeViewProvider(context)
        )
    );

    context.subscriptions.push(
        vscode.commands.registerTextEditorCommand(
            "extension.selection",

            async (textEditor, edit) => {
                const text = textEditor.document.getText(textEditor.selection);
                const currentlyOpenTabFilePath = (vscode.window
                    .activeTextEditor as any).document.fileName;
                const word = await vscode.window.showInputBox({
                    value: text,
                    placeHolder: "collection word"
                });
                const userDesc = await vscode.window.showInputBox({
                    value: "",
                    placeHolder: "word description"
                });

                const group: string =
                    ((await vscode.window.showInputBox({
                        value: "default",
                        placeHolder: "collection group"
                    })) as string) || "default";

                if (word === "") {
                    vscode.window.showWarningMessage("please input word!!!");

                    return;
                }

                let wordsMap:
                    | { [key: string]: any }
                    | undefined = context.globalState.get("wordsMap");

                if (!wordsMap) {
                    wordsMap = {};
                }

                let wordGroup: { [key: string]: any } | undefined =
                    wordsMap[group];

                if (!wordGroup) {
                    wordGroup = {};
                }

                wordGroup[word || text] = {
                    word: word || text,
                    userDesc: userDesc || "",
                    desc: "desc",
                    example: "this is a Desc",
                    code: "",
                    file: currentlyOpenTabFilePath
                };

                wordsMap[group] = wordGroup;

                context.globalState.update("wordsMap", wordsMap);

                vscode.window.registerTreeDataProvider(
                    "wordCollection-item",
                    new TreeViewProvider(context)
                );
            }
        )
    );
}

// this method is called when your extension is deactivated
export function deactivate() {}
