import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import { Settings } from './settings';
import { strftime } from './strftime';

//
// Manage task notes
//
// This is not really part of the todo.txt spec but the spec does allow for
// extension via tags so this implements a note file for tags with
// 'note:filename'. createTaskNote uses the current selection, saves it in new
// note file (prompting for the filename) and then places the note tag with
// filename in the clipboard so it can be easily copied to the relevant todo
// line.
//
export namespace Note {
    let setting = new Settings();

    export function createTaskNote() {
        const activeEditor = vscode.window.activeTextEditor;
        const selection = activeEditor.selection;
        if (selection.isEmpty) {
            vscode.window.showInformationMessage("No text selected for note");
            return;
        }
        const selectedText = activeEditor.document.getText(selection);
 
        let noteFilename = strftime(setting.NoteFilenameFormat, new Date());
        let selStart = noteFilename.indexOf("[");
        let selEnd = noteFilename.indexOf("]");
        if (selStart == -1 || selEnd == -1) {
            selStart = selEnd = noteFilename.length;
        } else {
            selEnd += 1;
        }

        vscode.window.showInputBox({
            prompt: 'Note file:',
            value: noteFilename,
            valueSelection: [selStart, selEnd]
        }).then((noteFile:string) => {
            let folder = path.normalize(path.dirname(vscode.window.activeTextEditor.document.fileName));
            let notePath: string = path.join(folder, noteFile);
            try {
                fs.writeFileSync(notePath, selectedText, 'utf8');
                let noteTag = "note:" + noteFile;
                vscode.env.clipboard.writeText(noteTag);
                if (setting.ReplaceNoteTextWithNoteTag) {
                    activeEditor.edit(builder => {
                        builder.replace(selection, noteTag);
                    });
                } else {
                    activeEditor.edit(builder => {
                        builder.delete(selection);
                    });
                    vscode.window.showInformationMessage("Paste the new note tag into the appropriate task");
                }
            } catch(e) {
                vscode.window.showErrorMessage(`Failed to create note file: ${notePath}`);
            }
        });
    }
}