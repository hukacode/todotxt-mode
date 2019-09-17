'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
import { Files } from './files';
import { Helpers } from './helpers';
import { Patterns } from './patterns';
import { Priority } from './priority';
import { Settings } from './settings';
import { Sorting } from './sorting';
import * as extension from './extension';
import * as fs from 'fs';
import { Completion } from './completion';
import { Note } from './note';

export function ActivateCommands(context: vscode.ExtensionContext) {

    let toggleCompletion = vscode.commands.registerCommand('extension.toggleCompletion', () => {
        Completion.toggleCompletion();
    });
    let sortByContext = vscode.commands.registerCommand('extension.sortByContext', () => {
        Sorting.sortLinesByField("context");
    });
    let sortByPriority = vscode.commands.registerCommand('extension.sortByPriority', () => {
        Sorting.sortLinesByField("priority");
    });
    let sortByProject = vscode.commands.registerCommand('extension.sortByProject', () => {
        Sorting.sortLinesByField("project");
    });
    let sortByTag = vscode.commands.registerCommand('extension.sortByTag', () => {
        Sorting.sortLinesByField("tag");
    });
    let sortByDueDate = vscode.commands.registerCommand('extension.sortByDueDate', () => {
        Sorting.sortLinesByTagValue("due");
    });
    let formatTasks = vscode.commands.registerCommand('extension.formatTasks', () => {
        Patterns.formatSelectedTasks();
    });
    let archiveTasks = vscode.commands.registerCommand('extension.archiveTasks', () => {
        Files.archiveTasks();
    });
    let moveTasksToTodo = vscode.commands.registerCommand('extension.moveTasksToTodo', () => {
        Files.moveTasks(Settings.TodoFilename);
    });
    let moveTasksToWaiting = vscode.commands.registerCommand('extension.moveTasksToWaiting', () => {
        Files.moveTasks(Settings.WaitingFilename);
    });
    let moveTasksToSomeday = vscode.commands.registerCommand('extension.moveTasksToSomeday', () => {
        Files.moveTasks(Settings.SomedayFilename);
    });
    let incrementPriority = vscode.commands.registerCommand('extension.incrementPriority', () => {
        Priority.changePriority(true);
    });
    let decrementPriority = vscode.commands.registerCommand('extension.decrementPriority', () => {
        Priority.changePriority(false);
    });
    let removePriorities = vscode.commands.registerCommand('extension.removePriorities', () => {
        Priority.removePriorities();
    });
    let createTaskNote = vscode.commands.registerCommand('extension.createTaskNote', () => {
        Note.createTaskNote();
    });
    // TODO finish implementation
    let moveTasksToProject = vscode.commands.registerCommand('extension.moveTasksToProject', () => {
        async function showInputBox() {
            const result = await vscode.window.showInputBox({
                prompt: 'Project file:'
            });
            // vscode.window.showInformationMessage(`Got: ${result}`);
        }
        showInputBox();

        const options: vscode.OpenDialogOptions = {
            canSelectMany: false,
            openLabel: 'Open',
            filters: {
                'Markdown files': ['md'],
                'Text files': ['txt'],
                'All files': ['*']
            }
        };

        vscode.window.showOpenDialog(options).then(fileUri => {
            if (fileUri && fileUri[0]) {
                console.log('Selected file: ' + fileUri[0].fsPath);
            }
        });
    });

    // not working and not sure if it's because settings are const and cached? maybe if I 
    // just make sure they always go back to configuration.get() then I don't even need
    // a "reactivate" function...
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        extension.deactivate();
        for (const sub of context.subscriptions) {
            try {
                sub.dispose();
            } catch (e) {
                console.error(e);
            }
        }
        extension.activate(context);
    }));

    // add to list of disposables so they will be cleaned up when deactivated
    context.subscriptions.push(toggleCompletion);
    context.subscriptions.push(sortByContext);
    context.subscriptions.push(sortByPriority);
    context.subscriptions.push(sortByProject);
    context.subscriptions.push(sortByTag);
    context.subscriptions.push(sortByDueDate);
    context.subscriptions.push(formatTasks);
    context.subscriptions.push(archiveTasks);
    context.subscriptions.push(moveTasksToTodo);
    context.subscriptions.push(moveTasksToWaiting);
    context.subscriptions.push(moveTasksToSomeday);
    context.subscriptions.push(moveTasksToProject);
    context.subscriptions.push(incrementPriority);
    context.subscriptions.push(decrementPriority);
    context.subscriptions.push(removePriorities);
    context.subscriptions.push(createTaskNote);
}