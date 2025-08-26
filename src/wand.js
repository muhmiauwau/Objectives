
import { global_const, objEventSource, objEventTypes, deMuh }  from './base.js';
import { extension_settings, renderExtensionTemplateAsync } from '/scripts/extensions.js';



export async function initWand(){
     const button = await renderExtensionTemplateAsync(global_const.TEMPLATE_PATH, 'wand-button', {
        id: `${global_const.MODULE_NAME}WandButtom`,
        title: `${global_const.MODULE_NAME}`,
        desc: `${global_const.MODULE_NAME}`
    });
    $('#objective_wand_container').append(button);

    $(document).on("click", "#objective_wand_container", async () => {
        await objEventSource.emit(objEventTypes.WandClicked);
    })
}




