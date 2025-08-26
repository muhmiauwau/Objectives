const { lodash } = SillyTavern.libs;
const _ = lodash

import { global_const, objEventSource, objEventTypes, deMuh }  from './base.js';
import { getContext, renderExtensionTemplateAsync } from '/scripts/extensions.js';
import { store }  from './store.js';
import { getPersonsOfcurrentChat }  from './utils.js';

import { TaskManager }  from './tasks.js';

import { eventSource, event_types} from '/script.js';

Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

let $panel;
let $panelContent;


const panelData = {
    var1: "kla",
    muhPanelPin: store.getUI("muhPanelPin")
}

const panelConfig = {
    headline: global_const.MODULE_NAME,
    testLabel: "label"
}




const myPanelConfig = {
    ui:{
        '#span-test': "var1",
        '#btn-addBlock': {
            bind: function(data, value) { 
                if (value == null) return;  
                // deMuh("btn-addBlock", data, value)
                data.var1 = "lalassss"
                this.my.trigger('#span-test', 'redraw');
            },
            events:'click.my'
        },
        '.floating_panel_close': {
            bind: (data, value) => { 
                if (value == null) return;  
                $panel.removeClass("open")
            },
            events:'click.my'
        },
        '#muhPanel_pin': {
            bind: (data, value) => { 
                if (value == null) return;  
                const state = !!(value[0] == "on")
                store.setUI("muhPanelPin", state)
                return state? ["on"]:[];
            },
            events:'change.my'
        },
    }
}





export async function initPanel(){   
    $panel = $(await renderExtensionTemplateAsync(global_const.TEMPLATE_PATH, 'panel',  {...panelConfig, ...panelData}))
    $('#movingDivs').append($panel);

    
    // deMuh("initPanel", $panel, panelData, {...panelConfig, ...panelData})
    $panel.my(myPanelConfig, panelData);

    objEventSource.on(objEventTypes.WandClicked, () => {
        $panel.addClass("open")
        // store.setUI("personsSelected", "")
        setPanelContent()
        // getPersonsOfcurrentChat()
    });


    eventSource.on(event_types.CHAT_CHANGED, () => {
        // store.setUI("personsSelected", "")
        setPanelContent()
    })


}

async function setPanelContent(){  
    const personsSelected = store.getUI("personsSelected")
    if(personsSelected.trim() === ""){
        listView(personsSelected)
    }else{
        detailView(personsSelected)
    }
 }





async function listView(personsSelected){    
    const persons = await getPersonsOfcurrentChat()
    
 

    const myData = {
        _personsValue: undefined,
        get personsValue(){
        
            return store.getUI("personsValue") || undefined
        },

        set personsValue(data){
            this._personsValue = data
            return store.setUI("personsValue", data)
        },
    }

    const templateData = {
        ext_name: global_const.MODULE_NAME,
        persons,
        personsSelected,
        viewHeadline:"List"
    }

    const myPanelContentConfig = {
        ui:{
            // '.muhPanel-personHead': {
            //     bind: (data, value) => { 
            //         if (value == null) return;  
            //         deMuh("personHead",data)
            //         $panel.removeClass("open")
            //     },
            //     events:'click.my'
            // }
        }
    }



    $panelContent = $(await renderExtensionTemplateAsync(global_const.TEMPLATE_PATH, 'panel-content-list',  templateData))
    $('.muhPanel-content').html($panelContent);

    $panelContent.my(myPanelContentConfig, myData);


    $(document).on("click", ".muhPanel-personHead", (e) => {
        const name = $(e.currentTarget).data("name")
        if(name){
            store.setUI("personsSelected", name)
            detailView(name)
        }
    })


  
}


async function detailView(personsSelected){ 
    


    const templateData = {
        viewHeadline: `${personsSelected}` ,
        aiPrompt: {
            label: `Ai Prompt`,
            desc: "Enter an objective and generate tasks. The AI will attempt to complete tasks autonomously"
        },
        aiPromptbtns: [
            {
                id: `muhPanel_aiPromptbtns_AutoGenerateTasks`,
                icon: "list-ol",
                label: `Auto-Generate Tasks`
            },
            {
                id: `muhPanel_aiPromptbtns_ClearTaskss`,
                icon: "eraser",
                label: `Clear Tasks`
            }
        ],
    }


    const myData = {
        viewHeadline: `${personsSelected}` 
    }

    const myConfig = {
        ui:{
            '.my-muhPanel-backtoList': {
                bind: (data, value) => { 
                    if (value == null) return; 
                    store.setUI("personsSelected", "")
                    setPanelContent()
                },
                events:'click.my'
            },
            '#muhPanel_aiPromptbtns_AutoGenerateTasks':{
                bind: (data, value) => { 
                    if (value == null) return; 
                    deMuh("muhPanel_aiPromptbtns_AutoGenerateTasks")
                    // store.setUI("personsSelected", "")
                    // setPanelContent()
                },
                events:'click.my'
            },
            '#muhPanel_aiPromptbtns_ClearTaskss':{
                bind: (data, value) => { 
                    if (value == null) return; 
                    deMuh("muhPanel_aiPromptbtns_ClearTaskss")
                    // store.setUI("personsSelected", "")
                    // setPanelContent()
                },
                events:'click.my'
            },
        }
    }


    $panelContent = $(await renderExtensionTemplateAsync(global_const.TEMPLATE_PATH, 'panel-content-detail', templateData))
    $('.muhPanel-content').html($panelContent);
//    deMuh("muhPanel_aiPromptbtns_AutoGenerateTasks", $panelContent)
    $panelContent.my(myConfig, myData);

    renderTasks(personsSelected)
}





async function renderTasks(personsSelected){ 
    const taskManager = new TaskManager(personsSelected);

    


    const templateData = {
        viewHeadline: taskManager.getName() ,
        
    }


const existingTasks = taskManager.getTasks();


    // const $tasks = $('#muhPanel_tasks')//.clone()
    const taskHtml = await renderExtensionTemplateAsync(global_const.TEMPLATE_PATH, 'task-item', {
        // task,
        buttons: [
            {
                id: "drag",
                icon: "grip-vertical",
            },
            {
                id: "delete",
                icon: "xmark",
            },
            {
                id: "add",
                icon: "plus",
            },
            {
                id: "branch",
                icon: "code-fork",
            }
        ]
    })
    // $('#muhPanel_tasksList').append(taskHtml)

    const myConfig = {
        data: {
            bla: "muh", 
            tasks: existingTasks
            
        },
        ui:{
            '#test':'bla',
            "#muhPanel_tasksList":{
                bind:"tasks",
                manifest:"task",
                list:'>div',
                init: function ($control) {
                    // $control.sortable({ handle: ".fi-list" });
                }
            },
        },
        
        task:{
           
            // data: { description:"", duration:"5", roundsInProgress: "0" },
            init: function ($form){
                $form.html(taskHtml);
            },
            ui:{
                // '#textarea': "task",
                '[data-id="roundsInProgress"]':'roundsInProgress',
                '[data-id="task"]':'description',
                '[data-id="duration"]':{
                    bind: 'duration',
                    events:'change.my',
                    // recalc: '[data-id="drag"]'
                    
                },  
                '[data-id="delete"]':{
                    bind: function (task, value){ 
                        if (value == null) return; 
                        if(taskManager.deleteTask(task.id)){
                                this.my.remove();
                        }
                    },
                    events:'click.my'
                },
                 '[data-id="add"]':{
                    bind: function(task, value, $element) { 
                        if (value == null) return; 
                        const data = taskManager.addTask("", 5)
                        // this.my.insert()
                        // this.my.insert("#muhPanel_tasksList", null,data)
                        $element.my("insert", "after", data);
                        console.log("sortable", data)

                        // taskManager.addTask("test task")
                        // return ""
                    },
                    events:'click.my'
                },
                '[data-id="task"]':{
                    bind: function(task, value, $element) { 
                      
                        if (value == null) return task.description; 
                        // const $element = this
                        $element.css("height","auto")
                        const newHeight = Math.min($element.prop('scrollHeight'), 100);
                        $element.css("height", newHeight + 'px')

                        taskManager.updateTask(task.id, {
                            description: value
                        })

                        task.description = value


                          console.log("sortable", this.container())

                        return task.description
                    },
                    events:'keyup.my',
                    delay: 150
                },
            }
        },
  
    }
     
    // $('#muhPanel_tasks').replaceWith($tasks)
     $('#muhPanel_tasks').my(myConfig);

    // if ($.fn.sortable) {

    //     setTimeout(() =>{
    //         deMuh("sortable")
    //         $('#muhPanel_tasks').sortable({
    //             items: '.my-form ',
    //             // handle: 'button[data-id="drag"]',
    //             placeholder: 'ui-sortable-placeholder',
    //             opacity: 0.7,
    //             cursor: 'grabbing',
    //             axis: 'y', 
    //             tolerance: 'pointer',
    //             update: function (event, ui) {
    //                 deMuh("update")
    //             }
    //         })

    //     },1000)
         
    // }

}

async function renderTask(taskManager, task){ 
    deMuh("renderTask")


    const templateData = {
        // task,
        buttons: [
            {
                id: "drag",
                icon: "grip-vertical",
            },
            {
                id: "delete",
                icon: "xmark",
            },
            {
                id: "add",
                icon: "plus",
            },
            {
                id: "branch",
                icon: "code-fork",
            }
        ]
    }

   const html = await renderExtensionTemplateAsync(global_const.TEMPLATE_PATH, 'task-item', templateData)
         
    
 deMuh("init all, $",task)
    const myConfig = {
        data: task,
        init: function ($form, form) {    
    
               deMuh("init all, $sss", $form)
            $form.html(html )      // Draw HTML
         
            
            $form.then (function () {              // Fade when start succeds
                deMuh("init all, $form", $form)
            });
        },
        ui:{
            '[data-id="roundsInProgress"]':'roundsInProgress',
            '[data-id="task"]':'task',
            '[data-id="duration"]':{
                bind: 'duration',
                events:'change.my',
                // recalc: '[data-id="drag"]'
                
            },  
            '[data-id="completed"]':{
                bind: (task, value, $element) => { 
                     if (value == null) return; 
                     deMuh("completed", value, $element)
                     const state = !!(value[0] == "on")
                     task.completed = state
                    return state? ["on"]:[];
                },
                events:'change.my',
                // recalc: '[data-id="drag"]'
                
            },  
            
            '[data-id="drag"]':{
                bind: (task, value, $element) => { 
                    //  if (task == null) return; 
                    deMuh("all", value, task, $('[data-id="duration"]').val())
                    // taskManager.updateTask(task.id, task)
                    // const {completed} = task
                    //   deMuh("all",   taskManager.updateTask(task.id, {completed}))
                },
                watch: '[data-id="completed"]'
            },   
            '[data-id="delete"]':{
                bind: (task, value, $element) => { 
                    if (value == null) return; 
                    if(taskManager.deleteTask(task.id)){
                        $element.parents(`#${task.id}`).remove()
                    }
                },
                events:'click.my'
            },
            '[data-id="duration"]':{
                bind: (data, value) => { 
                    if (value == null) return; 
                    deMuh("duration", data)
                    // store.setUI("personsSelected", "")
                    // setPanelContent()
                },
                events:'click.my'
            },
            '[data-id="add"]':{
                bind: (task, value, $element) => { 
                     if (value == null) return; 
                     taskManager.addTask("test task")
                },
                events:'click.my'
            },

            // '[data-id="task"]':{
            //     bind: (task, value, $element) => { 
            //         $element.css("height","auto")
            //         const newHeight = Math.min($element.prop('scrollHeight'), 100);
            //         $element.css("height", newHeight + 'px')

            //          if (value == null) return; 
            //          taskManager.updateTask(task.id, {
            //             description: value
            //          })
            //     },
            //     events:'keyup.my'
            // },
        }
    }


    deMuh("rsssenderExtensionTemplateAsync", task)
    
    // const $task = $(await renderExtensionTemplateAsync(global_const.TEMPLATE_PATH, 'task-item', templateData))
    deMuh("myConfig all", task)
    const $task = $("<div>dd</div>")

    $task.my(myConfig);
 deMuh("myConfig all", $task)

    $('.muhPanel-viewHeadline').append( $task)

    return $task
}

