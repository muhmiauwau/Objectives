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
 * @property {boolean} completed - Ob der Task erledigt ist
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
        
        // Initialisiere Tasks falls noch nicht vorhanden
        if (!this.getTasks()) {
            store.set(this.storageKey, []);
        }
    }

    /**
     * Holt alle Tasks für diesen User/Charakter
     * @returns {Array} Array von Tasks
     */
    getName() {
        return  this.name;
    }

    /**
     * Holt alle Tasks für diesen User/Charakter
     * @returns {Array} Array von Tasks
     */
    getTasks() {
        return store.get(this.storageKey);
    }

    /**
     * Setzt alle Tasks für diesen User/Charakter
     * @param {Array} tasks - Array von Tasks
     */
    setTasks(tasks) {
        if (!_.isArray(tasks)) {
            throw new Error('Tasks müssen ein Array sein');
        }

        store.set(this.storageKey, tasks);
        this.emitTasksChanged();
    }

    /**
     * Fügt eine neue Task hinzu
     * @param {string} description - Was ist der Task
     * @param {number} [duration=5] - Wie viele RP Runden hat man Zeit (Standard: 5)
     * @param {number} [roundsInProgress=0] - Runden bereits in Bearbeitung (Standard: 0)
     * @returns {Task} Die hinzugefügte Task mit ID
     */
    addTask(description, duration = 5, roundsInProgress = 0) {
        // if (!description || typeof description !== 'string') {
        //     throw new Error('Task benötigt eine gültige Beschreibung');
        // }

        if (!_.isNumber(duration) || duration < 1) {
            throw new Error('Duration muss eine positive Zahl sein');
        }

        if (!_.isNumber(roundsInProgress) || roundsInProgress < 0) {
            throw new Error('RoundsInProgress muss eine nicht-negative Zahl sein');
        }

        const tasks = this.getTasks();
        const newTask = {
            id: this.generateTaskId(),
            description,
            duration,
            roundsInProgress,
            completed: false
        };

       
        tasks.push(newTask);
        this.setTasks(tasks);
        
        return newTask;
    }

    /**
     * Aktualisiert eine bestehende Task
     * @param {string} taskId - ID der Task
     * @param {Object} updates - Zu aktualisierende Eigenschaften
     * @returns {Object|null} Die aktualisierte Task oder null wenn nicht gefunden
     */
    updateTask(taskId, updates) {
        const tasks = this.getTasks();
        const taskIndex = _.findIndex(tasks, { id: taskId });

        if (taskIndex === -1) {
            console.warn(`Task mit ID ${taskId} nicht gefunden`);
            return null;
        }

        tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
        this.setTasks(tasks);

        return tasks[taskIndex];
    }

    /**
     * Löscht eine Task
     * @param {string} taskId - ID der Task
     * @returns {boolean} True wenn gelöscht, false wenn nicht gefunden
     */
    deleteTask(taskId) {
        const tasks = this.getTasks();
        const filteredTasks = _.filter(tasks, task => task.id !== taskId);

        if (filteredTasks.length === tasks.length) {
            console.warn(`Task mit ID ${taskId} nicht gefunden`);
            return false;
        }

        this.setTasks(filteredTasks);
        return true;
    }

    /**
     * Holt eine spezifische Task
     * @param {string} taskId - ID der Task
     * @returns {Object|null} Die Task oder null wenn nicht gefunden
     */
    getTask(taskId) {
        const tasks = this.getTasks();
        return _.find(tasks, { id: taskId }) || null;
    }

    /**
     * Markiert eine Task als erledigt/unerledigt
     * @param {string} taskId - ID der Task
     * @param {boolean} completed - Erledigt-Status
     * @returns {Object|null} Die aktualisierte Task oder null
     */
    toggleTaskCompletion(taskId, completed = undefined) {
        const task = this.getTask(taskId);
        if (!task) return null;

        const newCompletedStatus = completed !== undefined ? completed : !task.completed;
        return this.updateTask(taskId, { 
            completed: newCompletedStatus
        });
    }

    /**
     * Erhöht die Anzahl der Runden für eine Task
     * @param {string} taskId - ID der Task
     * @param {number} rounds - Anzahl der zu erhöhenden Runden (Standard: 1)
     * @returns {Object|null} Die aktualisierte Task oder null
     */
    incrementRoundsInProgress(taskId, rounds = 1) {
        const task = this.getTask(taskId);
        if (!task) return null;

        const newRounds = (task.roundsInProgress || 0) + rounds;
        return this.updateTask(taskId, { roundsInProgress: newRounds });
    }

    /**
     * Setzt die Runden für eine Task zurück
     * @param {string} taskId - ID der Task
     * @returns {Object|null} Die aktualisierte Task oder null
     */
    resetRoundsInProgress(taskId) {
        return this.updateTask(taskId, { roundsInProgress: 0 });
    }

    /**
     * Holt Tasks die ihre Zeit überschritten haben
     * @returns {Array} Überfällige Tasks
     */
    getOverdueTasks() {
        return _.filter(this.getTasks(), task => 
            !task.completed && 
            task.roundsInProgress >= task.duration
        );
    }

    /**
     * Holt Tasks die bald überfällig werden (innerhalb der nächsten N Runden)
     * @param {number} warningThreshold - Anzahl Runden vor Ablauf (Standard: 1)
     * @returns {Array} Tasks mit Warnung
     */
    getTasksNearDeadline(warningThreshold = 1) {
        return _.filter(this.getTasks(), task => 
            !task.completed && 
            (task.duration - task.roundsInProgress) <= warningThreshold &&
            task.roundsInProgress < task.duration
        );
    }

    /**
     * Neuordnung der Tasks (für jQuery UI Sortable)
     * @param {Array} orderedTaskIds - Array von Task-IDs in neuer Reihenfolge
     */
    reorderTasks(orderedTaskIds) {
        if (!_.isArray(orderedTaskIds)) {
            throw new Error('orderedTaskIds muss ein Array sein');
        }

        const tasks = this.getTasks();
        const taskMap = _.keyBy(tasks, 'id');
        
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
        const missingTasks = _.filter(tasks, task => !_.includes(orderedTaskIds, task.id));
        const finalTasks = [...validTasks, ...missingTasks];

        this.setTasks(finalTasks);
    }

    /**
     * Filtert Tasks basierend auf Kriterien
     * @param {Object} criteria - Filterkriterien
     * @returns {Array} Gefilterte Tasks
     */
    filterTasks(criteria = {}) {
        const tasks = this.getTasks();
        return _.filter(tasks, criteria);
    }

    /**
     * Holt erledigte Tasks
     * @returns {Array} Erledigte Tasks
     */
    getCompletedTasks() {
        return this.filterTasks({ completed: true });
    }

    /**
     * Holt unerledigte Tasks
     * @returns {Array} Unerledigte Tasks
     */
    getIncompleteTasks() {
        return this.filterTasks({ completed: false });
    }

    /**
     * Löscht alle erledigten Tasks
     * @returns {number} Anzahl der gelöschten Tasks
     */
    clearCompletedTasks() {
        const incompleteTasks = this.getIncompleteTasks();
        const deletedCount = this.getTasks().length - incompleteTasks.length;
        this.setTasks(incompleteTasks);
        return deletedCount;
    }

    /**
     * Holt Task-Statistiken
     * @returns {Object} Statistiken
     */
    getStatistics() {
        const tasks = this.getTasks();
        const completed = this.getCompletedTasks();
        const incomplete = this.getIncompleteTasks();
        const overdue = this.getOverdueTasks();
        const nearDeadline = this.getTasksNearDeadline();

        return {
            total: tasks.length,
            completed: completed.length,
            incomplete: incomplete.length,
            overdue: overdue.length,
            nearDeadline: nearDeadline.length,
            completionRate: tasks.length > 0 ? (completed.length / tasks.length * 100).toFixed(1) : 0,
            averageRoundsInProgress: tasks.length > 0 ? 
                (_.sumBy(incomplete, 'roundsInProgress') / incomplete.length).toFixed(1) : 0
        };
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
                tasks: this.getTasks(),
                statistics: this.getStatistics()
            });
        }
    }

    /**
     * Exportiert alle Tasks als JSON
     * @returns {string} JSON String der Tasks
     */
    exportTasks() {
        return JSON.stringify({
            name: this.name,
            tasks: this.getTasks(),
            exportedAt: new Date().toISOString()
        }, null, 2);
    }

    /**
     * Importiert Tasks aus JSON
     * @param {string} jsonData - JSON String mit Tasks
     * @param {boolean} merge - Ob Tasks zusammengeführt oder ersetzt werden sollen
     * @returns {number} Anzahl der importierten Tasks
     */
    importTasks(jsonData, merge = false) {
        try {
            const data = JSON.parse(jsonData);
            if (!_.isArray(data.tasks)) {
                throw new Error('Ungültiges Task-Format');
            }

            let tasks = merge ? this.getTasks() : [];
            const importedTasks = _.map(data.tasks, task => ({
                ...task,
                id: this.generateTaskId(), // Neue ID generieren um Konflikte zu vermeiden
                importedAt: new Date().toISOString()
            }));

            tasks = [...tasks, ...importedTasks];
            this.setTasks(tasks);

            return importedTasks.length;
        } catch (error) {
            console.error('Fehler beim Importieren der Tasks:', error);
            throw new Error(`Import fehlgeschlagen: ${error.message}`);
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

