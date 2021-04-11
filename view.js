// ---- Define your dialogs  and panels here ----
effective_permission_panel = define_new_effective_permissions("effective-permission-panel", add_info_col = true, which_permissions = null)
user_select_field = define_new_user_select_field("user-select", "Choose a user", on_user_change = function(selected_user){
    $('#effective-permission-panel').attr('username', selected_user)
    $('#effective-permission-panel').attr('filepath', '/C/presentation_documents')
})
dialog = define_new_dialog('more-info', title='More Information')

let folder_elem = $(`
        <div class='folderHelp' id="help_div">
            <h3 id="help_header">
                Help
            </h3>
            <div class='folder_contents'>
             <h4>What does "inherited" mean?</h4>
                <p>If a file is contained within a folder, 
                it inherits all the permissions from this folder (called the "Parent").  </p>
                <p><i>For example: if a user has Read Permission for a Parent folder, 
                this user will also have Read Permission for all the files within the folder.
                </i></p>
                
            </div>
        </div>`)

// ---- Display file structure ----
// $('#sidepanel').append(user_select_field)
// $('#sidepanel').append(effective_permission_panel)
$('#sidepanel').append(folder_elem)
$('.perm_info').click(function(){
    $( "#more-info" ).dialog( "open" )
    // console.log($(this).attr('permission_name'))
    username = $('#effective-permission-panel').attr('username')
    filepath = $('#effective-permission-panel').attr('filepath')
    permission_name = $(this).attr('permission_name')

    file = path_to_file[filepath]
    user = all_users[username]

    // has_permission = allow_user_action(file, user, permission_name, explain_why = true)
    // explanation = get_explanation_text(has_permission)
    $('#more-info').html(permission_name)
})


// (recursively) makes and returns an html element (wrapped in a jquery object) for a given file object
function make_file_element(file_obj) {
    let file_hash = get_full_path(file_obj)

    if(file_obj.is_folder) {
        let folder_elem = $(`<div class='folder' id="${file_hash}_div">
            <h3 id="${file_hash}_header">
                <span class="oi oi-folder" id="${file_hash}_icon"/> ${file_obj.filename} 
                <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                    <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
                </button>
            </h3>
        </div>`)

        // append children, if any:
        if( file_hash in parent_to_children) {
            let container_elem = $("<div class='folder_contents'></div>")
            folder_elem.append(container_elem)
            for(child_file of parent_to_children[file_hash]) {
                let child_elem = make_file_element(child_file)
                container_elem.append(child_elem)
            }
        }
        return folder_elem
    }
    else {
        return $(`<div class='file'  id="${file_hash}_div">
            <span class="oi oi-file" id="${file_hash}_icon"/> ${file_obj.filename}
            <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
            </button>
        </div>`)
    }
}

for(let root_file of root_files) {
    let file_elem = make_file_element(root_file)
    $( "#filestructure" ).append( file_elem);    
}



// make folder hierarchy into an accordion structure
$('.folder').accordion({
    collapsible: true,
    heightStyle: 'content'
}) // TODO: start collapsed and check whether read permission exists before expanding?

// make folder hierarchy into an accordion structure
$('.folderHelp').accordion({
    collapsible: true,
    heightStyle: 'content',
    active: false
}) 


// -- Connect File Structure lock buttons to the permission dialog --

// open permissions dialog when a permission button is clicked
$('.permbutton').click( function( e ) {
    // Set the path and open dialog:
    let path = e.currentTarget.getAttribute('path');
    perm_dialog.attr('filepath', path)
    perm_dialog.dialog('open')
    //open_permissions_dialog(path)

    // Deal with the fact that folders try to collapse/expand when you click on their permissions button:
    e.stopPropagation() // don't propagate button click to element underneath it (e.g. folder accordion)
    // Emit a click for logging purposes:
    emitter.dispatchEvent(new CustomEvent('userEvent', { detail: new ClickEntry(ActionEnum.CLICK, (e.clientX + window.pageXOffset), (e.clientY + window.pageYOffset), e.target.id,new Date().getTime()) }))
});


// ---- Assign unique ids to everything that doesn't have an ID ----
$('#html-loc').find('*').uniqueId() 


//-----Add Permission to Lock Button -----
$('.permbutton').append('Permissions')  