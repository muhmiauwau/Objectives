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
    const taskManager = new TaskManager(personsSelected);
    const incompleteTasks = taskManager.getIncompleteTasks();

    console.log("incompleteTasks", incompleteTasks)
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
            }
        ]
    })

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


   

    const myConfig = {
        data: {
            incompleteTasks: incompleteTasks
        },
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
             "#muhPanel_tasksList":{
                bind:"incompleteTasks",
                manifest:"Task",
                // list:'> div.flex-container',
                list:'<div class="wide100p"></div>',
                init: function ($form, form) {
                    if(form.data.incompleteTasks.length == 0){
                        $("#muhPanel_tasks").find('[data-id="empty_add"]').show()
                    }

                    $('#muhPanel_tasks').sortable({
                        items: '.my-form ',
                        // handle: 'button[data-id="drag"]',
                        placeholder: 'ui-sortable-placeholder',
                        opacity: 0.7,
                        cursor: 'grabbing',
                        axis: 'y', 
                        tolerance: 'pointer',
                        update: function (event, ui) {
                            deMuh("update")
                        }
                    })
                },
            },

            '[data-id="empty_add"]':{
                bind: function(task, value, $element){ 
                    if (value == null) return; 
                    deMuh("add", this.my.root())  
                    const data = taskManager.addTask("")
                    this.my.insert("#muhPanel_tasksList", data)
                    $element.hide()
                   
                },
                events:'click.my'
            }
        },

        Task:{
            init: function ($form){
                $form.html(taskHtml);
            },
            ui:{
                '[data-id="roundsInProgress"]':'roundsInProgress',
                '[data-id="task"]':'description',
                '[data-id="duration"]':{
                    bind: 'duration',
                    events:'change.my',
                    // recalc: '[data-id="drag"]'
                    
                },  
                '[data-id="delete"]':{
                    bind: function (task, value, $element){ 
                        if (value == null) return; 
                        if(taskManager.deleteTask(task.id)){
                            console.log(this.my.parent().data.incompleteTasks, this.my.parent().data.incompleteTasks.length);
                            
                            if(this.my.parent().data.incompleteTasks.length <= 1){
                                $("#muhPanel_tasks").find('[data-id="empty_add"]').show()
                            } 
                            this.my.remove();
                        }
                    },
                    events:'click.my'
                },
                 '[data-id="add"]':{
                    bind: function(task, value, $element) { 
                        if (value == null) return; 
                        const data = taskManager.addTask("", 5)
                        this.my.insert("#muhPanel_tasksList",  data)
                    },
                    events:'click.my'
                },
                '[data-id="task"]':{
                    bind: function(task, value, $element) { 
                        if (value == null) return task.description; 
                        $element.css("height","auto")
                        const newHeight = Math.min($element.prop('scrollHeight'), 100);
                        $element.css("height", newHeight + 'px')

                        taskManager.updateTask(task.id, {
                            description: value
                        })

                        task.description = value
                        return task.description
                    },
                    events:'keyup.my',
                    delay: 150
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
            }
        },
    }


    $panelContent = $(await renderExtensionTemplateAsync(global_const.TEMPLATE_PATH, 'panel-content-detail', templateData))
    $('.muhPanel-content').html($panelContent);
    $panelContent.my(myConfig);
}




