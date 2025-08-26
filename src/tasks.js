const { lodash } = SillyTavern.libs;
const _ = lodash;

/*

hmm für deinen kontext das ist eine silly tavern extention  für roleplay, der der char bekommt mehrere tasks zugewiesen die er in der reihenfolge abarbeiten muss in der gegebenen ruunden anzahl
versteshst du das?

char bekomt task: "lache" duration: "3"
zb.
user "hallo"
char: "hallo"
user: "wie geht es"
char: "gut und dir?"
user: "mir auch danke dir"
char: "*lacht* das freut mich"

aber auch 

user "hallo"
char: "hallo"
user: "wie geht es"
char: "*lacht* gut und dir?"
user: "mir auch danke dir"
char: "das freut mich"


oder

user "hallo"
char: "hallo *lacht* "
user: "wie geht es"
char: "gut und dir?"
user: "mir auch danke dir"
char: "das freut mich"

*/

import { global_const, objEventSource, objEventTypes, deMuh }  from './base.js';
import { store }  from './store.js';

/**
 * Task Struktur Definition
 * @typedef {Object} Task
 * @property {string} id - Eindeutige Task ID
 * @property {string} description - Was ist der Task
 * @property {number} duration - Wie viele RP Runden hat man Zeit den Task fertig zu stellen
 * @property {number} roundsInProgress - Wie viele Runden man schon an diesem Task arbeitet ohne ihn fertig gestellt zu haben
 * @property {Date} createdAt - Wann wurde der Task erstellt
 * @property {Date} completedAt - Wann wurde der Task abgeschlossen (nur bei completed tasks)
 */

/**
 * User Data Struktur Definition
 * @typedef {Object} UserData
 * @property {Task|null} currentTask - Task die gerade bearbeitet wird
 * @property {Array<Task>} upcomingTasks - Tasks die noch warten
 * @property {Array<Task>} completedTasks - Abgeschlossene Tasks
 * @property {Object} userInfo - Zusätzliche User-Daten
 */

/**
 * Task Manager Klasse für die Verwaltung von Tasks pro User/Charakter
 */
export class TaskManager {
    constructor(name) {
        if (!name || typeof name !== 'string') {
            throw new Error('TaskManager benötigt einen gültigen Namen');
        }
        this.name = name;
        this.storageKey = ["tasks", name];
        
        // Initialisiere User-Daten falls noch nicht vorhanden
        if (!this.getUserData()) {
            this.initializeUserData();
        }
    }

    /**
     * Initialisiert die User-Daten-Struktur
     */
    initializeUserData() {
        const userData = {
            currentTask: null,
            upcomingTasks: [],
            completedTasks: [],
            userInfo: {
                createdAt: new Date().toISOString(),
                lastActivity: new Date().toISOString()
            }
        };
        store.set(this.storageKey, userData);
    }

    /**
     * Holt alle User-Daten
     * @returns {UserData} User-Daten Objekt
     */
    getUserData() {
        return store.get(this.storageKey);
    }

    /**
     * Setzt User-Daten und löst Change-Event aus
     * @param {UserData} userData - User-Daten Objekt
     */
    setUserData(userData) {
        if (!userData || typeof userData !== 'object') {
            throw new Error('UserData muss ein Objekt sein');
        }

        // Update lastActivity
        userData.userInfo = userData.userInfo || {};
        userData.userInfo.lastActivity = new Date().toISOString();

        store.set(this.storageKey, userData);
        this.emitTasksChanged();
    }

    /**
     * Holt den Namen des Users/Charakters
     * @returns {string} Name
     */
    getName() {
        return this.name;
    }

    /**
     * Holt aktuelle Task
     * @returns {Task|null} Die aktuelle Task oder null
     */
    getCurrentTask() {
        const userData = this.getUserData();
        return userData?.currentTask || null;
    }

    /**
     * Holt kommende Tasks
     * @returns {Array<Task>} Array von kommenden Tasks
     */
    getUpcomingTasks() {
        const userData = this.getUserData();
        return userData?.upcomingTasks || [];
    }

    /**
     * Holt abgeschlossene Tasks
     * @returns {Array<Task>} Array von abgeschlossenen Tasks
     */
    getCompletedTasks() {
        const userData = this.getUserData();
        return userData?.completedTasks || [];
    }

    /**
     * Holt alle Tasks
     * @returns {Array<Task>} Array aller Tasks
     */
    getTasks() {
        const current = this.getCurrentTask();
        const upcoming = this.getUpcomingTasks();
        const completed = this.getCompletedTasks();
        const allTasks = [...upcoming, ...completed];
        if (current) allTasks.unshift(current);
        return allTasks;
    }

    /**
     * Setzt aktuelle Task
     * @param {Task|null} task - Die aktuelle Task oder null
     */
    setCurrentTask(task) {
        if (task !== null && (typeof task !== 'object' || !task.id)) {
            throw new Error('CurrentTask muss null oder ein gültiges Task-Objekt sein');
        }
        const userData = this.getUserData();
        userData.currentTask = task;
        this.setUserData(userData);
    }

    /**
     * Setzt kommende Tasks
     * @param {Array<Task>} tasks - Array von Tasks
     */
    setUpcomingTasks(tasks) {
        if (!_.isArray(tasks)) {
            throw new Error('Tasks müssen ein Array sein');
        }
        const userData = this.getUserData();
        userData.upcomingTasks = tasks;
        this.setUserData(userData);
    }

    /**
     * Setzt abgeschlossene Tasks
     * @param {Array<Task>} tasks - Array von Tasks
     */
    setCompletedTasks(tasks) {
        if (!_.isArray(tasks)) {
            throw new Error('Tasks müssen ein Array sein');
        }
        const userData = this.getUserData();
        userData.completedTasks = tasks;
        this.setUserData(userData);
    }

    /**
     * Fügt eine neue Task zu den kommenden Tasks hinzu
     * @param {string} description - Was ist der Task
     * @param {number} [duration=5] - Wie viele RP Runden hat man Zeit (Standard: 5)
     * @returns {Object} Objekt mit Task und Status: { task: Task, status: 'current'|'upcoming' }
     */
    addTask(description, duration = 5) {
        if (!_.isNumber(duration) || duration < 1) {
            throw new Error('Duration muss eine positive Zahl sein');
        }

        const newTask = {
            id: this.generateTaskId(),
            description,
            duration,
            roundsInProgress: 0,
            createdAt: new Date().toISOString()
        };

        const userData = this.getUserData();

        // Wenn keine aktuelle Task vorhanden ist, wird die neue Task automatisch zur aktuellen
        if (!userData.currentTask) {
            userData.currentTask = newTask;
            this.setUserData(userData);
            return { task: newTask, status: 'current' };
        } else {
            // Sonst zu upcoming hinzufügen
            const upcomingTasks = this.getUpcomingTasks();
            upcomingTasks.push(newTask);
            this.setUpcomingTasks(upcomingTasks);
            return { task: newTask, status: 'upcoming' };
        }
    }

    /**
     * Aktualisiert eine bestehende Task
     * @param {string} taskId - ID der Task
     * @param {Object} updates - Zu aktualisierende Eigenschaften
     * @returns {Object|null} Die aktualisierte Task oder null wenn nicht gefunden
     */
    updateTask(taskId, updates) {
        const userData = this.getUserData();
        
        // Suche in currentTask
        if (userData.currentTask && userData.currentTask.id === taskId) {
            const updatedTask = { ...userData.currentTask, ...updates };
            userData.currentTask = updatedTask;
            this.setUserData(userData);
            return updatedTask;
        }

        // Suche in upcomingTasks
        let taskIndex = _.findIndex(userData.upcomingTasks, { id: taskId });
        if (taskIndex !== -1) {
            const updatedTask = { ...userData.upcomingTasks[taskIndex], ...updates };
            userData.upcomingTasks[taskIndex] = updatedTask;
            this.setUserData(userData);
            return updatedTask;
        }

        // Suche in completedTasks
        taskIndex = _.findIndex(userData.completedTasks, { id: taskId });
        if (taskIndex !== -1) {
            const updatedTask = { ...userData.completedTasks[taskIndex], ...updates };
            userData.completedTasks[taskIndex] = updatedTask;
            this.setUserData(userData);
            return updatedTask;
        }

        console.warn(`Task mit ID ${taskId} nicht gefunden`);
        return null;
    }

    /**
     * Löscht eine Task
     * @param {string} taskId - ID der Task
     * @returns {boolean} True wenn gelöscht, false wenn nicht gefunden
     */
    deleteTask(taskId) {
        const userData = this.getUserData();
        let found = false;

        // Entferne aus currentTask
        if (userData.currentTask && userData.currentTask.id === taskId) {
            userData.currentTask = null;
            found = true;
        }

        // Entferne aus upcomingTasks
        const upcomingTasks = _.filter(userData.upcomingTasks, task => task.id !== taskId);
        if (upcomingTasks.length !== userData.upcomingTasks.length) {
            userData.upcomingTasks = upcomingTasks;
            found = true;
        }

        // Entferne aus completedTasks
        const completedTasks = _.filter(userData.completedTasks, task => task.id !== taskId);
        if (completedTasks.length !== userData.completedTasks.length) {
            userData.completedTasks = completedTasks;
            found = true;
        }

        if (!found) {
            console.warn(`Task mit ID ${taskId} nicht gefunden`);
            return false;
        }

        this.setUserData(userData);
        return true;
    }

    /**
     * Löscht die aktuelle Task und setzt automatisch den nächsten upcoming task als current task
     * @param {string} taskId - ID der aktuellen Task (optional, zur Sicherheitsprüfung)
     * @returns {Object|null} Die neue aktuelle Task oder null wenn keine upcoming tasks vorhanden
     */
    deleteCurrentTask(taskId = null) {
        const userData = this.getUserData();
        
        // Prüfe ob eine aktuelle Task vorhanden ist
        if (!userData.currentTask) {
            console.warn('Keine aktuelle Task vorhanden zum Löschen');
            return null;
        }

        // Sicherheitsprüfung: Wenn taskId angegeben, prüfe ob es die aktuelle Task ist
        if (taskId && userData.currentTask.id !== taskId) {
            console.warn(`Task mit ID ${taskId} ist nicht die aktuelle Task`);
            return null;
        }

        const deletedTask = userData.currentTask;
        
        // Lösche aktuelle Task
        userData.currentTask = null;

        // Starte automatisch nächste Task wenn vorhanden
        let nextTask = null;
        if (userData.upcomingTasks.length > 0) {
            nextTask = userData.upcomingTasks.shift();
            userData.currentTask = nextTask;
        }

        this.setUserData(userData);
        
        console.log(`Task "${deletedTask.description}" gelöscht.`, nextTask ? `Nächste Task "${nextTask.description}" gestartet.` : 'Keine weiteren Tasks vorhanden.');
        
        return nextTask;
    }

    /**
     * Holt eine spezifische Task
     * @param {string} taskId - ID der Task
     * @returns {Object|null} Die Task oder null wenn nicht gefunden
     */
    getTask(taskId) {
        const userData = this.getUserData();
        
        // Suche in currentTask
        if (userData.currentTask && userData.currentTask.id === taskId) {
            return userData.currentTask;
        }

        // Suche in upcomingTasks
        let task = _.find(userData.upcomingTasks, { id: taskId });
        if (task) return task;

        // Suche in completedTasks
        task = _.find(userData.completedTasks, { id: taskId });
        if (task) return task;

        return null;
    }

    /**
     * Markiert eine Task als erledigt und verschiebt sie zu completedTasks
     * @param {string} taskId - ID der Task
     * @returns {Object|null} Die abgeschlossene Task oder null
     */
    completeTask(taskId) {
        const userData = this.getUserData();
        let task = null;

        // Suche in currentTask
        if (userData.currentTask && userData.currentTask.id === taskId) {
            task = userData.currentTask;
            userData.currentTask = null;
        }
        // Suche in upcomingTasks
        else {
            const taskIndex = _.findIndex(userData.upcomingTasks, { id: taskId });
            if (taskIndex !== -1) {
                task = userData.upcomingTasks.splice(taskIndex, 1)[0];
            }
        }

        if (!task) {
            console.warn(`Task mit ID ${taskId} nicht gefunden oder bereits abgeschlossen`);
            return null;
        }

        // Task als abgeschlossen markieren und zu completedTasks hinzufügen
        const completedTask = {
            ...task,
            completedAt: new Date().toISOString()
        };
        userData.completedTasks.push(completedTask);

        // Automatisch nächste Task starten wenn vorhanden
        if (userData.upcomingTasks.length > 0 && !userData.currentTask) {
            userData.currentTask = userData.upcomingTasks.shift();
        }

        this.setUserData(userData);
        return completedTask;
    }

    /**
     * Verschiebt eine Task von upcoming zu current (startet die Task)
     * @param {string} taskId - ID der Task
     * @returns {Object|null} Die gestartete Task oder null
     */
    startTask(taskId) {
        const userData = this.getUserData();
        
        const taskIndex = _.findIndex(userData.upcomingTasks, { id: taskId });
        if (taskIndex === -1) {
            console.warn(`Task mit ID ${taskId} nicht in upcomingTasks gefunden`);
            return null;
        }

        // Prüfe ob bereits eine aktuelle Task vorhanden ist
        if (userData.currentTask) {
            console.warn(`Es gibt bereits eine aktuelle Task: ${userData.currentTask.description}`);
            return null;
        }

        // Task aus upcomingTasks entfernen und zu currentTask machen
        const task = userData.upcomingTasks.splice(taskIndex, 1)[0];
        userData.currentTask = task;

        this.setUserData(userData);
        return task;
    }

    /**
     * Verschiebt die aktuelle Task zurück zu upcoming (pausiert sie)
     * @param {string} taskId - ID der Task
     * @returns {Object|null} Die pausierte Task oder null
     */
    pauseTask(taskId) {
        const userData = this.getUserData();
        
        if (!userData.currentTask || userData.currentTask.id !== taskId) {
            console.warn(`Task mit ID ${taskId} ist nicht die aktuelle Task`);
            return null;
        }

        // Task aus currentTask entfernen
        const task = userData.currentTask;
        userData.currentTask = null;
        
        // roundsInProgress zurücksetzen
        task.roundsInProgress = 0;
        
        // Task zu upcomingTasks hinzufügen (am Anfang für Priorität)
        userData.upcomingTasks.unshift(task);

        this.setUserData(userData);
        return task;
    }

    /**
     * Verschiebt eine abgeschlossene Task zurück zu upcoming
     * @param {string} taskId - ID der Task
     * @returns {Object|null} Die reaktivierte Task oder null
     */
    reopenTask(taskId) {
        const userData = this.getUserData();
        
        const taskIndex = _.findIndex(userData.completedTasks, { id: taskId });
        if (taskIndex === -1) {
            console.warn(`Task mit ID ${taskId} nicht in completedTasks gefunden`);
            return null;
        }

        // Task aus completedTasks entfernen
        const task = userData.completedTasks.splice(taskIndex, 1)[0];
        
        // completedAt entfernen und roundsInProgress zurücksetzen
        delete task.completedAt;
        task.roundsInProgress = 0;
        
        // Task zu upcomingTasks hinzufügen
        userData.upcomingTasks.push(task);

        this.setUserData(userData);
        return task;
    }

    /**
     * Erhöht die Anzahl der Runden für die aktuelle Task
     * @param {number} rounds - Anzahl der zu erhöhenden Runden (Standard: 1)
     * @returns {Object|null} Die aktualisierte Task oder null
     */
    incrementRoundsInProgress(rounds = 1) {
        const userData = this.getUserData();
        
        if (!userData.currentTask) {
            console.warn('Keine aktuelle Task vorhanden');
            return null;
        }

        userData.currentTask.roundsInProgress = (userData.currentTask.roundsInProgress || 0) + rounds;
        
        this.setUserData(userData);
        return userData.currentTask;
    }

    /**
     * Setzt die Runden für die aktuelle Task zurück
     * @returns {Object|null} Die aktualisierte Task oder null
     */
    resetRoundsInProgress() {
        const userData = this.getUserData();
        
        if (!userData.currentTask) {
            console.warn('Keine aktuelle Task vorhanden');
            return null;
        }

        userData.currentTask.roundsInProgress = 0;
        
        this.setUserData(userData);
        return userData.currentTask;
    }

    /**
     * Startet automatisch die nächste Task wenn keine aktuelle Task vorhanden ist
     * @returns {Object|null} Die gestartete Task oder null
     */
    startNextTask() {
        const userData = this.getUserData();
        
        // Nur starten wenn keine aktuelle Task und upcoming Tasks vorhanden sind
        if (userData.currentTask || userData.upcomingTasks.length === 0) {
            return null;
        }

        // Erste Task aus upcoming nehmen und zur aktuellen machen
        userData.currentTask = userData.upcomingTasks.shift();
        
        this.setUserData(userData);
        return userData.currentTask;
    }

    /**
     * Prüft ob die aktuelle Task überfällig ist
     * @returns {boolean} True wenn überfällig
     */
    isCurrentTaskOverdue() {
        const currentTask = this.getCurrentTask();
        return currentTask ? currentTask.roundsInProgress >= currentTask.duration : false;
    }

    /**
     * Prüft ob die aktuelle Task bald überfällig wird
     * @param {number} warningThreshold - Anzahl Runden vor Ablauf (Standard: 1)
     * @returns {boolean} True wenn Warnung
     */
    isCurrentTaskNearDeadline(warningThreshold = 1) {
        const currentTask = this.getCurrentTask();
        if (!currentTask) return false;
        
        const remainingRounds = currentTask.duration - currentTask.roundsInProgress;
        return remainingRounds <= warningThreshold && remainingRounds > 0;
    }

    /**
     * Neuordnung der kommenden Tasks
     * @param {Array} orderedTaskIds - Array von Task-IDs in neuer Reihenfolge
     */
    reorderUpcomingTasks(orderedTaskIds) {
        if (!_.isArray(orderedTaskIds)) {
            throw new Error('orderedTaskIds muss ein Array sein');
        }

        const userData = this.getUserData();
        const originalTasks = userData.upcomingTasks;
        
        const taskMap = _.keyBy(originalTasks, 'id');
        
        const reorderedTasks = _.map(orderedTaskIds, taskId => {
            const task = taskMap[taskId];
            if (!task) {
                console.warn(`Task mit ID ${taskId} nicht gefunden beim Neuordnen`);
                return null;
            }
            return task;
        });

        // Entferne null-Werte (nicht gefundene Tasks)
        const validTasks = _.compact(reorderedTasks);
        
        // Füge Tasks hinzu, die nicht in der Neuordnung enthalten waren
        const missingTasks = _.filter(originalTasks, task => !_.includes(orderedTaskIds, task.id));
        const finalTasks = [...validTasks, ...missingTasks];

        userData.upcomingTasks = finalTasks;
        this.setUserData(userData);
    }

    /**
     * Löscht alle erledigten Tasks
     * @returns {number} Anzahl der gelöschten Tasks
     */
    clearCompletedTasks() {
        const userData = this.getUserData();
        const deletedCount = userData.completedTasks.length;
        userData.completedTasks = [];
        this.setUserData(userData);
        return deletedCount;
    }

    /**
     * Generiert eine eindeutige Task-ID
     * @returns {string} Eindeutige ID
     */
    generateTaskId() {
        return `task_${this.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Emit Task-Änderungsevent
     */
    emitTasksChanged() {
        if (objEventSource) {
            objEventSource.emit(objEventTypes.TASKS_CHANGED, {
                name: this.name,
                currentTask: this.getCurrentTask(),
                upcomingTasks: this.getUpcomingTasks(),
                completedTasks: this.getCompletedTasks()
            });
        }
    }
}

/**
 * Factory-Funktion zum Erstellen eines TaskManagers
 * @param {string} name - Name des Users/Charakters
 * @returns {TaskManager} TaskManager Instanz
 */
export function createTaskManager(name) {
    return new TaskManager(name);
}

